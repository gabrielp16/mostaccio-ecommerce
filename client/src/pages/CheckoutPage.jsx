import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { createOrder } from '../services/api.js'

function CheckoutPage() {
  const { cart, totals, removeFromCart, updateQuantity, clearCart } = useCart()
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    address: '',
  })
  const [feedback, setFeedback] = useState('')
  const [sending, setSending] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setCustomer((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!cart.length) {
      setFeedback('Tu carrito esta vacio. Agrega productos antes de comprar.')
      return
    }

    setSending(true)
    setFeedback('')

    try {
      const payload = {
        customer,
        items: cart.map((item) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
      }

      const order = await createOrder(payload)
      clearCart()
      setFeedback(`Pedido ${order.orderNumber} creado correctamente.`)
      setCustomer({ name: '', email: '', address: '' })
    } catch {
      setFeedback('No se pudo completar la compra en este momento.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="py-5">
      <div className="container">
        <h1 className="section-title mb-4">Checkout</h1>

        <div className="checkout-grid">
          <div className="floating-card p-4">
            <h2 className="h4 mb-3">Tus productos</h2>
            {cart.length === 0 ? (
              <p className="text-muted mb-0">No hay productos en el carrito.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {cart.map((item) => (
                  <div key={item.productId} className="border rounded-3 p-3 d-flex flex-wrap gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      width="70"
                      height="70"
                      style={{ objectFit: 'cover', borderRadius: '0.5rem' }}
                    />
                    <div className="flex-grow-1">
                      <p className="fw-bold mb-1">{item.title}</p>
                      <p className="small mb-2">${item.price.toFixed(2)}</p>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          className="form-control form-control-sm"
                          style={{ width: '80px' }}
                          onChange={(event) =>
                            updateQuantity(item.productId, Number(event.target.value) || 1)
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="floating-card p-4">
            <h2 className="h4 mb-3">Datos de envio</h2>
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <input
                required
                name="name"
                className="form-control"
                placeholder="Nombre completo"
                value={customer.name}
                onChange={handleChange}
              />
              <input
                required
                type="email"
                name="email"
                className="form-control"
                placeholder="Correo"
                value={customer.email}
                onChange={handleChange}
              />
              <textarea
                required
                name="address"
                className="form-control"
                rows="3"
                placeholder="Direccion"
                value={customer.address}
                onChange={handleChange}
              />

              <div className="border rounded-3 p-3 small bg-light">
                <div className="d-flex justify-content-between mb-1">
                  <span>Subtotal</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Envio</span>
                  <span>${totals.shipping.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-dark btn-lg" disabled={sending}>
                {sending ? 'Procesando...' : 'Confirmar compra'}
              </button>
            </form>

            {feedback && <p className="mt-3 mb-0 small fw-semibold">{feedback}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CheckoutPage
