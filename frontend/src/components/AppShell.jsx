import { NavLink, Outlet } from 'react-router-dom'

export default function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/dashboard" className="brand" aria-label="TaskFlow home">
          <span className="brand-mark" aria-hidden="true">
            <span>TF</span>
          </span>
          TaskFlow
        </NavLink>
        <nav className="app-nav" aria-label="Main">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            Profile
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
