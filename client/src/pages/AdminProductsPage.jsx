import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout.jsx'
import Snackbar from '../components/Snackbar.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { useSnackbar } from '../hooks/useSnackbar.js'
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from '../services/api.js'

const initialForm = {
  title: '',
  description: '',
  details: '',
  category: '',
  image: '',
  characteristicsText: '',
  price: '',
  stock: '',
}

function AdminProductsPage() {
  const { hasPermission } = useAuth()
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar()

  const canCreate = hasPermission('products:create')
  const canUpdate = hasPermission('products:update')
  const canDelete = hasPermission('products:delete')

  const [products, setProducts] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteCandidateId, setDeleteCandidateId] = useState('')

  const loadProducts = async () => {
    setLoading(true)
    closeSnackbar()
    try {
      const data = await getAdminProducts()
      setProducts(data)
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudieron cargar los productos.', {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const resetForm = () => {
    setForm(initialForm)
    setEditingId('')
  }

  const openCreateModal = () => {
    if (!canCreate) {
      showSnackbar('No tienes permisos para crear productos.', { variant: 'warning' })
      return
    }

    resetForm()
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleEdit = (product) => {
    if (!canUpdate) {
      showSnackbar('No tienes permisos para editar productos.', { variant: 'warning' })
      return
    }

    setEditingId(product._id)
    setForm({
      title: product.title || '',
      description: product.description || '',
      details: product.details || '',
      category: product.category || '',
      image: product.image || '',
      characteristicsText: (product.characteristics || []).join(', '),
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
    })
    setIsModalOpen(true)
    closeSnackbar()
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    closeSnackbar()

    if ((!editingId && !canCreate) || (editingId && !canUpdate)) {
      showSnackbar('No tienes permisos para guardar productos.', { variant: 'warning' })
      return
    }

    setSaving(true)

    try {
      const payload = {
        title: form.title,
        description: form.description,
        details: form.details,
        category: form.category,
        image: form.image,
        characteristics: form.characteristicsText
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        price: Number(form.price),
        stock: Number(form.stock),
      }

      if (editingId) {
        await updateAdminProduct(editingId, payload)
        showSnackbar('Producto actualizado correctamente.', { variant: 'success' })
      } else {
        await createAdminProduct(payload)
        showSnackbar('Producto creado correctamente.', { variant: 'success' })
      }

      closeModal()
      await loadProducts()
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudo guardar el producto.', {
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const askDelete = (id) => {
    if (!canDelete) {
      showSnackbar('No tienes permisos para eliminar productos.', { variant: 'warning' })
      return
    }

    setDeleteCandidateId(id)
  }

  const handleDelete = async () => {
    if (!deleteCandidateId) {
      return
    }

    try {
      await deleteAdminProduct(deleteCandidateId)
      showSnackbar('Producto eliminado correctamente.', { variant: 'success' })
      setDeleteCandidateId('')
      await loadProducts()
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudo eliminar el producto.', {
        variant: 'error',
      })
    }
  }

  return (
    <AdminLayout
      title="Gestion de Productos"
      actions={
        <>
          {canCreate && (
            <button className="btn btn-dark" onClick={openCreateModal}>
              Nuevo producto
            </button>
          )}
          <button className="btn btn-outline-dark" onClick={loadProducts}>
            Refrescar
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

      <Snackbar
        open={Boolean(deleteCandidateId)}
        mode="modal"
        title="Confirmar eliminacion"
        message="Esta accion eliminara el producto. Deseas continuar?"
        onClose={() => setDeleteCandidateId('')}
        actions={[
          { label: 'Cancelar', className: 'btn btn-outline-dark', onClick: () => setDeleteCandidateId('') },
          { label: 'Eliminar', className: 'btn btn-danger', onClick: handleDelete },
        ]}
      />

      <Snackbar
        open={isModalOpen}
        mode="modal"
        title={editingId ? 'Editar producto' : 'Nuevo producto'}
        onClose={closeModal}
        closeOnBackdrop={!saving}
      >
        <form className="d-flex flex-column gap-2" onSubmit={handleSubmit}>
          <input
            required
            name="title"
            className="form-control"
            placeholder="Titulo"
            value={form.title}
            onChange={handleChange}
          />
          <textarea
            required
            name="description"
            rows="2"
            className="form-control"
            placeholder="Descripcion"
            value={form.description}
            onChange={handleChange}
          />
          <textarea
            name="details"
            rows="2"
            className="form-control"
            placeholder="Detalles del producto"
            value={form.details}
            onChange={handleChange}
          />
          <input
            required
            name="category"
            className="form-control"
            placeholder="Categoria"
            value={form.category}
            onChange={handleChange}
          />
          <input
            required
            name="image"
            className="form-control"
            placeholder="URL de imagen"
            value={form.image}
            onChange={handleChange}
          />
          <input
            name="characteristicsText"
            className="form-control"
            placeholder="Caracteristicas (separadas por coma)"
            value={form.characteristicsText}
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
                value={form.price}
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
                value={form.stock}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="d-flex gap-2 mt-2 justify-content-end">
            <button className="btn btn-outline-dark" type="button" onClick={closeModal} disabled={saving}>
              Cancelar
            </button>
            <button className="btn btn-dark" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </Snackbar>

      <div className="floating-card p-4">
        <h2 className="h4 mb-3">Catalogo de productos</h2>

        {loading ? (
          <p>Cargando productos...</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoria</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Caracteristicas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-muted">
                      No hay productos cargados.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <span className="fw-semibold">{product.title}</span>
                          <span className="small text-muted">{product.details || product.description}</span>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {(product.characteristics || []).length === 0 ? (
                            <span className="small text-muted">Sin caracteristicas</span>
                          ) : (
                            product.characteristics.map((item) => (
                              <span key={`${product._id}-${item}`} className="badge text-bg-light border">
                                {item}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {canUpdate && (
                            <button className="btn btn-sm btn-outline-dark" onClick={() => handleEdit(product)}>
                              Editar
                            </button>
                          )}
                          {canDelete && (
                            <button className="btn btn-sm btn-outline-danger" onClick={() => askDelete(product._id)}>
                              Eliminar
                            </button>
                          )}
                        </div>
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

export default AdminProductsPage
