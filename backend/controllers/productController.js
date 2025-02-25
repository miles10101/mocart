const supabase = require('../config/supabase');

// Function to get products by vendor_id
const getProductsByVendor = async (req, res) => {
  const { vendor_id } = req.query;
  if (!vendor_id) {
    return res.status(400).json({ error: "vendor_id is required" });
  }
  
  const { data, error } = await supabase
    .from('vendorcatalog')
    .select('*')
    .eq('vendor_id', vendor_id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json(data);
};

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

module.exports = { getAllProducts, createProduct, getProductsByVendor };
