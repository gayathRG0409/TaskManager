# Dynamic API

Express backend powers auth, profile, Kanban board, and task CRUD.

## Flow

1. Register / login → JWT  
2. Frontend stores token  
3. `GET /api/board` loads Kanban columns  
4. Drag card → `PATCH /api/tasks/:id/move` updates `status` + `position`  
5. Data persists in **Supabase Postgres**

## Main routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/board` | Kanban columns |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id/move` | Drag-and-drop move |
| GET | `/api/users/me` | Profile + stats |

See `backend/README.md` for the full list and [supabase-setup.md](./supabase-setup.md) for database setup.
