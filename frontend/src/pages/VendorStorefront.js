import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique session IDs

const VendorStorefront = () => {
  const { vendor_id } = useParams(); // Get vendor_id from URL
  const navigate = useNavigate(); // Use navigate to redirect to GuestCart
  const [storefrontProducts, setStorefrontProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [addedToCart, setAddedToCart] = useState({});
  const [vendorEmail, setVendorEmail] = useState(''); // Track vendor email

  useEffect(() => {
    const clearPreviousSessionCart = async (session_id) => {
      try {
        await supabase
          .from('guest_cart')
          .delete()
          .eq('session_id', session_id);
      } catch (err) {
        console.error('Error clearing previous session cart:', err);
      }
    };

    // Check if a session ID exists
    const existingSessionId = localStorage.getItem('session_id');

    if (existingSessionId) {
      // Clear the cart for the previous session
      clearPreviousSessionCart(existingSessionId);
    }

    // Generate and store a new unique session ID
    const newSessionId = uuidv4();
    localStorage.setItem('session_id', newSessionId);
  }, []);

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
            setStorefrontProducts(data);
          }
        } catch (err) {
          console.error('Fetch storefront products exception:', err);
        }
      }
    };

    fetchVendorEmail();
    fetchStorefrontProducts();
  }, [vendor_id]);

  const handleAddToCart = async (product) => {
    if (addedToCart[product.product_sku]) {
      return;
    }

    const session_id = localStorage.getItem('session_id');

    try {
      const { error } = await supabase
        .from('guest_cart')
        .insert([
          {
            session_id,
            product_sku: product.product_sku,
            quantity: quantities[product.product_sku] || 1,
            vendor_email: vendorEmail, // Add vendor email to cart item
            price: product.retail_price // Add product price to cart item
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
    navigate('/guest-cart'); // Navigate to GuestCart
  };

  return (
    <div>
      <h1>Vendor Storefront</h1>
      <button onClick={handleViewCart}>View My Cart</button> {/* Add View My Cart button */}
      <div>
        {storefrontProducts.length === 0 ? (
          <p>No products in this storefront</p>
        ) : (
          storefrontProducts.map((product) => (
            <div key={product.product_sku}>
              <p>Product SKU: {product.product_sku}</p>
              <p>Price: ${product.retail_price}</p> {/* Display product price */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => decrementQuantity(product.product_sku)}>-</button>
                <input
                  type="number"
                  value={quantities[product.product_sku] || 1}
                  onChange={(e) => handleQuantityChange(product.product_sku, parseInt(e.target.value, 10))}
                  style={{ width: '50px', textAlign: 'center', margin: '0 10px' }}
                />
                <button onClick={() => incrementQuantity(product.product_sku)}>+</button>
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={addedToCart[product.product_sku]}
              >
                {addedToCart[product.product_sku] ? 'Already Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VendorStorefront;
