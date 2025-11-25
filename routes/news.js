const express = require('express')
const router = express.Router()
const News = require('../models/News')
const auth = require('../middleware/auth')

// ======================== CLOUDINARY CONFIG ========================
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ======================== FUNÇÃO PARA FAZER UPLOAD ========================
const uploadToCloudinary = async (base64Image) => {
  if (!base64Image || !base64Image.startsWith('data:image')) {
    return base64Image // já é URL (caso esteja editando)
  }

  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'inae_noticias',
      width: 1200,
      height: 1200,
      crop: 'limit',
      quality: 'auto:good',
      format: 'jpg',
      flags: 'progressive'
    })
    return result.secure_url
  } catch (error) {
    console.error('Erro no Cloudinary:', error)
    throw new Error('Falha ao fazer upload da imagem')
  }
}

// ======================== ROTAS ========================

// 1. Listar todas as notícias (público)
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 })
    res.json(news)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// 2. Ver notícia + incrementar visualizações (público)
router.get('/:id/view', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
    if (!news) return res.status(404).json({ message: 'Notícia não encontrada' })
    res.json(news)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// 3. Criar notícia (admin)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, image, published } = req.body

    const imageUrl = await uploadToCloudinary(image)

    const news = new News({
      title,
      description,
      image: imageUrl,
      published: published !== undefined ? published : true,
      views: 0
    })

    const saved = await news.save()
    res.status(201).json(saved)
  } catch (err) {
    console.error('Erro ao criar notícia:', err)
    res.status(400).json({ message: err.message })
  }
})

// 4. Atualizar notícia (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, image, published } = req.body

    const updates = { title, description, published }

    // Só faz upload se for base64 (nova imagem)
    if (image && image.startsWith('data:image')) {
      updates.image = await uploadToCloudinary(image)
    }

    const news = await News.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    )

    if (!news) return res.status(404).json({ message: 'Notícia não encontrada' })

    res.json(news)
  } catch (err) {
    console.error('Erro ao atualizar:', err)
    res.status(400).json({ message: err.message })
  }
})

// 5. Deletar notícia (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
    if (!news) return res.status(404).json({ message: 'Notícia não encontrada' })

    // Opcional: apagar imagem do Cloudinary
    if (news.image && news.image.includes('cloudinary')) {
      const publicId = news.image.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(`inae_noticias/${publicId}`)
    }

    await news.deleteOne()
    res.json({ message: 'Notícia removida com sucesso' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router