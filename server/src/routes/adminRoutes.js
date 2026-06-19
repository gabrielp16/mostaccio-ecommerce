const bcrypt = require('bcryptjs')
const express = require('express')
const { requireAnyPermission, requireAuth, requirePermission } = require('../middleware/auth')
const Order = require('../models/Order')
const Permission = require('../models/Permission')
const Product = require('../models/Product')
const Role = require('../models/Role')
const User = require('../models/User')
const { releaseReservationForOrder, reReserveForPendingStatus } = require('../services/inventoryService')
const { isValidPermissions } = require('../services/rbacService')

const router = express.Router()

router.use(requireAuth)

function sanitizeUser(userDoc) {
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    isActive: userDoc.isActive,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  }
}

router.get('/orders', requirePermission('orders:read'), async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    return res.json(orders)
  } catch {
    return res.status(500).json({ message: 'No se pudieron obtener las ordenes' })
  }
})

router.get('/orders/:id', requirePermission('orders:read'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' })
    }

    return res.json(order)
  } catch {
    return res.status(500).json({ message: 'No se pudo obtener el detalle de la orden' })
  }
})

router.patch('/orders/:id/status', requirePermission('orders:update'), async (req, res) => {
  try {
    const { status } = req.body
    const allowedStatuses = ['pending', 'paid', 'shipped', 'delivered']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado de orden invalido' })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' })
    }

    const previousStatus = order.status
    if (previousStatus === status) {
      return res.json(order)
    }

    if (previousStatus === 'pending' && status !== 'pending') {
      await releaseReservationForOrder(order.items)
    }

    if (previousStatus !== 'pending' && status === 'pending') {
      await reReserveForPendingStatus(order.items)
    }

    order.status = status
    await order.save()

    return res.json(order)
  } catch (error) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(400).json({ message: 'Uno o mas productos no existen' })
    }

    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(409).json({ message: 'Stock insuficiente para devolver la orden a pendiente' })
    }

    if (error.message === 'INSUFFICIENT_RESERVED_STOCK') {
      return res.status(409).json({ message: 'No hay suficiente stock reservado para esta orden' })
    }

    return res.status(500).json({ message: 'No se pudo actualizar el estado de la orden' })
  }
})

router.get('/products', requirePermission('products:read'), async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    return res.json(products)
  } catch {
    return res.status(500).json({ message: 'No se pudieron obtener los productos' })
  }
})

router.post('/products', requirePermission('products:create'), async (req, res) => {
  try {
    const { title, description, details = '', characteristics = [], category, image, price, stock } = req.body
    if (!title || !description || !category || !image || price == null) {
      return res.status(400).json({ message: 'Datos de producto incompletos' })
    }

    if (!Array.isArray(characteristics)) {
      return res.status(400).json({ message: 'Caracteristicas invalidas' })
    }

    const normalizedCharacteristics = characteristics
      .map((item) => String(item).trim())
      .filter(Boolean)

    const product = await Product.create({
      title,
      description,
      details,
      characteristics: normalizedCharacteristics,
      category,
      image,
      price,
      stock: stock ?? 0,
    })

    return res.status(201).json(product)
  } catch {
    return res.status(500).json({ message: 'No se pudo crear el producto' })
  }
})

router.patch('/products/:id', requirePermission('products:update'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    return res.json(product)
  } catch {
    return res.status(500).json({ message: 'No se pudo actualizar el producto' })
  }
})

router.delete('/products/:id', requirePermission('products:delete'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    return res.status(204).send()
  } catch {
    return res.status(500).json({ message: 'No se pudo eliminar el producto' })
  }
})

router.get('/users', requirePermission('users:read'), async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    return res.json(users.map(sanitizeUser))
  } catch {
    return res.status(500).json({ message: 'No se pudieron obtener los usuarios' })
  }
})

router.get('/users/:id', requirePermission('users:read'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    return res.json(sanitizeUser(user))
  } catch {
    return res.status(500).json({ message: 'No se pudo obtener el usuario' })
  }
})

router.post('/users', requirePermission('users:create'), async (req, res) => {
  try {
    const { name, email, password, role = 'customer', isActive = true } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, correo y password son requeridos' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const roleExists = await Role.findOne({ key: role })
    if (!roleExists) {
      return res.status(400).json({ message: 'Rol invalido' })
    }

    const exists = await User.findOne({ email: normalizedEmail })
    if (exists) {
      return res.status(409).json({ message: 'El correo ya existe' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: passwordHash,
      role,
      isActive,
    })

    return res.status(201).json(sanitizeUser(user))
  } catch {
    return res.status(500).json({ message: 'No se pudo crear el usuario' })
  }
})

router.patch('/users/:id', requirePermission('users:update'), async (req, res) => {
  try {
    const { name, email, password, role, isActive } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (name != null) {
      user.name = name
    }

    if (email != null) {
      user.email = email.toLowerCase().trim()
    }

    if (role != null) {
      const roleExists = await Role.findOne({ key: role })
      if (!roleExists) {
        return res.status(400).json({ message: 'Rol invalido' })
      }
      user.role = role
    }

    if (isActive != null) {
      user.isActive = Boolean(isActive)
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10)
    }

    await user.save()
    return res.json(sanitizeUser(user))
  } catch {
    return res.status(500).json({ message: 'No se pudo actualizar el usuario' })
  }
})

