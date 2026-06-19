import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import AdminLayout from '../components/AdminLayout.jsx'
import Snackbar from '../components/Snackbar.jsx'
import { useSnackbar } from '../hooks/useSnackbar.js'
import { getAdminOrders, getAdminProducts, getAdminUsers } from '../services/api.js'

function AdminPage() {
  const { hasPermission } = useAuth()

  const canReadProducts = hasPermission('products:read')
  const canReadOrders = hasPermission('orders:read')
  const canReadUsers = hasPermission('users:read')
  const canReadRoles = hasPermission('roles:read')
  const canReadPermissions = hasPermission('permissions:read') || hasPermission('roles:read')

  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar()

  const loadAdminData = async () => {
    setLoading(true)
    closeSnackbar()

    try {
      const [productsResult, ordersResult, usersResult] = await Promise.allSettled([
        canReadProducts ? getAdminProducts() : Promise.resolve([]),
        canReadOrders ? getAdminOrders() : Promise.resolve([]),
        canReadUsers ? getAdminUsers() : Promise.resolve([]),
      ])

      setProducts(productsResult.status === 'fulfilled' ? productsResult.value : [])
      setOrders(ordersResult.status === 'fulfilled' ? ordersResult.value : [])
      setUsersCount(usersResult.status === 'fulfilled' ? usersResult.value.length : 0)

      const hasError = [productsResult, ordersResult, usersResult].some((result) => result.status === 'rejected')

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
  }, [canReadOrders, canReadProducts, canReadUsers])

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
