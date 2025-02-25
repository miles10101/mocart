const express = require('express');
const router = express.Router();
const { getAllProducts, createProduct, getProductsByVendor } = require('../controllers/productController');

// Update the route to accept vendor_id query parameter
router.get('/', getProductsByVendor);
router.post('/', createProduct);

module.exports = router;
