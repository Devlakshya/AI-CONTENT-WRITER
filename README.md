# AI Content Writer SaaS

AI content generation app built with FastAPI, SQLAlchemy, React, TypeScript, Tailwind CSS, and Docker. It can run fully local with a bundled small GGUF model, so no OpenAI or other API key is required.

## Project Structure

- `backend/` - FastAPI backend (auth, content generation, billing, RAG, agents, local AI provider).
- `frontend/` - React + TypeScript UI with Vite, Tailwind CSS, and React Query.
- `backend/models/` - Local GGUF model files (ignored by git).
- `docker-compose.yml` - Optional PostgreSQL + backend + frontend stack.
- `.env` - Local configuration (already present in this project).

## Requirements

- Python 3.11+ (this project has a `.venv` already)
- Node.js 20+ and npm
- Docker Desktop (only if you want to run PostgreSQL/containers)

## Run Locally (recommended)

Open **two terminals** and keep both running.

### 1. Backend

From the project root:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
Set-Location backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If you do not have a virtual environment yet:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
```

The backend must be started from the `backend/` folder. This makes the SQLite database (`backend/app.db`) and the local model path (`backend/models/...gguf`) resolve correctly.

Check that it is running:

- Health: http://127.0.0.1:8000/api/health
- Swagger docs: http://127.0.0.1:8000/docs

### 2. Frontend

In the second terminal, from the project root:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open http://localhost:3000 and register a new account.

The frontend expects the backend at `http://localhost:8000` by default. If you change the backend host or port, create `frontend/.env` with:

```env
VITE_API_ORIGIN=http://localhost:8000
VITE_API_URL=http://localhost:8000/api/v1
```

Restart `npm run dev` after changing environment variables.

## Local AI (no API key)

The project is configured for local generation by default:

```env
AI_PROVIDER=local
LOCAL_MODEL_PATH=models/qwen2.5-0.5b-instruct-q4_k_m.gguf
LOCAL_N_CTX=2048
LOCAL_N_THREADS=4
```

The model is loaded from `backend/models/` the first time you generate content, so the first request can take a while. No OpenAI key is needed. If the GGUF file is missing, download a small instruct model such as Qwen2.5-0.5B-Instruct Q4_K_M and place it at `backend/models/`, or update `LOCAL_MODEL_PATH` in `.env`.

`AI_PROVIDER=openai` is only needed if you want to use an OpenAI key.

## Environment

Local `.env` settings that matter most:

```env
DATABASE_URL=sqlite+aiosqlite:///./app.db
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
AI_PROVIDER=local
```

For PostgreSQL, set `DATABASE_URL` to `postgresql+asyncpg://...` and start the database.

## Run with Docker (optional)

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Frontend: http://localhost:3000
Backend: http://localhost:8000
PostgreSQL: `localhost:5432`

The Docker setup uses the `.env` file, so make sure `DATABASE_URL` points to the `db` service when using Compose.

## Tests

From the `backend/` folder:

```powershell
..\.venv\Scripts\python.exe -m pytest
```

## Troubleshooting

### "Cannot connect to API: Was there a typo in the url or port?"

This means the frontend cannot reach the backend. Check the following:

1. The backend terminal is running without errors and `http://127.0.0.1:8000/api/health` returns `{"status":"ok"}`.
2. The frontend is running at http://localhost:3000 (not just opened as a file). Use `localhost`, not `127.0.0.1:3000`: Vite only listens on `localhost` by default. To allow `127.0.0.1:3000`, run `npm run dev -- --host 127.0.0.1`.
3. You are using the same host in the browser and API settings. If the backend runs on `127.0.0.1`, set `VITE_API_ORIGIN=http://127.0.0.1:8000` and `VITE_API_URL=http://127.0.0.1:8000/api/v1` in `frontend/.env`, then restart Vite.
4. Port 8000 is not already used by another process. On Windows:

   ```powershell
   Get-NetTCPConnection -LocalPort 8000 -State Listen
   ```

   If another backend is already running, either use it or stop it before starting a new one.
5. `CORS_ORIGINS` in `.env` includes the frontend URL (for example `http://localhost:3000`).
6. After changing `.env` or Vite environment variables, restart both servers.

### Login fails with 401

Use the **email** as the username when logging in. Register first, then sign in with the same email and password.

### Generation fails locally

- Confirm `AI_PROVIDER=local`.
- Confirm the model file exists at `backend/models/qwen2.5-0.5b-instruct-q4_k_m.gguf`.
- Start the backend from the `backend/` folder.
- The first generation loads the model and is slower than later requests.

## API Overview

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Content: `/api/v1/content`, `/api/v1/content/generate`
- Dashboard: `/api/v1/dashboard/overview`
- Billing: `/api/v1/billing/*`
- Users: `/api/v1/users/me`
- RAG: `/api/v1/rag/*`
- Models: `/api/models/*`
