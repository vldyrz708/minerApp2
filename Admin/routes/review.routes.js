const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');
const reviewController = require('../controller/review.controller');

router.get('/', authController.isAuthenticated, reviewController.view);
router.get('/data', authController.isAuthenticated, reviewController.list);
router.get('/meta', authController.isAuthenticated, reviewController.meta);
router.delete('/:id', authController.isAuthenticated, reviewController.remove);

module.exports = router;
