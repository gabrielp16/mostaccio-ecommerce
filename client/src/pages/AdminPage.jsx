import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import AdminLayout from '../components/AdminLayout.jsx'
import Snackbar from '../components/Snackbar.jsx'
import { useSnackbar } from '../hooks/useSnackbar.js'
import { getAdminOrders, getAdminProducts, getAdminRoles, getAdminUsers } from '../services/api.js'

function AdminPage() {
  const { hasPermission } = useAuth()

  const canReadProducts = hasPermission('products:read')
  const canCreateProducts = hasPermission('products:create')
  const canReadOrders = hasPermission('orders:read')
  const canReadUsers = hasPermission('users:read')
  const canReadRoles = hasPermission('roles:read')
  const canReadPermissions = hasPermission('permissions:read') || hasPermission('roles:read')

  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [rolesCount, setRolesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar()

  const loadAdminData = async () => {
    setLoading(true)
    closeSnackbar()

    try {
      const [productsResult, ordersResult, usersResult, rolesResult] = await Promise.allSettled([
        canReadProducts ? getAdminProducts() : Promise.resolve([]),
        canReadOrders ? getAdminOrders() : Promise.resolve([]),
        canReadUsers ? getAdminUsers() : Promise.resolve([]),
        canReadRoles ? getAdminRoles() : Promise.resolve([]),
      ])

      setProducts(productsResult.status === 'fulfilled' ? productsResult.value : [])
      setOrders(ordersResult.status === 'fulfilled' ? ordersResult.value : [])
      setUsersCount(usersResult.status === 'fulfilled' ? usersResult.value.length : 0)
      setRolesCount(rolesResult.status === 'fulfilled' ? rolesResult.value.length : 0)

      const hasError = [productsResult, ordersResult, usersResult, rolesResult].some(
        (result) => result.status === 'rejected',
      )

      if (hasError) {
        showSnackbar('Algunos modulos no pudieron cargarse por permisos o disponibilidad.', {
          variant: 'warning',
        })
      }
    } catch {
      showSnackbar('No se pudieron cargar los datos de administracion.', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [canReadOrders, canReadProducts, canReadRoles, canReadUsers])

  return (
    <AdminLayout
      title="Centro de Control"
      actions={
        <>
          <button className="btn btn-outline-dark" onClick={loadAdminData}>
            Actualizar resumen
          </button>
        </>
      }
    >

        <Snackbar
          open={snackbar.open}
          mode="toast"
          title={snackbar.title}
          variant={snackbar.variant}
          message={snackbar.message}
          autoHideDuration={snackbar.autoHideDuration}
          onClose={closeSnackbar}
        />

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <div className="row g-3 mb-4">
              {canReadOrders && (
                <div className="col-12 col-md-6 col-xl-3">
                  <div className="floating-card p-3 h-100">
                    <p className="small text-uppercase text-muted mb-2">Pedidos</p>
                    <p className="display-6 fw-bold mb-1">{orders.length}</p>
                    <p className="small mb-0 text-muted">Resumen disponible</p>
                  </div>
                </div>
              )}

              {canReadProducts && (
                <div className="col-12 col-md-6 col-xl-3">
                  <div className="floating-card p-3 h-100">
                    <p className="small text-uppercase text-muted mb-2">Productos</p>
                    <p className="display-6 fw-bold mb-1">{products.length}</p>
                    <p className="small mb-0 text-muted">Items en catalogo</p>
                  </div>
                </div>
              )}

              {canReadUsers && (
                <div className="col-12 col-md-6 col-xl-3">
                  <div className="floating-card p-3 h-100">
                    <p className="small text-uppercase text-muted mb-2">Usuarios</p>
                    <p className="display-6 fw-bold mb-1">{usersCount}</p>
                    <p className="small mb-0 text-muted">Cuentas registradas</p>
                  </div>
                </div>
              )}

              {canReadRoles && (
                <div className="col-12 col-md-6 col-xl-3">
                  <div className="floating-card p-3 h-100">
                    <p className="small text-uppercase text-muted mb-2">Roles</p>
                    <p className="display-6 fw-bold mb-1">{rolesCount}</p>
                    <p className="small mb-0 text-muted">Perfiles configurados</p>
                  </div>
                </div>
              )}

              {canReadPermissions && (
                <div className="col-12 col-md-6 col-xl-3">
                  <div className="floating-card p-3 h-100">
                    <p className="small text-uppercase text-muted mb-2">Permisos</p>
                    <p className="display-6 fw-bold mb-1">RBAC</p>
                    <p className="small mb-0 text-muted">Catalogo de acciones</p>
                  </div>
                </div>
              )}
            </div>

            <div className="floating-card p-3 mb-4">
              <p className="mb-0 text-muted">
                Este panel centraliza indicadores y accesos rapidos. La gestion operativa se realiza dentro de cada modulo.
              </p>
            </div>

            <div className="row g-3 mb-4">
              {canReadOrders && (
                <div className="col-12 col-lg-6">
                  <div className="floating-card p-3 h-100">
                    <h3 className="h6 mb-2">Modulo Pedidos</h3>
                    <p className="small text-muted mb-3">Accede al flujo completo de revision, filtros y detalle.</p>
                    <Link className="btn btn-sm btn-outline-dark" to="/admin/orders">
                      Abrir modulo de pedidos
                    </Link>
                  </div>
                </div>
              )}

              {canReadProducts && (
                <div className="col-12 col-lg-6">
                  <div className="floating-card p-3 h-100">
                    <h3 className="h6 mb-2">Modulo Productos</h3>
                    <p className="small text-muted mb-3">Gestiona catalogo, detalles y caracteristicas del inventario.</p>
                    <Link className="btn btn-sm btn-outline-dark" to="/admin/products">
                      {canCreateProducts ? 'Abrir modulo de productos' : 'Ver modulo de productos'}
                    </Link>
                  </div>
                </div>
              )}

              {canReadUsers && (
                <div className="col-12 col-lg-6">
                  <div className="floating-card p-3 h-100">
                    <h3 className="h6 mb-2">Modulo Usuarios</h3>
                    <p className="small text-muted mb-3">Administra cuentas, estado de acceso y asignaciones.</p>
                    <Link className="btn btn-sm btn-outline-dark" to="/admin/users">
                      Abrir modulo de usuarios
                    </Link>
                  </div>
                </div>
              )}

              {canReadRoles && (
                <div className="col-12 col-lg-6">
                  <div className="floating-card p-3 h-100">
                    <h3 className="h6 mb-2">Modulo Roles</h3>
                    <p className="small text-muted mb-3">Configura permisos y estructura de acceso por perfil.</p>
                    <Link className="btn btn-sm btn-outline-dark" to="/admin/roles">
                      Abrir modulo de roles
                    </Link>
                  </div>
                </div>
              )}

              {canReadPermissions && (
                <div className="col-12 col-lg-6">
                  <div className="floating-card p-3 h-100">
                    <h3 className="h6 mb-2">Modulo Permisos</h3>
                    <p className="small text-muted mb-3">Define y mantiene el catalogo de permisos para roles.</p>
                    <Link className="btn btn-sm btn-outline-dark" to="/admin/permissions">
                      Abrir modulo de permisos
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {!canReadOrders && !canReadProducts && !canReadUsers && !canReadRoles && !canReadPermissions && (
              <div className="floating-card p-4">
                <p className="mb-0 text-muted">
                  Tu cuenta no tiene permisos de lectura para modulos administrativos.
                </p>
              </div>
            )}
          </>
        )}
    </AdminLayout>
  )
}

export default AdminPage
