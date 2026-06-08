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
        <button className="btn btn-dark mt-3" onClick={() => addToCart(product)}>
          Agregar al carrito
        </button>
      </div>
    </article>
  )
}

export default ProductCard
