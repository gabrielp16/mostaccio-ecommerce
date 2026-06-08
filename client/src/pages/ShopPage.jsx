import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'
import { getProducts } from '../services/api.js'

const fallbackProducts = [
  {
    _id: 'fallback-1',
    title: 'Chaqueta Mono Canvas',
    category: 'Outerwear',
    description: 'Corte sobrio, peso liviano y textura mate para looks urbanos.',
    price: 89.9,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
  },
  {
    _id: 'fallback-2',
    title: 'Bota Sierra 82',
    category: 'Calzado',
    description: 'Suela de alto agarre con plantilla comoda para uso diario.',
    price: 129.0,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    _id: 'fallback-3',
    title: 'Mochila Delta Utility',
    category: 'Accesorios',
    description: 'Nylon impermeable y compartimentos internos para laptop y accesorios.',
    price: 74.5,
    image: 'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=900&q=80',
  },
]

function ShopPage() {
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts()
        setProducts(data.length ? data : fallbackProducts)
      } catch {
        setProducts(fallbackProducts)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    if (!query.trim()) {
      return products
    }

    const term = query.toLowerCase()
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(term) || product.category.toLowerCase().includes(term),
    )
  }, [products, query])

  return (
    <section className="py-5">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
          <div>
            <p className="hero-kicker mb-1">Catalogo</p>
            <h1 className="section-title m-0">Compra inteligente</h1>
          </div>
          <div style={{ minWidth: '280px' }}>
            <input
              type="search"
              className="form-control form-control-lg"
              placeholder="Buscar por nombre o categoria"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">Cargando productos...</div>
        ) : (
          <div className="row g-4">
            {filteredProducts.map((product) => (
              <div key={product._id} className="col-md-6 col-xl-4">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ShopPage
