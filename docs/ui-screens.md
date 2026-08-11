# UI screens

Screen designs implemented in React (mobile-first).

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Login | `/login` | Email + password sign-in |
| Register | `/register` | Name, email, password signup |
| Dashboard | `/dashboard` | Stats, Kanban board, FAB |
| Add Task Modal | overlay on dashboard | Create task (title, notes, status, due) |
| Profile | `/profile` | Account info, stats, logout |

## Design system

- Brand: **TaskFlow**
- Fonts: Bricolage Grotesque (brand/headings), Figtree (UI)
- Accent: teal `#0f766e`
- Status: slate (todo), blue (doing), green (done)
- Cards: white surface, colored left rail, status + due badges
- Mobile first: single column, bottom sheet modal under 640px; centered dialog on desktop

## Stack

- Frontend: React.js (Vite)
- Backend: Node.js + Express.js
- Database: Supabase / PostgreSQL

## Preview

```bash
cd frontend
npm run dev
```

Open `/login`, then continue to dashboard after auth.
