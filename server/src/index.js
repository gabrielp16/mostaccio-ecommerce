const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')

const adminRoutes = require('./routes/adminRoutes')
const authRoutes = require('./routes/authRoutes')
const connectDb = require('./config/db')
const orderRoutes = require('./routes/orderRoutes')
const productRoutes = require('./routes/productRoutes')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API escuchando en http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Error al conectar DB:', error.message)
    process.exit(1)
  })
