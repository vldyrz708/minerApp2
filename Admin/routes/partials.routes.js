const express = require('express');
const path = require('path');
const router = express.Router();

// Servir partials (archivos HTML estáticos) desde Admin/views/partials
router.get('/header', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/partials/header.html'));
});

module.exports = router;
