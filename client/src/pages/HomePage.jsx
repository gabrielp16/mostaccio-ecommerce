import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <>
      <section className="hero-band">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <p className="hero-kicker mb-2">Coleccion 2026</p>
              <h1 className="section-title mb-3">E-commerce con actitud visual</h1>
              <p className="lead mb-4">
                Una base lista para escalar: catalogo, carrito, checkout y API conectada a MongoDB.
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <Link to="/shop" className="btn btn-dark btn-lg">
                  Ver productos
                </Link>
                <Link to="/checkout" className="btn btn-outline-dark btn-lg">
                  Ir al checkout
                </Link>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="floating-card p-4">
                <p className="small text-uppercase fw-bold mb-2">Stack</p>
                <ul className="mb-0 ps-3">
                  <li>React + Vite</li>
                  <li>Bootstrap + CSS custom</li>
                  <li>Node + Express + MongoDB</li>
                  <li>Checkout persistente en localStorage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="floating-card p-4 h-100">
                <h2 className="h4">Diseno editorial</h2>
                <p className="mb-0">Tipografia de alto contraste y jerarquia clara para destacar producto.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="floating-card p-4 h-100">
                <h2 className="h4">UX orientada a conversion</h2>
                <p className="mb-0">Foco en claridad de precio, categorias y un checkout con friccion minima.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="floating-card p-4 h-100">
                <h2 className="h4">Backend listo para escalar</h2>
                <p className="mb-0">API modular para productos y pedidos, ideal para crecer a auth y admin.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
