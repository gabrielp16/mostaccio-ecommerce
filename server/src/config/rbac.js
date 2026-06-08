const DEFAULT_PERMISSION_DEFINITIONS = [
  {
    key: 'products:read',
    name: 'Ver productos',
    description: 'Permite consultar el catalogo en administracion.',
    isSystem: true,
  },
  {
    key: 'products:create',
    name: 'Crear productos',
    description: 'Permite crear nuevos productos en administracion.',
    isSystem: true,
  },
  {
    key: 'products:update',
    name: 'Editar productos',
    description: 'Permite modificar productos existentes.',
    isSystem: true,
  },
  {
    key: 'products:delete',
    name: 'Eliminar productos',
    description: 'Permite eliminar productos del catalogo.',
    isSystem: true,
  },
  {
    key: 'orders:read',
    name: 'Ver pedidos',
    description: 'Permite consultar pedidos y su detalle.',
    isSystem: true,
  },
  {
    key: 'orders:update',
    name: 'Editar pedidos',
    description: 'Permite actualizar estado de pedidos.',
    isSystem: true,
  },
  {
    key: 'users:read',
    name: 'Ver usuarios',
    description: 'Permite consultar usuarios del sistema.',
    isSystem: true,
  },
  {
    key: 'users:create',
    name: 'Crear usuarios',
    description: 'Permite crear usuarios internos.',
    isSystem: true,
  },
  {
    key: 'users:update',
    name: 'Editar usuarios',
    description: 'Permite actualizar datos y roles de usuarios.',
    isSystem: true,
  },
  {
    key: 'users:delete',
    name: 'Eliminar usuarios',
    description: 'Permite eliminar usuarios.',
    isSystem: true,
  },
  {
    key: 'roles:read',
    name: 'Ver roles',
    description: 'Permite consultar roles.',
    isSystem: true,
  },
  {
    key: 'roles:create',
    name: 'Crear roles',
    description: 'Permite crear nuevos roles.',
    isSystem: true,
  },
  {
    key: 'roles:update',
    name: 'Editar roles',
    description: 'Permite modificar roles existentes.',
    isSystem: true,
  },
  {
    key: 'roles:delete',
    name: 'Eliminar roles',
    description: 'Permite eliminar roles no sistemicos.',
    isSystem: true,
  },
  {
    key: 'permissions:read',
    name: 'Ver permisos',
    description: 'Permite consultar permisos disponibles.',
    isSystem: true,
  },
  {
    key: 'permissions:create',
    name: 'Crear permisos',
    description: 'Permite crear permisos personalizados.',
    isSystem: true,
  },
  {
    key: 'permissions:update',
    name: 'Editar permisos',
    description: 'Permite actualizar permisos personalizados.',
    isSystem: true,
  },
  {
    key: 'permissions:delete',
    name: 'Eliminar permisos',
    description: 'Permite eliminar permisos no sistemicos sin uso.',
    isSystem: true,
  },
]

const PERMISSIONS = DEFAULT_PERMISSION_DEFINITIONS.map((permission) => permission.key)

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

module.exports = {
  PERMISSIONS,
  DEFAULT_PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_DEFINITIONS,
}