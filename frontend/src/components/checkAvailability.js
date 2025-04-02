import supabase from '../supabaseClient';

const checkAvailability = async (product_sku) => {
  try {
    const { data, error } = await supabase
      .from('virtualwarehouse')
      .select('availability')
      .eq('product_sku', product_sku)
      .single();
    if (error) {
      console.error(`Error checking availability for product SKU ${product_sku}:`, error);
      return false;
    }
    return data.availability !== 'out of stock';
  } catch (err) {
    console.error('Unexpected error during availability check:', err);
    return false;
  }
};

export default checkAvailability;
