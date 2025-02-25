const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

// Create a new order
router.post('/create', ordersController.createOrder);

module.exports = router;
