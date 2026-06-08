const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDb = require('../config/db')
const { DEFAULT_PERMISSION_DEFINITIONS, DEFAULT_ROLE_DEFINITIONS } = require('../config/rbac')
const Permission = require('../models/Permission')
const Role = require('../models/Role')
const { ensureDefaultPermissions, ensureDefaultRoles } = require('../services/rbacService')

dotenv.config()

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

async function normalizeAndDedupePermissions() {
  const stats = {
    updated: 0,
    removed: 0,
  }

  const defaultPermissionMap = new Map(
    DEFAULT_PERMISSION_DEFINITIONS.map((permission) => [permission.key, permission]),
  )

  const permissions = await Permission.find().sort({ createdAt: 1, _id: 1 })
  const groups = new Map()

  for (const permission of permissions) {
    const normalizedKey = normalizeKey(permission.key)
    if (!normalizedKey) {
      continue
    }

    if (!groups.has(normalizedKey)) {
      groups.set(normalizedKey, [])
    }
    groups.get(normalizedKey).push(permission)
  }

  for (const [normalizedKey, group] of groups.entries()) {
    const canonical = group[0]
    const definition = defaultPermissionMap.get(normalizedKey)

    let selectedName = definition?.name || canonical.name
    let selectedDescription = definition?.description || canonical.description || ''

    if (!selectedName) {
      const candidate = group.find((item) => item.name && String(item.name).trim())
      selectedName = candidate ? String(candidate.name).trim() : normalizedKey
    }

    if (!selectedDescription) {
      const candidate = group.find((item) => item.description && String(item.description).trim())
      selectedDescription = candidate ? String(candidate.description).trim() : ''
    }

    const selectedIsSystem = definition ? true : group.some((item) => Boolean(item.isSystem))

    const mustUpdate =
      canonical.key !== normalizedKey ||
      canonical.name !== selectedName ||
      canonical.description !== selectedDescription ||
      canonical.isSystem !== selectedIsSystem

    if (mustUpdate) {
      canonical.key = normalizedKey
      canonical.name = selectedName
      canonical.description = selectedDescription
      canonical.isSystem = selectedIsSystem
      await canonical.save()
      stats.updated += 1
    }

    if (group.length > 1) {
      for (const duplicate of group.slice(1)) {
        await Permission.deleteOne({ _id: duplicate._id })
        stats.removed += 1
      }
    }
  }

  return stats
}

async function normalizeAndDedupeRoles(validPermissionKeys) {
  const stats = {
    updated: 0,
    removed: 0,
  }

  const validPermissionsSet = new Set(validPermissionKeys)
  const defaultRoleMap = new Map(DEFAULT_ROLE_DEFINITIONS.map((role) => [role.key, role]))

  const roles = await Role.find().sort({ createdAt: 1, _id: 1 })
  const groups = new Map()

  for (const role of roles) {
    const normalizedKey = normalizeKey(role.key)
    if (!normalizedKey) {
      continue
    }

    if (!groups.has(normalizedKey)) {
      groups.set(normalizedKey, [])
    }
    groups.get(normalizedKey).push(role)
  }

  for (const [normalizedKey, group] of groups.entries()) {
    const canonical = group[0]
    const definition = defaultRoleMap.get(normalizedKey)

    let mergedPermissions = []
    for (const role of group) {
      for (const permission of role.permissions || []) {
        const normalizedPermission = normalizeKey(permission)
        if (validPermissionsSet.has(normalizedPermission)) {
          mergedPermissions.push(normalizedPermission)
        }
      }
    }
    mergedPermissions = [...new Set(mergedPermissions)]

    const nextName = definition?.name || canonical.name
    const nextPermissions = definition
      ? definition.permissions.filter((permission) => validPermissionsSet.has(permission))
      : mergedPermissions
    const nextIsSystem = definition ? true : Boolean(canonical.isSystem || group.some((role) => role.isSystem))

    const mustUpdate =
      canonical.key !== normalizedKey ||
      canonical.name !== nextName ||
      canonical.isSystem !== nextIsSystem ||
      JSON.stringify(canonical.permissions || []) !== JSON.stringify(nextPermissions)

    if (mustUpdate) {
      canonical.key = normalizedKey
      canonical.name = nextName
      canonical.permissions = nextPermissions
      canonical.isSystem = nextIsSystem
      await canonical.save()
      stats.updated += 1
    }

    if (group.length > 1) {
      for (const duplicate of group.slice(1)) {
        await Role.deleteOne({ _id: duplicate._id })
        stats.removed += 1
      }
    }
  }

  return stats
}

async function run() {
  const stats = {
    permissions: { updated: 0, removed: 0 },
    roles: { updated: 0, removed: 0 },
  }

  try {
    await connectDb()

    stats.permissions = await normalizeAndDedupePermissions()

    await ensureDefaultPermissions()

    const validPermissionKeys = await Permission.distinct('key')
    stats.roles = await normalizeAndDedupeRoles(validPermissionKeys)

    await ensureDefaultRoles()

    console.log('Migracion RBAC completada')
    console.log(`Permisos actualizados: ${stats.permissions.updated}`)
    console.log(`Permisos duplicados eliminados: ${stats.permissions.removed}`)
    console.log(`Roles actualizados: ${stats.roles.updated}`)
    console.log(`Roles duplicados eliminados: ${stats.roles.removed}`)
    process.exit(0)
  } catch (error) {
    console.error('Error en migracion RBAC:', error.message)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
  }
}

run()
