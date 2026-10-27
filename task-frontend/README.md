# Quality Inspection Tracker — frontend

React 19 + Vite app. Full setup, API reference, and architecture notes are in the [root README](../README.md).

To run this app on its own, start the API first (`npm run dev` in `task-backend`, port 4000), then:

```powershell
cd task-frontend
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to `http://localhost:4000`. Leave `VITE_API_BASE_URL` empty (see `.env.example`).

Sign in with `supervisor@arvind.com` / `Password@123`.
