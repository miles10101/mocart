const express = require('express');
const router = express.Router();
const guestCartController = require('../controllers/guestCartController');

// Add item to guest cart
router.post('/add', guestCartController.addItemToCart);

// Get items in guest cart
router.get('/:session_id', guestCartController.getCartItems);

// Clear guest cart
router.delete('/:session_id', guestCartController.clearCart);

module.exports = router;
