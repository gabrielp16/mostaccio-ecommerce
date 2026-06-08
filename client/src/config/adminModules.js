export const ADMIN_ENTRY_PERMISSIONS = [
  'products:read',
  'orders:read',
  'users:read',
  'roles:read',
  'permissions:read',
]

export const ADMIN_MODULES = [
  {
    id: 'dashboard',
    label: 'Panel',
    to: '/admin',
    permissionsAny: ADMIN_ENTRY_PERMISSIONS,
    matchPath: '/admin',
  },
  {
    id: 'orders',
    label: 'Pedidos',
    to: '/admin/orders',
    permissionsAny: ['orders:read'],
    matchPath: '/admin/orders',
  },
  {
    id: 'products',
    label: 'Productos',
    to: '/admin/products',
    permissionsAny: ['products:read'],
    matchPath: '/admin/products',
  },
  {
    id: 'users',
    label: 'Usuarios',
    to: '/admin/users',
    permissionsAny: ['users:read'],
    matchPath: '/admin/users',
  },
  {
    id: 'roles',
    label: 'Roles',
    to: '/admin/roles',
    permissionsAny: ['roles:read'],
    matchPath: '/admin/roles',
  },
  {
    id: 'permissions',
    label: 'Permisos',
    to: '/admin/permissions',
    permissionsAny: ['permissions:read', 'roles:read'],
    matchPath: '/admin/permissions',
  },
]

export function canAccessAdminModule(module, hasPermission) {
  const required = module.permissionsAny || []
  if (!required.length) {
    return true
  }
  return required.some((permission) => hasPermission(permission))
}
