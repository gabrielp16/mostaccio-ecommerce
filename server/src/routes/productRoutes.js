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

module.exports = router
