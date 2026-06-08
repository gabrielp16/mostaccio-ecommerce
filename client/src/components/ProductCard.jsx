import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <article className="card floating-card h-100 product-card">
      <img
        src={product.image}
        className="card-img-top"
        alt={product.title}
        style={{ height: '230px', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h3 className="h5 mb-0">{product.title}</h3>
          <span className="price-chip">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-muted small mb-2">{product.category}</p>
        <p className="small flex-grow-1">{product.description}</p>
        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-dark" onClick={() => addToCart(product)}>
            Agregar al carrito
          </button>
          <Link to={`/shop/${product._id}`} className="btn btn-outline-dark">
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
