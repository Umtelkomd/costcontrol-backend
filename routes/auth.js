const express = require('express');
const router = express.Router();
const { login, verify, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/verify', authenticateToken, verify);
router.post('/logout', authenticateToken, logout);

module.exports = router;