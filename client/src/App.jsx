import { Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx'
import TopNav from './components/TopNav.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AdminOrderDetailPage from './pages/AdminOrderDetailPage.jsx'
import AdminOrdersPage from './pages/AdminOrdersPage.jsx'
import AdminPermissionsPage from './pages/AdminPermissionsPage.jsx'
import AdminProductsPage from './pages/AdminProductsPage.jsx'
import AdminRolesPage from './pages/AdminRolesPage.jsx'
import AdminUsersPage from './pages/AdminUsersPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import { ADMIN_ENTRY_PERMISSIONS } from './config/adminModules.js'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import ShopPage from './pages/ShopPage.jsx'

function App() {
  return (
    <div className="app-shell">
      <TopNav />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:productId" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute requiredPermission={ADMIN_ENTRY_PERMISSIONS}>
                <AdminPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedAdminRoute requiredPermission="products:read">
                <AdminProductsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute requiredPermission="orders:read">
                <AdminOrdersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders/:orderId"
            element={
              <ProtectedAdminRoute requiredPermission="orders:read">
                <AdminOrderDetailPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute requiredPermission="users:read">
                <AdminUsersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <ProtectedAdminRoute requiredPermission="roles:read">
                <AdminRolesPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/permissions"
            element={
              <ProtectedAdminRoute requiredPermission={['permissions:read', 'roles:read']}>
                <AdminPermissionsPage />
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
