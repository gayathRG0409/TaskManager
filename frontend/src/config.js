const PUBLIC_API_URL = 'https://taskmanager-d6v7.onrender.com'

/** Set `true` to call Render while running `npm run dev` (skip local backend). */
const USE_PUBLIC_API_IN_DEV = false

const apiBase =
  import.meta.env.PROD || USE_PUBLIC_API_IN_DEV ? PUBLIC_API_URL : ''

export const config = {
  /** Empty in local = same-origin `/api` (Vite proxies to localhost:4000). */
  apiBase: apiBase.replace(/\/$/, ''),
}
