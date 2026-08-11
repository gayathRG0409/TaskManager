# Supabase setup

TaskFlow’s Express API stores all data in **Supabase Postgres**. Supabase env vars are required.

## Connect

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard open **SQL Editor** → New query.
3. Paste and run [`supabase-schema.sql`](./supabase-schema.sql).
4. Go to **Project Settings → API** and copy:
   - Project URL → `SUPABASE_URL`
   - Secret key (`sb_secret_...`) → `SUPABASE_SECRET_KEY`  
     or classic `service_role` → `SUPABASE_SERVICE_ROLE_KEY`  
     (keep this secret; never put it in the frontend)
5. Update `backend/.env`:

```env
PORT=4000
JWT_SECRET=change-me-to-a-long-random-string
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=your-secret-key
```

6. Restart the backend. Check:

```bash
curl http://localhost:4000/api/health
```

You should see `"storage": "supabase"`. If keys are missing, the API exits on startup.

## Architecture

```
React (Vite)  →  Express API (JWT)  →  Supabase Postgres
```

Auth stays on Express (bcrypt + JWT). Supabase is used as the database via the **service role / secret** client on the server only.
