const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return res.status(401).json({ message: 'Token requerido' })
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me')
    req.user = payload
    return next()
  } catch {
    return res.status(401).json({ message: 'Token invalido' })
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Permisos insuficientes' })
  }
  return next()
}

function requirePermission(permission) {
  return (req, res, next) => {
    const permissions = req.user?.permissions || []
    if (!permissions.includes(permission)) {
      return res.status(403).json({ message: 'Permisos insuficientes' })
    }
    return next()
  }
}

function requireAnyPermission(requiredPermissions = []) {
  return (req, res, next) => {
    const permissions = req.user?.permissions || []
    const hasAnyPermission = requiredPermissions.some((permission) => permissions.includes(permission))

    if (!hasAnyPermission) {
      return res.status(403).json({ message: 'Permisos insuficientes' })
    }

    return next()
  }
}

module.exports = { requireAuth, requireAdmin, requirePermission, requireAnyPermission }
