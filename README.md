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
- Todos are persisted to `backend/data/todos.json` (file is overwritten on each change).
- PWA manifest and icons are in `frontend/public`.
- CORS origins are configurable via `CORS_ALLOWED_ORIGINS` (comma-separated); invalid origins cause backend startup to fail fast.
- With Docker Compose, pass the value from your shell, for example: `CORS_ALLOWED_ORIGINS='http://192.168.1.20:3000,https://todo.domain.com' docker compose up`.

Deployment recipes

- LAN Docker (direct access via IP:port):

```bash
CORS_ALLOWED_ORIGINS='http://192.168.1.20:3000' docker compose up -d
```

- Reverse proxy TLS (public domain terminates HTTPS at proxy):

```bash
CORS_ALLOWED_ORIGINS='https://todo.domain.com' docker compose up -d
```

- Combined (both local LAN and public domain allowed):

```bash
CORS_ALLOWED_ORIGINS='http://192.168.1.20:3000,https://todo.domain.com' docker compose up -d
```
