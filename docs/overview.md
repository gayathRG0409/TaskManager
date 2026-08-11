# Overview

TaskFlow is a full-stack Kanban task manager with auth, profile, drag-and-drop board, and Supabase storage.

## Stack

| Layer | Location | Tech |
|-------|----------|------|
| Frontend | `frontend/` | React.js + Vite + @dnd-kit |
| Backend | `backend/` | Node.js + Express.js + JWT |
| Database | Supabase | PostgreSQL |

## Docs

| Doc | Purpose |
|-----|---------|
| [requirements.md](./requirements.md) | Functional & non-functional requirements |
| [api.md](./api.md) | API flow summary |
| [ui-screens.md](./ui-screens.md) | Screens & design system |
| [supabase-setup.md](./supabase-setup.md) | How to connect Supabase |
| [supabase-schema.sql](./supabase-schema.sql) | SQL to run in Supabase |

## What works

- Register / login / logout (JWT)
- Protected dashboard & profile
- Create, move, delete tasks
- Profile edit + live task stats
- All data persisted in Supabase Postgres
