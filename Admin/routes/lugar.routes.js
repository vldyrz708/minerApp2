const express = require('express');
const router = express.Router();
const lugarController = require('../controller/lugar.controller');
const authController = require('../controller/auth.controller');
const multer = require('multer');
const path = require('path');

// Setup multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../../uploads'));
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, unique + path.extname(file.originalname));
	}
});
const upload = multer({ storage });

// Listar (vista) y API
router.get('/', authController.isAuthenticated, lugarController.list);

// Formulario creación
router.get('/nuevo', authController.isAuthenticated, lugarController.showForm);
// POST create: aceptar hasta 5 imágenes
router.post('/', authController.isAuthenticated, upload.array('images', 5), lugarController.create);

// Obtener, actualizar y eliminar
router.get('/:id', authController.isAuthenticated, lugarController.get);
router.put('/:id', authController.isAuthenticated, upload.array('images', 5), lugarController.update);
router.delete('/:id', authController.isAuthenticated, lugarController.remove);

module.exports = router;
