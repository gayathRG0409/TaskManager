# TaskFlow — Project Requirements

## 1. Product goal

TaskFlow is a personal Kanban task manager. Users register, sign in, create tasks, and drag cards across **To do → Doing → Done**.

## 2. Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | User can register with name, email, password (min 6 chars) | Must |
| F2 | User can log in and receive a JWT session | Must |
| F3 | Protected routes: Dashboard, Profile (redirect if unauthenticated) | Must |
| F4 | Create task with title, optional notes, status, due date | Must |
| F5 | List tasks in a 3-column Kanban board | Must |
| F6 | Drag-and-drop move between columns (persist status + position) | Must |
| F7 | Delete a task | Must |
| F8 | Profile shows live task stats (todo / doing / done) | Must |
| F9 | User can update name, email, password | Must |
| F10 | Logout clears session | Must |
| F11 | Data persists in Supabase Postgres | Must |

## 3. Non-functional requirements

| ID | Requirement |
|----|-------------|
| N1 | Mobile-first responsive UI |
| N2 | Clear professional color system (status colors readable) |
| N3 | API errors return JSON `{ error }` with proper HTTP status |
| N4 | Passwords stored hashed (bcrypt); JWT secret via env |
| N5 | Service role key never shipped to the frontend |
| N6 | CORS enabled for local Vite frontend |

## 4. Screens

| Screen | Route | Notes |
|--------|-------|-------|
| Login | `/login` | Email + password |
| Register | `/register` | Name, email, password |
| Dashboard | `/dashboard` | Stats + Kanban + Add Task modal |
| Profile | `/profile` | Avatar, stats, edit form, logout |

## 5. Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React.js + Vite + React Router + @dnd-kit |
| Backend | Node.js + Express.js + JWT + bcrypt |
| Database | Supabase (PostgreSQL) |

## 6. Data model

### profiles
- `id` (uuid), `name`, `email` (unique), `password_hash`, `created_at`

### tasks
- `id` (uuid), `user_id` → profiles, `title`, `notes`, `status` (`todo` \| `doing` \| `done`), `due`, `position`, timestamps

## 7. API (summary)

See [api.md](./api.md) and `backend/README.md`.

## 8. Setup checklist

1. Create a Supabase project  
2. Run `docs/supabase-schema.sql` in the SQL editor  
3. Copy `backend/.env.example` → `backend/.env`  
4. Add `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`  
5. `npm install` + `npm run dev` in `backend/` and `frontend/`  

Supabase env vars are required; the API exits on startup if they are missing.
