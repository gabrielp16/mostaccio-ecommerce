const PERMISSIONS = [
  'products:read',
  'products:create',
  'products:update',
  'products:delete',
  'orders:read',
  'orders:update',
  'users:read',
  'users:create',
  'users:update',
  'users:delete',
  'roles:read',
  'roles:create',
  'roles:update',
  'roles:delete',
]

const DEFAULT_ROLE_DEFINITIONS = [
  {
    key: 'admin',
    name: 'Administrador',
    permissions: [...PERMISSIONS],
    isSystem: true,
  },
  {
    key: 'employee',
    name: 'Empleado',
    permissions: ['products:read', 'products:create', 'products:update', 'orders:read'],
    isSystem: true,
  },
  {
    key: 'accountant',
    name: 'Contador',
    permissions: ['orders:read', 'orders:update'],
    isSystem: true,
  },
  {
    key: 'supervisor',
    name: 'Supervisor',
    permissions: ['products:read', 'products:update', 'orders:read', 'orders:update', 'users:read'],
    isSystem: true,
  },
  {
    key: 'customer',
    name: 'Cliente',
    permissions: [],
    isSystem: true,
  },
]

function isValidPermissions(permissions = []) {
  return permissions.every((permission) => PERMISSIONS.includes(permission))
}

module.exports = { PERMISSIONS, DEFAULT_ROLE_DEFINITIONS, isValidPermissions }