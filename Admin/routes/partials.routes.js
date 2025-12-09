const express = require('express');
const router = express.Router();
const path = require('path');

// Servir header parcial estático (incluye enlaces y comportamiento responsive)
router.get('/header', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/partials/header.html'));
});

module.exports = router;
