# Quality Inspection Tracker — API

Express + TypeScript + SQLite. Full setup, API reference, and architecture notes are in the [root README](../README.md).

```powershell
cd task-backend
copy .env.example .env
npm ci
npm run dev
```

The API listens on http://localhost:4000. Migrations run on startup, and the demo supervisor is seeded when the database has no users. `JWT_SECRET` in `.env` must be at least 32 characters. `.env` is gitignored.
