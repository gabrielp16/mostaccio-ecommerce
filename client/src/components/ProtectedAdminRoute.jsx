import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

function ProtectedAdminRoute({ children, requiredPermission = '' }) {
  const { isAuthenticated, isAdmin, hasPermission, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const requiredPermissions = Array.isArray(requiredPermission)
    ? requiredPermission
    : requiredPermission
      ? [requiredPermission]
      : []

  const hasRequiredPermission =
    requiredPermissions.length === 0 || requiredPermissions.some((permission) => hasPermission(permission))

  if (requiredPermissions.length > 0 && !hasRequiredPermission) {
    return <Navigate to="/" replace />
  }

  if (requiredPermissions.length === 0 && !isAdmin && !Boolean(user?.permissions?.length)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedAdminRoute
