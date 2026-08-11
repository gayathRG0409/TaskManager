# TaskFlow Backend

Express API for auth, profile, tasks, and Kanban board moves. Data is stored in **Supabase Postgres** only.

## Run

```bash
cd backend
npm install
cp .env.example .env   # fill Supabase URL + secret key
npm run dev
```

API: `http://localhost:4000`

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Default `4000` |
| `JWT_SECRET` | Yes (prod) | Signing secret for access tokens |
| `SUPABASE_URL` | Yes | Project URL |
| `SUPABASE_SECRET_KEY` | Yes* | Server-only secret (`sb_secret_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Classic service_role JWT (alternative to secret key) |

\* Provide either `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`. The API exits on startup if Supabase is not configured.

## Endpoints

### Health
- `GET /api/health` → includes `storage: "supabase"`

### Auth
- `POST /api/auth/register` `{ name, email, password }`
- `POST /api/auth/login` `{ email, password }`
- `GET /api/auth/me` (Bearer token)

### Profile
- `GET /api/users/me` → `{ user, stats }`
- `PATCH /api/users/me` `{ name, email, password? }`

### Board (Kanban)
- `GET /api/board` → columns with tasks + totals

### Tasks
- `GET /api/tasks`
- `POST /api/tasks` `{ title, notes?, status?, due? }`
- `PATCH /api/tasks/:id` `{ title?, notes?, status?, due?, position? }`
- `PATCH /api/tasks/:id/move` `{ status, position? }` ← drag-and-drop
- `DELETE /api/tasks/:id`

## Storage

- `backend/src/store/supabaseStore.js` — Supabase client

Schema: `../docs/supabase-schema.sql`  
Setup: `../docs/supabase-setup.md`
