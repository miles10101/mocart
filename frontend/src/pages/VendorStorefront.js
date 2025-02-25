import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../supabaseClient';
import EmailPopup from '../components/EmailPopup'; // Ensure this path is correct

const VendorStorefront = () => {
  const { vendor_id } = useParams(); // Get vendor_id from URL
  const [storefrontProducts, setStorefrontProducts] = useState([]);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [addedToCart, setAddedToCart] = useState({}); // Track added to cart status

  useEffect(() => {
    if (vendor_id) {
      const fetchStorefrontProducts = async () => {
        try {
          const { data, error } = await supabase
            .from('vendorcatalog')
            .select('*')
            .eq('vendor_id', vendor_id); // Fetch products by vendor_id
          if (error) {
            console.error('Error fetching storefront products:', error);
          } else {
            console.log('Fetched storefront products:', data);
            setStorefrontProducts(data);
          }
        } catch (err) {
          console.error('Fetch storefront products exception:', err);
        }
      };

      fetchStorefrontProducts();
    }
  }, [vendor_id]);

  const handleAddToCart = (product) => {
    if (addedToCart[product.product_sku]) {
      return;
    }
    setSelectedProduct(product);
    setShowEmailPopup(true);
  };

  const handleEmailSubmit = async (buyerEmail) => {
    if (!buyerEmail) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cart')
        .insert([
          {
            vendor_id,
            buyer_email: buyerEmail,
            product_sku: selectedProduct.product_sku,
            quantity: quantities[selectedProduct.product_sku] || 1,
          },
        ]);

      if (error) {
        console.error('Error adding to cart:', error);
      } else {
        console.log('Product added to cart successfully');
        setAddedToCart((prev) => ({
          ...prev,
          [selectedProduct.product_sku]: true,
        }));
      }
    } catch (err) {
      console.error('Exception adding to cart:', err);
    }

    setShowEmailPopup(false);
  };

  const handleCancel = () => {
    setShowEmailPopup(false);
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

  return (
    <div>
      <h1>Vendor Storefront</h1>
      {showEmailPopup && (
        <EmailPopup
          onSubmit={handleEmailSubmit}
          onCancel={handleCancel}
        />
      )}
      <div>
        {storefrontProducts.length === 0 ? (
          <p>No products in this storefront</p>
        ) : (
          storefrontProducts.map((product) => (
            <div key={product.product_sku}>
              <p>Product SKU: {product.product_sku}</p>
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
