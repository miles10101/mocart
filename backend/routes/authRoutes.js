// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/authController');

router.post('/signup', createUser);

module.exports = router; // Ensure the router is correctly exported
