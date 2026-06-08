const Role = require('../models/Role')
const { DEFAULT_ROLE_DEFINITIONS } = require('../config/rbac')

async function ensureDefaultRoles() {
  for (const role of DEFAULT_ROLE_DEFINITIONS) {
    await Role.findOneAndUpdate(
      { key: role.key },
      {
        name: role.name,
        permissions: role.permissions,
        isSystem: role.isSystem,
      },
      { upsert: true, setDefaultsOnInsert: true },
    )
  }
}

async function resolvePermissionsForRole(roleKey) {
  const role = await Role.findOne({ key: roleKey })
  if (!role) {
    return []
  }
  return role.permissions
}

module.exports = { ensureDefaultRoles, resolvePermissionsForRole }