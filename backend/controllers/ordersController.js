const supabase = require('../config/supabaseClient');

// Create a new order
exports.createOrder = async (req, res) => {
  const { session_id, product_sku, quantity, buyer_email } = req.body;

  if (!session_id || !product_sku || !quantity || !buyer_email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([{ session_id, product_sku, quantity, buyer_email }]);

    if (error) {
      return res.status(500).json({ error: 'Error creating order' });
    }

    res.status(200).json({ message: 'Order created successfully', data });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
