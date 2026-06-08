const express = require('express')
const Product = require('../models/Product')

const router = express.Router()

router.get('/', async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener los productos' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    return res.json(product)
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener el detalle del producto' })
  }
})

module.exports = router
