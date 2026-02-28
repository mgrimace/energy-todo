# Energy Todo

Local dev and production instructions for the Energy Todo app (Rust + Actix Web backend, React + Vite frontend).

Local development

- Run the frontend dev server:

```bash
cd frontend
npm install
npm run dev
```

- Run the backend (loads `backend/data/todos.json`):

```bash
cd backend
cargo run
```

Production (Docker)

Build and run the multi-stage image and single container:

```bash
docker compose build
docker compose up
```

For verbose build logs, use the global progress flag form:

```bash
docker compose --progress=plain build
```

Optional: copy the provided environment template and customize it:

```bash
cp .env.example .env
docker compose up -d
```

Notes

- The backend serves static files from `frontend/dist` when present.
- Local backend runs directly against `backend/data/todos.json`; Docker Compose bind-mounts the host `./energy-data` directory so you can inspect or back up `energy-data/todos.json` between runs.
- PWA manifest and icons are in `frontend/public`.
- The app expects the frontend and backend to share the same origin (served from the container on port 3000 or a reverse proxy that terminates HTTPS but forwards to the same origin).
- Compose runs the container as `${LOCAL_UID}:${LOCAL_GID}` (default `1000:1000`) so the bind-mounted data folder stays writable. Override these variables in `.env` if your user/group IDs differ.
