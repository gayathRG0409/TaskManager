# TaskManager (TaskFlow)

Full-stack Kanban task manager with auth, drag-and-drop, and Supabase storage.

## Stack

- **Frontend:** React.js (Vite) — Kanban board UI
- **Backend:** Node.js + Express.js — auth, board, tasks API
- **Database:** Supabase (PostgreSQL)

## Requirements

See [`docs/requirements.md`](docs/requirements.md) for the full checklist.

## Run locally

1. Create a Supabase project and run [`docs/supabase-schema.sql`](docs/supabase-schema.sql)
2. Copy `backend/.env.example` → `backend/.env` and set URL + secret key

**Terminal 1 — Backend**

```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

1. Register / login  
2. Drag cards across **To do / Doing / Done**  
3. Edit profile — stats update from real tasks  

Guide: [`docs/supabase-setup.md`](docs/supabase-setup.md)

## API highlights

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/board` | Kanban columns |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id/move` | Drag-and-drop move |
| GET | `/api/users/me` | Profile + stats |

Full docs: `backend/README.md`
