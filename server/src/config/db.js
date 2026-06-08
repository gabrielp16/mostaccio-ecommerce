const mongoose = require('mongoose')

async function connectDb() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mostaccio_barber_club'
  await mongoose.connect(mongoUri)
  console.log('MongoDB conectado')
}

module.exports = connectDb
