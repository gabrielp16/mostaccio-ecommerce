import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout.jsx'
import OrderStatusBadge, {
  ORDER_STATUS_OPTIONS,
  getOrderStatusLabel,
} from '../components/OrderStatusBadge.jsx'
import Snackbar from '../components/Snackbar.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { useSnackbar } from '../hooks/useSnackbar.js'
import { getAdminOrders, updateAdminOrderStatus } from '../services/api.js'

function AdminOrdersPage() {
  const { hasPermission } = useAuth()
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar()

  const canUpdateStatus = hasPermission('orders:update')

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadOrders = async () => {
    setLoading(true)
    closeSnackbar()

    try {
      const data = await getAdminOrders()
      setOrders(data)
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudieron cargar las ordenes.', {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' ? true : order.status === statusFilter

      if (!normalizedQuery) {
        return matchesStatus
      }

      const searchable = `${order.orderNumber} ${order.customer?.name || ''} ${order.customer?.email || ''}`
        .toLowerCase()
        .trim()

      return matchesStatus && searchable.includes(normalizedQuery)
    })
  }, [orders, query, statusFilter])

  const handleStatusChange = async (orderId, nextStatus) => {
    if (!canUpdateStatus) {
      showSnackbar('No tienes permisos para actualizar estados de orden.', { variant: 'warning' })
      return
    }

    setSavingId(orderId)
    closeSnackbar()

    try {
      const updated = await updateAdminOrderStatus(orderId, nextStatus)
      setOrders((current) => current.map((item) => (item._id === orderId ? updated : item)))
      showSnackbar('Estado de orden actualizado.', { variant: 'success' })
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudo actualizar el estado.', {
        variant: 'error',
      })
    } finally {
      setSavingId('')
    }
  }

  return (
    <AdminLayout
      title="Gestion de Ordenes"
      actions={
        <button className="btn btn-outline-dark" onClick={loadOrders}>
          Refrescar
        </button>
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

      <div className="floating-card p-4 mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-8">
            <label htmlFor="orderSearch" className="form-label small fw-semibold mb-1">
              Buscar orden
            </label>
            <input
              id="orderSearch"
              className="form-control"
              placeholder="Numero de orden, nombre o correo"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="statusFilter" className="form-label small fw-semibold mb-1">
              Filtrar por estado
            </label>
            <select
              id="statusFilter"
              className="form-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Todos</option>
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {getOrderStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="floating-card p-4">
        <h2 className="h4 mb-3">Ordenes</h2>

        {loading ? (
          <p>Cargando ordenes...</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Actualizar estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-muted">
                      No hay ordenes para el filtro aplicado.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <Link to={`/admin/orders/${order._id}`} className="fw-semibold text-decoration-none">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>{order.customer?.name}</span>
                          <span className="small text-muted">{order.customer?.email}</span>
                        </div>
                      </td>
                      <td>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td>${order.total.toFixed(2)}</td>
                      <td style={{ minWidth: '180px' }}>
                        <select
                          className="form-select form-select-sm"
                          value={order.status}
                          disabled={!canUpdateStatus || savingId === order._id}
                          onChange={(event) => handleStatusChange(order._id, event.target.value)}
                        >
                          {ORDER_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {getOrderStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <Link to={`/admin/orders/${order._id}`} className="btn btn-sm btn-outline-dark">
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminOrdersPage
