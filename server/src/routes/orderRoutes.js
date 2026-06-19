const express = require('express')
const Order = require('../models/Order')
const { reserveStockForPendingOrder, rollbackPendingReservation } = require('../services/inventoryService')

const router = express.Router()

function calcTotals(items) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = subtotal > 0 ? 9.9 : 0
  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
  }
}

router.post('/', async (req, res) => {
  try {
    const { customer, items } = req.body

    if (!customer?.name || !customer?.email || !customer?.address) {
      return res.status(400).json({ message: 'Datos de cliente incompletos' })
    }

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'El pedido no tiene items' })
    }

    const totals = calcTotals(items)
    const orderNumber = `ORD-${Date.now()}`

    await reserveStockForPendingOrder(items)

    let order
    try {
      order = await Order.create({
        orderNumber,
        customer,
        items,
        ...totals,
      })
    } catch (createError) {
      await rollbackPendingReservation(items)
      throw createError
    }

    return res.status(201).json(order)
  } catch (error) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(400).json({ message: 'Uno o mas productos no existen' })
    }

    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(409).json({ message: 'Stock insuficiente para completar el pedido' })
    }

    return res.status(500).json({ message: 'No se pudo crear la orden' })
  }
})

module.exports = router
