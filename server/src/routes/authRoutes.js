const bcrypt = require('bcryptjs')
const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { requireAuth } = require('../middleware/auth')
const { resolvePermissionsForRole } = require('../services/rbacService')

const router = express.Router()

function signToken(user, permissions) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      permissions,
    },
    process.env.JWT_SECRET || 'dev_secret_change_me',
    { expiresIn: '7d' },
  )
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, correo y password son requeridos' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const exists = await User.findOne({ email: normalizedEmail })
    if (exists) {
      return res.status(409).json({ message: 'El correo ya existe' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: passwordHash,
      role: 'customer',
    })

    const permissions = await resolvePermissionsForRole(user.role)
    const token = signToken(user, permissions)
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions,
        isActive: user.isActive,
      },
    })
  } catch {
    return res.status(500).json({ message: 'No se pudo registrar el usuario' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y password son requeridos' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(401).json({ message: 'Credenciales invalidas' })
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Usuario inactivo' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales invalidas' })
    }

    const permissions = await resolvePermissionsForRole(user.role)
    const token = signToken(user, permissions)
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions,
        isActive: user.isActive,
      },
    })
  } catch {
    return res.status(500).json({ message: 'No se pudo iniciar sesion' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  return res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name,
      permissions: req.user.permissions || [],
    },
  })
})

module.exports = router
