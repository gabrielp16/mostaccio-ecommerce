import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

function TopNav() {
  const { totals } = useCart()
  const { user, isAdmin, isAuthenticated, logout } = useAuth()

  return (
    <header className="topnav sticky-top">
      <nav className="navbar py-3">
        <div className="container">
          <Link to="/" className="navbar-brand brand-wordmark text-dark">
            MOTACCIO BARBER CLUB
          </Link>

          <div className="d-flex flex-wrap align-items-center gap-2 ms-auto">
            <NavLink className="btn btn-sm btn-outline-dark" to="/">
              Inicio
            </NavLink>
            <NavLink className="btn btn-sm btn-outline-dark" to="/shop">
              Tienda
            </NavLink>
            <NavLink className="btn btn-dark rounded-pill px-3" to="/checkout">
              Carrito ({totals.itemCount})
            </NavLink>

            {isAdmin && (
              <NavLink className="btn btn-sm btn-warning" to="/admin">
                Admin
              </NavLink>
            )}

            {isAuthenticated ? (
              <button className="btn btn-sm btn-outline-dark" onClick={logout}>
                Salir ({user?.name || 'Usuario'})
              </button>
            ) : (
              <NavLink className="btn btn-sm btn-outline-dark" to="/login">
                Login
              </NavLink>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default TopNav
