const supabase = require('../config/supabaseClient');

// Add item to guest cart
exports.addItemToCart = async (req, res) => {
  const { session_id, product_sku, quantity } = req.body;

  try {
    const { data, error } = await supabase
      .from('guest_cart')
      .insert([{ session_id, product_sku, quantity }]);

    if (error) {
      return res.status(500).json({ error: 'Error adding item to cart' });
    }

    res.status(200).json({ message: 'Item added to cart', data });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get items in guest cart
exports.getCartItems = async (req, res) => {
  const { session_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('guest_cart')
      .select('*')
      .eq('session_id', session_id);

    if (error) {
      return res.status(500).json({ error: 'Error fetching cart items' });
    }

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Clear guest cart
exports.clearCart = async (req, res) => {
  const { session_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('guest_cart')
      .delete()
      .eq('session_id', session_id);

    if (error) {
      return res.status(500).json({ error: 'Error clearing cart' });
    }

    res.status(200).json({ message: 'Cart cleared', data });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
