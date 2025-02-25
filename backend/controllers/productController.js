// controllers/productController.js
const supabase = require('../config/supabase');

// Example function to get all products
const getAllProducts = async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ products: data });
};

// Example function to create a new product
const createProduct = async (req, res) => {
  const { name, price } = req.body;

  const { data, error } = await supabase.from('products').insert([
    { name, price },
  ]);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ product: data });
};

module.exports = { getAllProducts, createProduct };
