const supabase = require('../config/supabaseClient');
const StockManager = require('../utils/StockManager'); // Correct import path for StockManager

// Add item to guest cart (uses StockManager for inventory checks and updates)
exports.addItemToCart = async (req, res) => {
  const { session_id, product_sku, quantity } = req.body;

  try {
    // Step 1: Check stock availability
    const stockCheck = await StockManager.checkStockAvailability(product_sku, quantity);
    if (!stockCheck.success) {
      return res.status(400).json({ success: false, message: stockCheck.message });
    }

    // Step 2: Deduct stock
    const deductionResult = await StockManager.deductStock(product_sku, quantity);
    if (!deductionResult.success) {
      return res.status(500).json({ success: false, message: deductionResult.message });
    }

    // Step 3: Add item to guest_cart
    const { data, error: insertError } = await supabase
      .from('guest_cart')
      .insert([{ session_id, product_sku, quantity, created_at: new Date().toISOString() }]);

    if (insertError) {
      console.error('Error adding to guest cart:', insertError);
      return res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
    }

    res.status(200).json({ success: true, message: 'Item added to cart successfully.', data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
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
      console.error('Error fetching cart items:', error);
      return res.status(500).json({ success: false, message: 'Error fetching cart items.' });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
