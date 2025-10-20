const express = require('express');
const path = require('path');

// Exportamos un router que será montado por el servidor principal (index.js)
const router = express.Router();

// Rutas de autenticación (definidas en /Admin/routes)
const authRoutes = require('./routes/auth.routes');
const lugarRoutes = require('./routes/lugar.routes');
const aiRoutes = require('./routes/ai.routes');

// Montar las rutas de auth dentro del router. auth.routes ya usa rutas relativas
router.use('/', authRoutes);

// Montar rutas de lugares en /admin/lugares
router.use('/lugares', lugarRoutes);
// Rutas de AI demo
router.use('/ai', aiRoutes);


// Ruta inicial para /admin -> redirige a /admin/login
router.get('/', (req, res) => {
  res.redirect('/admin/login');
});

module.exports = router;
