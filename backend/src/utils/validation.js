// backend/src/utils/validation.js
const supabase = require('../supabaseClient');

exports.validateRetailPrice = async (product_sku, retail_price) => {
  const { data: product, error } = await supabase
    .from('VirtualWarehouse')
    .select('wholesale_price')
    .eq('product_sku', product_sku)
    .single();

  if (error) {
    throw new Error('Product not found');
  }

  const minRetailPrice = 1.15 * product.wholesale_price;
  return retail_price >= minRetailPrice;
};
