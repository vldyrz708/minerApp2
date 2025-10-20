const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');
const registerController = require('../controller/register.controller');
const path = require('path');

// Dashboard
router.get('/dashboard', authController.isAuthenticated, (req, res) => {
	res.sendFile(path.join(__dirname, '../views/dashboard.html'));
});

// Rutas de registro
router.get('/register', registerController.showRegisterForm);
router.post('/register', registerController.register);

// Rutas de autenticación
router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);

// Ruta de cierre de sesión
router.get('/logout', authController.isAuthenticated, authController.logout);

module.exports = router;
