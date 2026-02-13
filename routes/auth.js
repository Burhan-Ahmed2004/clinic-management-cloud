const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login route
router.post('/login', authController.login);

// Get current user from session
router.get('/currentUser', authController.getCurrentUser);

// Logout route
router.post('/logout', authController.logout);

module.exports = router;
