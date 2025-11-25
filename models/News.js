const mongoose = require('mongoose')

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  published: { type: Boolean, default: true },
  views: { type: Number, default: 0 },        // NOVO CAMPO
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('News', NewsSchema)