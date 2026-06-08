import { Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx'
import TopNav from './components/TopNav.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AdminOrderDetailPage from './pages/AdminOrderDetailPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ShopPage from './pages/ShopPage.jsx'

function App() {
  return (
    <div className="app-shell">
      <TopNav />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders/:orderId"
            element={
              <ProtectedAdminRoute>
                <AdminOrderDetailPage />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
