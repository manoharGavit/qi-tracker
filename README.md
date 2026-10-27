# Quality Inspection Tracker

Shop-floor app for logging fabric inspection defects, filtering the open list, resolving a defect with a note, and reading a severity summary. One supervisor signs in. The API is Express + SQLite. The UI is React 19, Vite, and shadcn/ui.

Demo login: `supervisor@arvind.com` / `Password@123`

## Setup (under 5 minutes)

### Docker

From this folder:

```powershell
docker compose up --build
```

Open http://localhost:8080.

`docker-compose.yml` sets `JWT_SECRET` to `local-dev-only-not-for-production-qi-tracker-secret`. That value is a **local demo placeholder only**. Replace it before this stack is shared or deployed. The SQLite file lives in the `sqlite-data` volume at `/app/data/app.db`. Migrations run on API startup, and the demo supervisor plus sample inspections are inserted only when the database has no users.

Stop and delete the database volume:

```powershell
docker compose down -v
```

### npm (two terminals)

Backend:

```powershell
cd task-backend
copy .env.example .env
npm ci
npm run dev
```

`.env.example` already contains a 32+ character `JWT_SECRET` placeholder. `task-backend/.env` is gitignored; do not commit it. The API listens on http://localhost:4000 and creates `task-backend/data/app.db`.

Frontend:

```powershell
cd task-frontend
npm ci
npm run dev
```

Open http://localhost:5173. Leave `VITE_API_BASE_URL` empty (see `task-frontend/.env.example`). Vite proxies `/api` to `http://localhost:4000`, so the browser talks to the same origin.

## API

Every success body is `{ "success": true, "data": ... }`.

Every failure body is `{ "success": false, "error": { "code": "...", "message": "...", "details": [] } }`. `details` is present on validation errors. Status codes: 400 malformed JSON, 401 missing or invalid token, 404 missing record or route, 409 already resolved, 422 validation, 500 unexpected.

All routes except health and login require `Authorization: Bearer <token>`.

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | `data.status` is `"ok"`. |
| `POST` | `/api/auth/login` | Body `{ "email", "password" }`. `200` returns `{ token, user: { id, email, name } }`. `401` for bad credentials. |
| `GET` | `/api/auth/me` | Current user `{ id, email, name }`. |
| `GET` | `/api/inspections` | Query: `severity`, `status` (comma-separated; repeatable), `from`, `to` (`YYYY-MM-DD`, inclusive), `sortBy` (`inspectionDate` \| `severity` \| `createdAt`), `order` (`asc` \| `desc`). Defaults: `sortBy=inspectionDate`, `order=desc`. Severity sort uses rank (Critical, Major, Minor). |
| `POST` | `/api/inspections` | `201`. Body: `inspectionDate`, `machineId` (1–50), `defectType`, `severity`, optional `remarks` (max 1000). |
| `GET` | `/api/inspections/summary` | `[{ severity, open, resolved, total }]` for Critical, Major, and Minor. |
| `GET` | `/api/inspections/:id` | `200` or `404`. |
| `PATCH` | `/api/inspections/:id/resolve` | Body `{ "resolutionNote" }` (trimmed, 3–500). `200`, `404` if missing, `409` if already resolved. |

Enums:

- Defect type: `Weave Defect`, `Shade Variation`, `Hole/Tear`, `Count Deviation`, `Other`
- Severity: `Critical`, `Major`, `Minor`
- Status: `Open`, `Resolved`

An inspection looks like:

```json
{
  "id": "uuid",
  "inspectionDate": "2026-10-27",
  "machineId": "LOOM-12",
  "defectType": "Weave Defect",
  "severity": "Major",
  "remarks": null,
  "status": "Open",
  "resolutionNote": null,
  "resolvedAt": null,
  "createdBy": "user-uuid",
  "createdAt": "2026-10-27T12:00:00.000Z",
  "updatedAt": "2026-10-27T12:00:00.000Z"
}
```

## Architecture decisions

**SQLite.** The tracker is a single-supervisor tool with one writer. A file database needs no extra process, migrations are plain SQL run on startup, and the Docker volume is the whole backup. `better-sqlite3` is synchronous, which keeps the repository layer free of connection pools.

**Layered backend.** Routes only mount middleware. Controllers translate HTTP into service calls. Services own rules such as “resolve once” (`409`). Repositories own SQL and the one snake_case-to-camelCase mapping. Tests build the same app against an in-memory database, so the HTTP contract is what gets exercised.

**TanStack Query.** Inspection list and summary are server state. Mutations invalidate those query keys, so the summary counts move when a defect is logged or resolved, without a second copy of the list in `useState`. Loading, error, and empty states hang off the query result.

**shadcn/ui.** Buttons, dialogs, drawers, and form controls come from Radix primitives with the project token set (primary `#0f6e56`). Compact controls use fixed token heights and flex centering. The resolve flow is a drawer on a phone and a dialog on a wider screen, from one component.

**URL filters.** Severity, status, date range, and sort live in the query string. A filtered list can be refreshed or shared, and the browser Back button restores the previous filter. The summary cards link into that same URL shape.

## Assumptions

- There is one role: the shop-floor supervisor. No admin, operator, or per-loom permissions.
- Inspection dates are calendar dates (`YYYY-MM-DD`) with no time of day. “Today” is the server’s local date when seeding, and the browser’s local date in the form.
- Resolving is irreversible. A second resolve returns `409`. There is no reopen.
- The `from` / `to` filter is inclusive on both ends, compared as dates rather than timestamps.

## Cut, and what more time would add

Offline support and an SAP webhook were left out. The shop floor in this version is assumed to have a connection to the API, and closing a defect stays inside this app.

With more time I would add cursor pagination on the list, an audit row for each resolve, photo attachments on the inspection, and a Playwright smoke test in CI against the compose stack. A second role would wait until a real permission matrix exists; inventing one now would only widen the API.
