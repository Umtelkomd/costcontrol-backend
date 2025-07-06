const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Authentication routes
router.post('/login', usersController.login);

// User routes
router.get('/', usersController.getAllUsers);
router.post('/', usersController.createUser);
router.get('/:id', usersController.getUserProfile);

module.exports = router; 