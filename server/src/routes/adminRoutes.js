const express = require('express')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const Order = require('../models/Order')
const Product = require('../models/Product')

const router = express.Router()

router.use(requireAuth, requireAdmin)

router.get('/orders', async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    return res.json(orders)
  } catch {
    return res.status(500).json({ message: 'No se pudieron obtener las ordenes' })
  }
})

router.get('/orders/:id', async (req, res) => {
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

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const allowedStatuses = ['pending', 'paid', 'shipped', 'delivered']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado de orden invalido' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      },
    )

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' })
    }

    return res.json(order)
  } catch {
    return res.status(500).json({ message: 'No se pudo actualizar el estado de la orden' })
  }
})

router.get('/products', async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    return res.json(products)
  } catch {
    return res.status(500).json({ message: 'No se pudieron obtener los productos' })
  }
})

router.post('/products', async (req, res) => {
  try {
    const { title, description, category, image, price, stock } = req.body
    if (!title || !description || !category || !image || price == null) {
      return res.status(400).json({ message: 'Datos de producto incompletos' })
    }

    const product = await Product.create({
      title,
      description,
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

router.patch('/products/:id', async (req, res) => {
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

router.delete('/products/:id', async (req, res) => {
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

module.exports = router
