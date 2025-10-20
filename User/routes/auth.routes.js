const express = require('express');
const router = express.Router();
const ctrl = require('../controller/auth.controller');

router.get('/login', ctrl.showLogin);
router.get('/register', ctrl.showRegister);

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);

module.exports = router;
