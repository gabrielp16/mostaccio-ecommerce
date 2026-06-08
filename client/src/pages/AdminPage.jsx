import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import OrderStatusBadge from '../components/OrderStatusBadge.jsx'
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  getAdminProducts,
  updateAdminProduct,
} from '../services/api.js'

const initialProductForm = {
  title: '',
  description: '',
  category: '',
  image: '',
  price: '',
  stock: '',
}

function AdminPage() {
  const modalRef = useRef(null)
  const firstInputRef = useRef(null)
  const previousFocusedElementRef = useRef(null)

  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [productForm, setProductForm] = useState(initialProductForm)
  const [editingId, setEditingId] = useState('')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [adminProducts, adminOrders] = await Promise.all([getAdminProducts(), getAdminOrders()])
      setProducts(adminProducts)
      setOrders(adminOrders)
    } catch {
      setFeedback('No se pudieron cargar los datos de administracion.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  useEffect(() => {
    if (!isProductModalOpen) {
      return undefined
    }

    previousFocusedElementRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstInputRef.current?.focus()

    const trapFocus = (event) => {
      if (event.key !== 'Tab') {
        return
      }

      const modalNode = modalRef.current
      if (!modalNode) {
        return
      }

      const focusableElements = modalNode.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      )

      if (!focusableElements.length) {
        return
      }

      const firstFocusable = focusableElements[0]
      const lastFocusable = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        closeProductModal()
      }
    }

    window.addEventListener('keydown', trapFocus)
    window.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', trapFocus)
      window.removeEventListener('keydown', handleEscapeKey)
      if (previousFocusedElementRef.current instanceof HTMLElement) {
        previousFocusedElementRef.current.focus()
      }
    }
  }, [isProductModalOpen])

  const handleChange = (event) => {
    const { name, value } = event.target
    setProductForm((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setProductForm(initialProductForm)
    setEditingId('')
  }

  const openCreateModal = () => {
    resetForm()
    setIsProductModalOpen(true)
  }

  const closeProductModal = () => {
    setIsProductModalOpen(false)
    resetForm()
  }

  const handleEdit = (product) => {
    setEditingId(product._id)
    setProductForm({
      title: product.title,
      description: product.description,
      category: product.category,
      image: product.image,
      price: String(product.price),
      stock: String(product.stock),
    })
    setIsProductModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFeedback('')

    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      }

      if (editingId) {
        await updateAdminProduct(editingId, payload)
        setFeedback('Producto actualizado.')
      } else {
        await createAdminProduct(payload)
        setFeedback('Producto creado.')
      }

      resetForm()
      setIsProductModalOpen(false)
      await loadAdminData()
    } catch {
      setFeedback('No se pudo guardar el producto.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteAdminProduct(id)
      setFeedback('Producto eliminado.')
      await loadAdminData()
    } catch {
      setFeedback('No se pudo eliminar el producto.')
    }
  }

  return (
    <section className="py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h1 className="section-title m-0">Panel Admin</h1>
          <div className="d-flex gap-2">
            <button className="btn btn-dark" onClick={openCreateModal}>
              Nuevo producto
            </button>
            <button className="btn btn-outline-dark" onClick={loadAdminData}>
              Refrescar
            </button>
          </div>
        </div>

        {feedback && <p className="small fw-semibold">{feedback}</p>}

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <div className="row g-4 mb-4">
              <div className="col-12">
                <div className="floating-card p-4 h-100">
                  <h2 className="h4 mb-3">Pedidos recientes</h2>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Orden</th>
                          <th>Cliente</th>
                          <th>Estado</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-muted">
                              Sin pedidos todavia.
                            </td>
                          </tr>
                        ) : (
                          orders.map((order) => (
                            <tr key={order._id}>
                              <td>
                                <Link to={`/admin/orders/${order._id}`} className="fw-semibold text-decoration-none">
                                  {order.orderNumber}
                                </Link>
                              </td>
                              <td>{order.customer.name}</td>
                              <td>
                                <OrderStatusBadge status={order.status} />
                              </td>
                              <td>${order.total.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {isProductModalOpen && (
              <>
                <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" ref={modalRef}>
                  <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 rounded-4">
                      <div className="modal-header">
                        <h2 className="modal-title h5 mb-0">
                          {editingId ? 'Editar producto' : 'Nuevo producto'}
                        </h2>
                        <button
                          type="button"
                          className="btn-close"
                          aria-label="Close"
                          onClick={closeProductModal}
                        ></button>
                      </div>
                      <div className="modal-body">
                        <form className="d-flex flex-column gap-2" onSubmit={handleSubmit}>
                          <input
                            ref={firstInputRef}
                            required
                            name="title"
                            className="form-control"
                            placeholder="Titulo"
                            value={productForm.title}
                            onChange={handleChange}
                          />
                          <textarea
                            required
                            name="description"
                            rows="3"
                            className="form-control"
                            placeholder="Descripcion"
                            value={productForm.description}
                            onChange={handleChange}
                          />
                          <input
                            required
                            name="category"
                            className="form-control"
                            placeholder="Categoria"
                            value={productForm.category}
                            onChange={handleChange}
                          />
                          <input
                            required
                            name="image"
                            className="form-control"
                            placeholder="URL de imagen"
                            value={productForm.image}
                            onChange={handleChange}
                          />
                          <div className="row g-2">
                            <div className="col-6">
                              <input
                                required
                                type="number"
                                step="0.01"
                                min="0"
                                name="price"
                                className="form-control"
                                placeholder="Precio"
                                value={productForm.price}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="col-6">
                              <input
                                required
                                type="number"
                                min="0"
                                name="stock"
                                className="form-control"
                                placeholder="Stock"
                                value={productForm.stock}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="d-flex gap-2 mt-2">
                            <button className="btn btn-dark" type="submit">
                              {editingId ? 'Guardar cambios' : 'Crear producto'}
                            </button>
                            <button className="btn btn-outline-dark" type="button" onClick={closeProductModal}>
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-backdrop show" onClick={closeProductModal}></div>
              </>
            )}

            <div className="floating-card p-4">
              <h2 className="h4 mb-3">Productos</h2>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoria</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>{product.title}</td>
                        <td>{product.category}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>{product.stock}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-dark" onClick={() => handleEdit(product)}>
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(product._id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default AdminPage
