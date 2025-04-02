import supabase from '../supabaseClient';

const updateUnitsAvailable = async (productSku, quantity) => {
  try {
    // Fetch the current units available from the virtualwarehouse table
    const { data, error } = await supabase
      .from('virtualwarehouse')
      .select('units_available')
      .eq('product_sku', productSku)
      .single();

    if (error) {
      console.error(`Error fetching units available for product SKU ${productSku}:`, error);
      return { success: false, availableUnits: 0 };
    }

    const availableUnits = data.units_available;

    // Check if the requested quantity exceeds available units
    if (quantity > availableUnits) {
      console.warn(
        `Requested quantity (${quantity}) exceeds available units (${availableUnits}) for product SKU ${productSku}`
      );
      return { success: false, availableUnits }; // Return the actual available units
    }

    // Update the units_available field by subtracting the quantity
    const { error: updateError } = await supabase
      .from('virtualwarehouse')
      .update({ units_available: availableUnits - quantity })
      .eq('product_sku', productSku);

    if (updateError) {
      console.error(`Error updating units available for product SKU ${productSku}:`, updateError);
      return { success: false, availableUnits };
    }

    console.log(
      `Units available for product SKU ${productSku} updated successfully. Remaining units: ${
        availableUnits - quantity
      }`
    );
    return { success: true, availableUnits: availableUnits - quantity }; // Return the updated units
  } catch (err) {
    console.error('Unexpected error in updateUnitsAvailable:', err);
    return { success: false, availableUnits: 0 };
  }
};

export default updateUnitsAvailable;
