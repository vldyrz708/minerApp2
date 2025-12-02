const express = require('express');
const router = express.Router();
const { getLugares } = require('../controllers/lugaresController');

// Ruta para obtener todos los lugares
router.get('/lugares', getLugares);

module.exports = router;
