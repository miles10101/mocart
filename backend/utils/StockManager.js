const supabase = require('../supabaseClient');

const StockManager = {
  // Check if sufficient stock is available for a product
  async checkStockAvailability(product_sku, quantity) {
    try {
      const { data, error } = await supabase
        .from('virtualwarehouse')
        .select('units_available')
        .eq('product_sku', product_sku)
        .single();

      if (error) {
        console.error('Error fetching stock availability:', error);
        return { success: false, message: 'Error fetching stock availability.' };
      }

      if (!data || data.units_available < quantity) {
        return {
          success: false,
          message: 'Not enough stock available for this product.',
        };
      }

      return { success: true, units_available: data.units_available };
    } catch (err) {
      console.error('Unexpected error while checking stock:', err);
      return { success: false, message: 'Server error while checking stock.' };
    }
  },

  // Deduct stock for a specific product when adding to cart
  async deductStock(product_sku, quantity) {
    try {
      const { error } = await supabase.rpc('deduct_units_on_add_to_cart', {
        product_sku,
        quantity,
      });

      if (error) {
        console.error('Error deducting stock:', error);
        return { success: false, message: 'Error deducting stock.' };
      }

      return { success: true, message: 'Stock deducted successfully.' };
    } catch (err) {
      console.error('Unexpected error while deducting stock:', err);
      return { success: false, message: 'Server error while deducting stock.' };
    }
  },

  // Restore stock for all products in a session cart
  async restoreStock(session_id) {
    try {
      // Validate session_id before proceeding
      if (!session_id) {
        console.error('Session ID is missing or invalid.');
        return { success: false, message: 'Invalid session ID.' };
      }

      // Fetch all products in the guest cart for the given session_id
      const { data: cartItems, error: fetchError } = await supabase
        .from('guest_cart')
        .select('product_sku, quantity')
        .eq('session_id', session_id);

      if (fetchError) {
        console.error('Error fetching cart items:', fetchError);
        return { success: false, message: 'Error fetching cart items.' };
      }

      if (!cartItems || cartItems.length === 0) {
        console.log('No cart items found for session:', session_id);
        return { success: true, message: 'No stock to restore; cart is empty.' };
      }

      // Update inventory for each product
      for (const item of cartItems) {
        const { product_sku, quantity } = item;

        const { error: restoreError } = await supabase
          .from('virtualwarehouse')
          .update({ units_available: supabase.raw('units_available + ?', [quantity]) })
          .eq('product_sku', product_sku);

        if (restoreError) {
          console.error(`Error restoring stock for product_sku: ${product_sku}`, restoreError);
          return { success: false, message: `Error restoring stock for product_sku: ${product_sku}` };
        }
      }

      return { success: true, message: 'Stock restored successfully.' };
    } catch (err) {
      console.error('Unexpected error while restoring stock:', err);
      return { success: false, message: 'Server error while restoring stock.' };
    }
  },
};

module.exports = StockManager; // Export using CommonJS syntax
