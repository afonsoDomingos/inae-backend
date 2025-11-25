const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Senha requerida' });

  if (bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH)) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Senha inválida' });
});

module.exports = router;