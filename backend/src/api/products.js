// backend/src/api/products.js
const express = require('express');
const supabase = require('../supabaseClient');
const { validateRetailPrice } = require('../utils/validation');

const router = express.Router();

router.post('/import', async (req, res) => {
  const { vendor_id, product_sku, retail_price } = req.body;

  try {
    const isValid = await validateRetailPrice(product_sku, retail_price);
    if (!isValid) {
      return res.status(400).json({ error: 'Retail price is too low' });
    }

    const { error } = await supabase
      .from('VendorCatalog')
      .insert([{ vendor_id, product_sku, retail_price }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Product imported successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
