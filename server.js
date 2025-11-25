require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// RESOLVE O ERRO 413 (Content Too Large)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS: aceita tudo em produção, localhost em desenvolvimento
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:8080'
}));

// Rotas
app.use('/api/news', require('./routes/news'));
app.use('/api/auth', require('./routes/auth'));


// Rota de teste / health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API INAE 100% funcional!',
    timestamp: new Date()
  });
});


// Teste rápido
app.get('/', (req, res) => {
  res.json({ message: 'Backend INAE 100% funcional!' });
});

// CONEXÃO COM MONGODB (Mongoose 7+ — sem opções antigas)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado com sucesso'))
  .catch(err => console.error('Erro MongoDB:', err));

// Porta do Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: https://inae-admin.onrender.com`);
});