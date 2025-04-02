import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const OutOfStockProducts = () => {
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [isDelistingAll, setIsDelistingAll] = useState(false);

  // Fetch the logged-in vendor's ID
  useEffect(() => {
    const fetchVendorId = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      } else if (data.session) {
        const user = data.session.user;
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', user.email);

        if (profileData && profileData.length > 0) {
          setVendorId(profileData[0].id);
        } else if (profileError) {
          console.error('Error fetching profile:', profileError);
        }
      }
    };

    fetchVendorId();
  }, []);

  // Fetch out-of-stock products for the logged-in vendor
  useEffect(() => {
    const fetchOutOfStockProducts = async () => {
      if (vendorId) {
        try {
          const { data, error } = await supabase
            .from('vendorcatalog')
            .select('*')
            .eq('vendor_id', vendorId)
            .eq('availability', 'out of stock'); // Fetch only out-of-stock products

          if (error) {
            console.error('Error fetching out-of-stock products:', error);
          } else {
            setOutOfStockProducts(data);
          }
        } catch (err) {
          console.error('Fetch out-of-stock products exception:', err);
        }
      }
    };

    fetchOutOfStockProducts();
  }, [vendorId]);

  // Delist a single product
  const delistProduct = async (product) => {
    try {
      const { data, error } = await supabase
        .from('vendorcatalog')
        .delete()
        .eq('vendor_id', vendorId)
        .eq('product_sku', product.product_sku);

      if (error) {
        console.error('Error deleting product:', error);
      } else {
        setOutOfStockProducts((prev) =>
          prev.filter((item) => item.product_sku !== product.product_sku)
        );
        console.log('Product delisted successfully:', data);
      }
    } catch (err) {
      console.error('Delist product exception:', err);
    }
  };

  // Delist all displayed products
  const delistAllProducts = async () => {
    if (outOfStockProducts.length === 0) return;

    setIsDelistingAll(true);

    try {
      const productSKUs = outOfStockProducts.map((product) => product.product_sku);
      const { data, error } = await supabase
        .from('vendorcatalog')
        .delete()
        .eq('vendor_id', vendorId)
        .in('product_sku', productSKUs); // Delete all products by SKU

      if (error) {
        console.error('Error delisting all products:', error);
      } else {
        setOutOfStockProducts([]); // Clear the list after successful delisting
        console.log('All out-of-stock products delisted successfully:', data);
      }
    } catch (err) {
      console.error('Delist all products exception:', err);
    } finally {
      setIsDelistingAll(false);
    }
  };

  return (
    <div>
      <h1>Out of Stock Products</h1>
      {outOfStockProducts.length === 0 ? (
        <p>No out-of-stock products found.</p>
      ) : (
        <div>
          <button
            onClick={delistAllProducts}
            disabled={isDelistingAll}
            style={{
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: isDelistingAll ? '#ccc' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isDelistingAll ? 'not-allowed' : 'pointer',
            }}
          >
            {isDelistingAll ? 'Delisting All...' : 'Delist All'}
          </button>
          {outOfStockProducts.map((product) => (
            <div key={product.product_sku} style={{ marginBottom: '20px' }}>
              <p>Product Name: {product.product_name}</p>
              <p>Product SKU: {product.product_sku}</p>
              <button
                onClick={() => delistProduct(product)}
                style={{
                  padding: '10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Delist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutOfStockProducts;
