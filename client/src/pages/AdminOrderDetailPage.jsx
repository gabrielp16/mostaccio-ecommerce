import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout.jsx'
import OrderStatusBadge, {
  ORDER_STATUS_OPTIONS,
  getOrderStatusLabel,
} from '../components/OrderStatusBadge.jsx'
import Snackbar from '../components/Snackbar.jsx'
import { useSnackbar } from '../hooks/useSnackbar.js'
import { getAdminOrderById, updateAdminOrderStatus } from '../services/api.js'

function AdminOrderDetailPage() {
  const { orderId } = useParams()
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [savingStatus, setSavingStatus] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      setLoading(true)
      closeSnackbar()
      setLoadError('')
      try {
        const data = await getAdminOrderById(orderId)
        setOrder(data)
        setSelectedStatus(data.status)
      } catch {
        setLoadError('No se pudo cargar el detalle del pedido.')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  const handleUpdateStatus = async () => {
    if (!order) {
      return
    }

    setSavingStatus(true)
    closeSnackbar()

    try {
      const updatedOrder = await updateAdminOrderStatus(order._id, selectedStatus)
      setOrder(updatedOrder)
      showSnackbar('Estado actualizado correctamente.', { variant: 'success' })
    } catch {
      showSnackbar('No se pudo actualizar el estado del pedido.', { variant: 'error' })
    } finally {
      setSavingStatus(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Detalle de Pedido">
          <p>Cargando detalle del pedido...</p>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout title="Detalle de Pedido">
          <p className="mb-3">{loadError || 'Pedido no encontrado.'}</p>
          <Link to="/admin/orders" className="btn btn-outline-dark">
            Volver a pedidos
          </Link>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Detalle de Pedido"
      actions={
        <Link to="/admin/orders" className="btn btn-outline-dark">
          Volver a pedidos
        </Link>
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
          <p className="mb-1">
            <strong>Orden:</strong> {order.orderNumber}
          </p>
          <p className="mb-1">
            <strong>Estado:</strong>{' '}
            <OrderStatusBadge status={order.status} />
          </p>
          <p className="mb-1">
            <strong>Cliente:</strong> {order.customer.name}
          </p>
          <p className="mb-1">
            <strong>Correo:</strong> {order.customer.email}
          </p>
          <p className="mb-0">
            <strong>Direccion:</strong> {order.customer.address}
          </p>

          <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
            <label htmlFor="orderStatus" className="fw-semibold mb-0">
              Estado
            </label>
            <select
              id="orderStatus"
              className="form-select"
              style={{ maxWidth: '220px' }}
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {getOrderStatusLabel(status)}
                </option>
              ))}
            </select>
            <button className="btn btn-dark" onClick={handleUpdateStatus} disabled={savingStatus}>
              {savingStatus ? 'Guardando...' : 'Actualizar estado'}
            </button>
          </div>
        </div>

        <div className="floating-card p-4">
          <h2 className="h4 mb-3">Items</h2>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={`${item.productId}-${index}`}>
                    <td>{item.title}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex flex-column align-items-end gap-1 mt-3">
            <p className="mb-0">Subtotal: ${order.subtotal.toFixed(2)}</p>
            <p className="mb-0">Envio: ${order.shipping.toFixed(2)}</p>
            <p className="mb-0 fw-bold">Total: ${order.total.toFixed(2)}</p>
          </div>
        </div>
    </AdminLayout>
  )
}

export default AdminOrderDetailPage
