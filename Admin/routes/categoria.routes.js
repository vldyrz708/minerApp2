const express = require('express');
const router = express.Router();
const categoriaController = require('../controller/categoria.controller');
const authController = require('../controller/auth.controller');

// Vista para administrar categorias
router.get('/', authController.isAuthenticated, categoriaController.showListView);

// API
router.get('/api', authController.isAuthenticated, categoriaController.list);
router.post('/api', authController.isAuthenticated, categoriaController.create);
router.delete('/api/:id', authController.isAuthenticated, categoriaController.remove);
router.put('/api/:id', authController.isAuthenticated, categoriaController.update);

module.exports = router;