router.delete('/users/:id', requirePermission('users:delete'), async (req, res) => {
  try {
    if (String(req.user.id) === req.params.id) {
      return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' })
    }

    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    return res.status(204).send()
  } catch {
    return res.status(500).json({ message: 'No se pudo eliminar el usuario' })
  }
})

router.get('/roles', requirePermission('roles:read'), async (_req, res) => {
  try {
    const roles = await Role.find().sort({ key: 1 })
    return res.json(roles)
  } catch {
    return res.status(500).json({ message: 'No se pudieron obtener los roles' })
  }
})

router.post('/roles', requirePermission('roles:create'), async (req, res) => {
  try {
    const { key, name, permissions = [] } = req.body
    if (!key || !name) {
      return res.status(400).json({ message: 'Key y nombre son requeridos' })
    }

    if (!Array.isArray(permissions) || !(await isValidPermissions(permissions))) {
      return res.status(400).json({ message: 'Permisos invalidos' })
    }

    const role = await Role.create({
      key: key.toLowerCase().trim(),
      name,
      permissions,
      isSystem: false,
    })

    return res.status(201).json(role)
  } catch {
    return res.status(500).json({ message: 'No se pudo crear el rol' })
  }
})

router.patch('/roles/:id', requirePermission('roles:update'), async (req, res) => {
  try {
    const { name, permissions } = req.body
    const role = await Role.findById(req.params.id)
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' })
    }

    if (name != null) {
      role.name = name
    }

    if (permissions != null) {
      if (!Array.isArray(permissions) || !(await isValidPermissions(permissions))) {
        return res.status(400).json({ message: 'Permisos invalidos' })
      }
      role.permissions = permissions
    }

    await role.save()
    return res.json(role)
  } catch {
    return res.status(500).json({ message: 'No se pudo actualizar el rol' })
  }
})

router.delete('/roles/:id', requirePermission('roles:delete'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' })
    }

    if (role.isSystem) {
      return res.status(400).json({ message: 'No se puede eliminar un rol del sistema' })
    }

    const usersWithRole = await User.countDocuments({ role: role.key })
    if (usersWithRole > 0) {
      return res.status(400).json({ message: 'No se puede eliminar un rol en uso' })
    }

    await Role.findByIdAndDelete(req.params.id)
    return res.status(204).send()
  } catch {
    return res.status(500).json({ message: 'No se pudo eliminar el rol' })
  }
})

router.get('/permissions', requireAnyPermission(['permissions:read', 'roles:read']), async (_req, res) => {
  try {
    const permissions = await Permission.find().sort({ key: 1 })
    return res.json(permissions)
  } catch {
    return res.status(500).json({ message: 'No se pudieron obtener los permisos' })
  }
})

router.post('/permissions', requireAnyPermission(['permissions:create', 'roles:create']), async (req, res) => {
  try {
    const { key, name, description = '' } = req.body

    if (!key || !name) {
      return res.status(400).json({ message: 'Key y nombre son requeridos' })
    }

    const normalizedKey = key.toLowerCase().trim()
    const keyPattern = /^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$/
    if (!keyPattern.test(normalizedKey)) {
      return res.status(400).json({ message: 'Key invalida. Usa formato modulo:accion' })
    }

    const permission = await Permission.create({
      key: normalizedKey,
      name: name.trim(),
      description: String(description || '').trim(),
      isSystem: false,
    })

    return res.status(201).json(permission)
  } catch {
    return res.status(500).json({ message: 'No se pudo crear el permiso' })
  }
})

router.patch('/permissions/:id', requireAnyPermission(['permissions:update', 'roles:update']), async (req, res) => {
  try {
    const { name, description } = req.body
    const permission = await Permission.findById(req.params.id)

    if (!permission) {
      return res.status(404).json({ message: 'Permiso no encontrado' })
    }

    if (name != null) {
      permission.name = String(name).trim()
    }

    if (description != null) {
      permission.description = String(description).trim()
    }

    await permission.save()
    return res.json(permission)
  } catch {
    return res.status(500).json({ message: 'No se pudo actualizar el permiso' })
  }
})

router.delete('/permissions/:id', requireAnyPermission(['permissions:delete', 'roles:delete']), async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id)

    if (!permission) {
      return res.status(404).json({ message: 'Permiso no encontrado' })
    }

    if (permission.isSystem) {
      return res.status(400).json({ message: 'No se puede eliminar un permiso del sistema' })
    }

    const rolesUsingPermission = await Role.countDocuments({ permissions: permission.key })
    if (rolesUsingPermission > 0) {
      return res.status(400).json({ message: 'No se puede eliminar un permiso en uso por roles' })
    }

    await Permission.findByIdAndDelete(req.params.id)
    return res.status(204).send()
  } catch {
    return res.status(500).json({ message: 'No se pudo eliminar el permiso' })
  }
})

module.exports = router
