import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { ADMIN_MODULES, canAccessAdminModule } from '../config/adminModules.js'

function AdminSidebar() {
  const { hasPermission } = useAuth()
  const location = useLocation()

  const visibleModules = ADMIN_MODULES.filter((module) => canAccessAdminModule(module, hasPermission))

  const isActive = (module) => {
    if (module.id === 'dashboard') {
      return location.pathname === '/admin'
    }

    return location.pathname.startsWith(module.matchPath)
  }

  return (
    <aside className="admin-sidebar floating-card p-3">
      <p className="small text-uppercase text-muted mb-2">Modulos</p>
      <nav className="d-flex flex-column gap-2">
        {visibleModules.map((module) => (
          <Link
            key={module.id}
            className={`admin-nav-link ${isActive(module) ? 'active' : ''}`}
            to={module.to}
          >
            {module.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default AdminSidebar
