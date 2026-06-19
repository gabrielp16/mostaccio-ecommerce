import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { getProductById, getProducts } from '../services/api.js'

function ProductDetailPage() {
  const { productId } = useParams()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      setError('')

      try {
        const [detailData, catalogData] = await Promise.all([getProductById(productId), getProducts()])
        setProduct(detailData)
        setCatalog(Array.isArray(catalogData) ? catalogData : [])
      } catch {
        setError('No se pudo cargar el producto.')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  const relatedProducts = useMemo(() => {
    if (!product) {
      return []
    }

    return catalog
      .filter((item) => item._id !== product._id && item.category === product.category)
      .slice(0, 4)
  }, [catalog, product])

  if (loading) {
    return (
      <section className="py-5">
        <div className="container">
          <p>Cargando producto...</p>
        </div>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="py-5">
        <div className="container">
          <p className="mb-3">{error || 'Producto no encontrado.'}</p>
          <Link to="/shop" className="btn btn-outline-dark">
            Volver a tienda
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-5">
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/">Inicio</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/shop">Tienda</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="floating-card p-3">
              <img
                src={product.image}
                alt={product.title}
                className="w-100"
                style={{ maxHeight: '520px', objectFit: 'cover', borderRadius: '0.8rem' }}
              />
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="floating-card p-4 h-100 d-flex flex-column">
              <p className="hero-kicker mb-2">{product.category}</p>
              <h1 className="section-title mb-2">{product.title}</h1>
              <p className="mb-3 fs-4 fw-bold">${product.price.toFixed(2)}</p>

              <p className="mb-2">{product.description}</p>
              {product.details && <p className="text-muted mb-3">{product.details}</p>}

              <div className="mb-3">
                <p className="small text-uppercase fw-bold mb-2">Caracteristicas</p>
                {(product.characteristics || []).length === 0 ? (
                  <p className="text-muted mb-0">Sin caracteristicas registradas.</p>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {product.characteristics.map((item) => (
                      <span key={`${product._id}-${item}`} className="badge text-bg-light border">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <p className="small mb-1">
                Stock disponible: <strong>{product.stock}</strong>
              </p>
              <p className="small text-muted mb-4">
                En reserva: <strong>{product.reservedStock || 0}</strong>
              </p>

              <div className="d-flex gap-2 mt-auto">
                <button className="btn btn-dark" onClick={() => addToCart(product)}>
                  Agregar al carrito
                </button>
                <Link to="/shop" className="btn btn-outline-dark">
                  Volver a tienda
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h2 className="h3 mb-0">Productos relacionados</h2>
            <Link to="/shop" className="btn btn-sm btn-outline-dark">
              Ver todo el catalogo
            </Link>
          </div>

          {relatedProducts.length === 0 ? (
            <div className="floating-card p-3">
              <p className="text-muted mb-0">No hay productos relacionados para mostrar en este momento.</p>
            </div>
          ) : (
            <div className="row g-3">
              {relatedProducts.map((item) => (
                <div key={item._id} className="col-12 col-md-6 col-xl-3">
                  <article className="floating-card h-100 p-3 d-flex flex-column">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-100 mb-2"
                      style={{ height: '170px', objectFit: 'cover', borderRadius: '0.75rem' }}
                    />
                    <p className="fw-semibold mb-1">{item.title}</p>
                    <p className="small text-muted mb-2">{item.category}</p>
                    <p className="small fw-bold mb-3">${item.price.toFixed(2)}</p>
                    <div className="d-flex gap-2 mt-auto">
                      <button className="btn btn-sm btn-dark" onClick={() => addToCart(item)}>
                        Agregar
                      </button>
                      <Link to={`/shop/${item._id}`} className="btn btn-sm btn-outline-dark">
                        Ver
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ProductDetailPage
