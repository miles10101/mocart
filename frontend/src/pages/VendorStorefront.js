import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique session IDs
import checkAvailability from '../components/checkAvailability'; // Import the availability check utility
import updateUnitsAvailable from '../components/updateUnitsAvailable'; // Import the update units available utility

const VendorStorefront = () => {
  const { vendor_id } = useParams(); // Get vendor_id from URL
  const navigate = useNavigate(); // Use navigate to redirect to GuestCart
  const [storefrontProducts, setStorefrontProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [addedToCart, setAddedToCart] = useState({});
  const [vendorEmail, setVendorEmail] = useState(''); // Track vendor email
  const [availabilityMap, setAvailabilityMap] = useState({}); // Track availability for products
  const [variantSelection, setVariantSelection] = useState({}); // For variant groups

  useEffect(() => {
    const clearPreviousSessionCart = async (session_id) => {
      try {
        await supabase.rpc('restore_inventory_for_cart', { p_session_id: session_id });
      } catch (err) {
        console.error('Error clearing previous session cart and restoring inventory:', err);
      }
    };

    const initializeSession = () => {
      const existingSessionId = localStorage.getItem('session_id');

      if (existingSessionId) {
        // Clear cart from previous session using Supabase function
        clearPreviousSessionCart(existingSessionId);
      }

      // Generate and store a new session ID
      const newSessionId = uuidv4();
      localStorage.setItem('session_id', newSessionId);
      console.log('New session ID generated:', newSessionId);
    };

    initializeSession();
  }, []);

  // Group products based on the 'variants' field.
  // If 'variants' is not null, use that value as the group key;
  // otherwise, group standalone products by their own product_sku.
  const groupProductsByVariants = (products) => {
    const groups = {};
    products.forEach((product) => {
      if (product.variants) {
        const groupKey = product.variants;
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(product);
      } else {
        groups[product.product_sku] = [product];
      }
    });
    return Object.keys(groups).map((key) => {
      const group = groups[key];
      if (group[0].variants) {
        return {
          groupKey: key,
          isVariantGroup: true,
          variants: group,
        };
      } else {
        return {
          groupKey: key,
          isVariantGroup: false,
          product: group[0],
        };
      }
    });
  };

  // Fetch vendor email and storefront products
  useEffect(() => {
    const fetchVendorEmail = async () => {
      if (vendor_id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', vendor_id)
            .single();
          if (error) {
            console.error('Error fetching vendor email:', error);
          } else {
            setVendorEmail(data.email);
          }
        } catch (err) {
          console.error('Fetch vendor email exception:', err);
        }
      }
    };

    const fetchStorefrontProducts = async () => {
      if (vendor_id) {
        try {
          const { data, error } = await supabase
            .from('vendorcatalog')
            .select('*')
            .eq('vendor_id', vendor_id);
          if (error) {
            console.error('Error fetching storefront products:', error);
          } else {
            // Group fetched products by variants before setting state
            const groupedProducts = groupProductsByVariants(data);
            setStorefrontProducts(groupedProducts);

            // Build availability map based on custom logic (or use product.availability directly)
            const availabilityData = {};
            for (const product of data) {
              const isAvailable = await checkAvailability(product.product_sku);
              availabilityData[product.product_sku] = isAvailable;
            }
            setAvailabilityMap(availabilityData);
          }
        } catch (err) {
          console.error('Fetch storefront products exception:', err);
        }
      }
    };

    fetchVendorEmail();
    fetchStorefrontProducts();
  }, [vendor_id]);

  // Realtime subscription for UPDATE events on vendorcatalog
  useEffect(() => {
    if (!vendor_id) return;

    const subscription = supabase
      .channel('vendorcatalog-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vendorcatalog',
          filter: `vendor_id=eq.${vendor_id}`,
        },
        (payload) => {
          console.log('Realtime update payload:', payload);

          setStorefrontProducts((prev) =>
            prev.map((group) => {
              if (group.isVariantGroup) {
                const newVariants = group.variants.map((variant) => {
                  if (variant.product_sku === payload.new.product_sku) {
                    return { ...variant, availability: payload.new.availability };
                  }
                  return variant;
                });
                return { ...group, variants: newVariants };
              } else {
                if (group.product.product_sku === payload.new.product_sku) {
                  return { ...group, product: { ...group.product, availability: payload.new.availability } };
                }
                return group;
              }
            })
          );

          setAvailabilityMap((prev) => ({
            ...prev,
            [payload.new.product_sku]: payload.new.availability.toLowerCase() !== 'out of stock',
          }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [vendor_id]);

  const handleAddToCart = async (product) => {
    if (addedToCart[product.product_sku]) return;

    const session_id = localStorage.getItem('session_id');
    const quantity = quantities[product.product_sku] || 1;

    const { success, availableUnits } = await updateUnitsAvailable(product.product_sku, quantity);
    if (!success) {
      alert(
        `Unable to add to cart. Only ${availableUnits} unit(s) available for product ${product.product_sku}. Please adjust your quantity.`
      );
      return;
    }

    try {
      const { error } = await supabase
        .from('guest_cart')
        .insert([
          {
            session_id,
            product_sku: product.product_sku,
            quantity,
            vendor_email: vendorEmail,
            price: product.retail_price,
          },
        ]);
      if (error) {
        console.error('Error adding to cart:', error);
      } else {
        console.log('Product added to cart successfully');
        setAddedToCart((prev) => ({
          ...prev,
          [product.product_sku]: true,
        }));
      }
    } catch (err) {
      console.error('Exception adding to cart:', err);
    }
  };

  const handleQuantityChange = (productSku, newQuantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productSku]: newQuantity,
    }));
  };

  const incrementQuantity = (productSku) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productSku]: (prevQuantities[productSku] || 1) + 1,
    }));
  };

  const decrementQuantity = (productSku) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productSku]: Math.max(1, (prevQuantities[productSku] || 1) - 1),
    }));
  };

  const handleViewCart = () => {
    navigate('/guest-cart');
  };

  return (
    <div>
      <h1>Vendor Storefront</h1>
      <button onClick={handleViewCart}>Proceed to Checkout</button>
      <div>
        {storefrontProducts.length === 0 ? (
          <p>No products in this storefront</p>
        ) : (
          storefrontProducts.map((group) => {
            if (group.isVariantGroup) {
              // For variant groups, determine the selected variant.
              const defaultSku = String(group.variants[0].product_sku);
              const selectedVariantSku = variantSelection[group.groupKey]
                ? String(variantSelection[group.groupKey])
                : defaultSku;
              const selectedVariant =
                group.variants.find((variant) => String(variant.product_sku) === selectedVariantSku) ||
                group.variants[0];

              return (
                <div key={group.groupKey}>
                  <p>Product SKU: {selectedVariant.product_sku}</p>
                  <p>Price: ${selectedVariant.retail_price}</p>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => decrementQuantity(selectedVariant.product_sku)}>-</button>
                    <input
                      type="number"
                      value={quantities[selectedVariant.product_sku] || 1}
                      onChange={(e) =>
                        handleQuantityChange(selectedVariant.product_sku, parseInt(e.target.value, 10))
                      }
                      style={{ width: '50px', textAlign: 'center', margin: '0 10px' }}
                    />
                    <button onClick={() => incrementQuantity(selectedVariant.product_sku)}>+</button>
                  </div>
                  <select
                    onChange={(e) =>
                      setVariantSelection({
                        ...variantSelection,
                        [group.groupKey]: e.target.value,
                      })
                    }
                    value={variantSelection[group.groupKey] || defaultSku}
                  >
                    {group.variants.map((variant) => (
                      <option key={variant.product_sku} value={String(variant.product_sku)}>
                        {variant.option1 ? variant.option1 : variant.product_name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAddToCart(selectedVariant)}
                    disabled={
                      !availabilityMap[selectedVariant.product_sku] ||
                      addedToCart[selectedVariant.product_sku]
                    }
                  >
                    {!availabilityMap[selectedVariant.product_sku]
                      ? 'Out of Stock'
                      : addedToCart[selectedVariant.product_sku]
                      ? 'Already Added to Cart'
                      : 'Add to Cart'}
                  </button>
                </div>
              );
            } else {
              const product = group.product;
              return (
                <div key={product.product_sku}>
                  <p>Product SKU: {product.product_sku}</p>
                  <p>Price: ${product.retail_price}</p>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => decrementQuantity(product.product_sku)}>-</button>
                    <input
                      type="number"
                      value={quantities[product.product_sku] || 1}
                      onChange={(e) =>
                        handleQuantityChange(product.product_sku, parseInt(e.target.value, 10))
                      }
                      style={{ width: '50px', textAlign: 'center', margin: '0 10px' }}
                    />
                    <button onClick={() => incrementQuantity(product.product_sku)}>+</button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={
                      !availabilityMap[product.product_sku] ||
                      addedToCart[product.product_sku]
                    }
                  >
                    {!availabilityMap[product.product_sku]
                      ? 'Out of Stock'
                      : addedToCart[product.product_sku]
                      ? 'Already Added to Cart'
                      : 'Add to Cart'}
                  </button>
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
};

export default VendorStorefront;
