const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const connectDb = require('./config/db')
const Product = require('./models/Product')
const User = require('./models/User')

dotenv.config()

const products = [
  {
    title: 'Chaqueta Mono Canvas',
    description: 'Corte sobrio, peso liviano y textura mate para looks urbanos.',
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    price: 89.9,
    stock: 20,
  },
  {
    title: 'Bota Sierra 82',
    description: 'Suela de alto agarre con plantilla comoda para uso diario.',
    category: 'Calzado',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    price: 129,
    stock: 12,
  },
  {
    title: 'Mochila Delta Utility',
    description: 'Nylon impermeable y compartimentos internos para laptop y accesorios.',
    category: 'Accesorios',
    image: 'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=900&q=80',
    price: 74.5,
    stock: 15,
  },
  {
    title: 'Pantalon Trama Rude',
    description: 'Calce recto y tela resistente para uso diario.',
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80',
    price: 62,
    stock: 18,
  },
]

async function seedProducts() {
  try {
    await connectDb()
    await Product.deleteMany({})
    await Product.insertMany(products)
    const adminPassword = await bcrypt.hash('admin12345', 10)
    await User.findOneAndUpdate(
      { email: 'admin@motaccio.local' },
      {
        name: 'Admin',
        email: 'admin@motaccio.local',
        password: adminPassword,
        role: 'admin',
      },
      { upsert: true, returnDocument: 'after' },
    )
    console.log('Seed completado')
    console.log('Admin creado: admin@motaccio.local / admin12345')
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error.message)
    process.exit(1)
  }
}

seedProducts()
