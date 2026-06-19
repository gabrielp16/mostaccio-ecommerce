const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    details: { type: String, default: '' },
    characteristics: { type: [String], default: [] },
    category: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 10, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Product', productSchema)
