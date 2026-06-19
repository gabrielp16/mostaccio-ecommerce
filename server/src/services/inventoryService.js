const Product = require('../models/Product')

function buildQuantityMap(orderItems = []) {
  const quantities = new Map()

  for (const item of orderItems) {
    const productId = String(item.productId || '').trim()
    const quantity = Number(item.quantity || 0)

    if (!productId || quantity <= 0) {
      continue
    }

    quantities.set(productId, (quantities.get(productId) || 0) + quantity)
  }

  return quantities
}

async function getProductsMap(productIds = []) {
  const products = await Product.find({ _id: { $in: productIds } })
  return new Map(products.map((product) => [String(product._id), product]))
}

async function reserveStockForPendingOrder(orderItems = []) {
  const quantities = buildQuantityMap(orderItems)
  if (quantities.size === 0) {
    return
  }

  const productIds = [...quantities.keys()]
  const productsMap = await getProductsMap(productIds)

  for (const productId of productIds) {
    const product = productsMap.get(productId)
    const quantity = quantities.get(productId)

    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND')
    }

    if (product.stock < quantity) {
      throw new Error('INSUFFICIENT_STOCK')
    }
  }

  for (const [productId, quantity] of quantities.entries()) {
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity, reservedStock: quantity },
    })
  }
}

async function releaseReservationForOrder(orderItems = []) {
  const quantities = buildQuantityMap(orderItems)
  if (quantities.size === 0) {
    return
  }

  const productIds = [...quantities.keys()]
  const productsMap = await getProductsMap(productIds)

  for (const productId of productIds) {
    const product = productsMap.get(productId)
    const quantity = quantities.get(productId)

    if (!product) {
      continue
    }

    if ((product.reservedStock || 0) < quantity) {
      throw new Error('INSUFFICIENT_RESERVED_STOCK')
    }
  }

  for (const [productId, quantity] of quantities.entries()) {
    await Product.findByIdAndUpdate(productId, {
      $inc: { reservedStock: -quantity },
    })
  }
}

async function reReserveForPendingStatus(orderItems = []) {
  const quantities = buildQuantityMap(orderItems)
  if (quantities.size === 0) {
    return
  }

  const productIds = [...quantities.keys()]
  const productsMap = await getProductsMap(productIds)

  for (const productId of productIds) {
    const product = productsMap.get(productId)
    const quantity = quantities.get(productId)

    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND')
    }

    if (product.stock < quantity) {
      throw new Error('INSUFFICIENT_STOCK')
    }
  }

  for (const [productId, quantity] of quantities.entries()) {
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity, reservedStock: quantity },
    })
  }
}

async function rollbackPendingReservation(orderItems = []) {
  const quantities = buildQuantityMap(orderItems)
  if (quantities.size === 0) {
    return
  }

  for (const [productId, quantity] of quantities.entries()) {
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: quantity, reservedStock: -quantity },
    })
  }
}

module.exports = {
  reserveStockForPendingOrder,
  releaseReservationForOrder,
  reReserveForPendingStatus,
  rollbackPendingReservation,
}
