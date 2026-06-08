const ORDER_STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered']

function getOrderStatusBadgeClass(status) {
  if (status === 'paid') return 'text-bg-primary'
  if (status === 'shipped') return 'text-bg-warning'
  if (status === 'delivered') return 'text-bg-success'
  return 'text-bg-secondary'
}

function getOrderStatusLabel(status) {
  if (status === 'paid') return 'Pagado'
  if (status === 'shipped') return 'Enviado'
  if (status === 'delivered') return 'Entregado'
  return 'Pendiente'
}

function OrderStatusBadge({ status }) {
  return <span className={`badge ${getOrderStatusBadgeClass(status)}`}>{getOrderStatusLabel(status)}</span>
}

export { ORDER_STATUS_OPTIONS, getOrderStatusLabel }
export default OrderStatusBadge
