const Permission = require('../models/Permission')
const Role = require('../models/Role')
const { DEFAULT_PERMISSION_DEFINITIONS, DEFAULT_ROLE_DEFINITIONS } = require('../config/rbac')

async function ensureDefaultPermissions() {
  for (const permission of DEFAULT_PERMISSION_DEFINITIONS) {
    await Permission.findOneAndUpdate(
      { key: permission.key },
      {
        name: permission.name,
        description: permission.description,
        isSystem: permission.isSystem,
      },
      { upsert: true, setDefaultsOnInsert: true },
    )
  }
}

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

async function isValidPermissions(permissions = []) {
  if (!Array.isArray(permissions)) {
    return false
  }

  const uniquePermissions = [...new Set(permissions)]
  if (uniquePermissions.length === 0) {
    return true
  }

  const existingCount = await Permission.countDocuments({ key: { $in: uniquePermissions } })
  return existingCount === uniquePermissions.length
}

async function resolvePermissionsForRole(roleKey) {
  const role = await Role.findOne({ key: roleKey })
  if (!role) {
    return []
  }
  return role.permissions
}

module.exports = {
  ensureDefaultPermissions,
  ensureDefaultRoles,
  isValidPermissions,
  resolvePermissionsForRole,
}