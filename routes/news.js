const express = require('express');
const router = express.Router();
const News = require('../models/News');
const authMiddleware = require('../middleware/auth');  // Ver abaixo

// GET todas as notícias (público, mas filtradas por published no frontend)
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST nova notícia (protegido)
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, image, published } = req.body;
  if (!title || !description || !image) return res.status(400).json({ message: 'Campos obrigatórios faltando' });

  const news = new News({ title, description, image, published });
  try {
    const saved = await news.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT atualizar notícia (protegido)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Notícia não encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE notícia (protegido)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Notícia não encontrada' });
    res.json({ message: 'Notícia deletada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;