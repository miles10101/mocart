import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const VirtualWarehouse = () => {
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState('');
  const [importedProducts, setImportedProducts] = useState([]);
  const [vendorId, setVendorId] = useState('');

  useEffect(() => {
    // Check the logged-in user's email and vendor ID
    const getUserDetails = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      } else {
        if (data.session) {
          setEmail(data.session.user.email);
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
      }
    };

    getUserDetails();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('virtualwarehouse').select('*');
        if (error) {
          console.error('Error fetching products:', error);
        } else {
          console.log('Fetched products:', data);
          setProducts(data);
        }
      } catch (err) {
        console.error('Fetch products exception:', err);
      }
    };

    fetchProducts();
  }, []);

  // Fetch imported products for the logged-in email
  useEffect(() => {
    if (vendorId) {
      const fetchImportedProducts = async () => {
        try {
          const { data, error } = await supabase
            .from('vendorcatalog')
            .select('product_sku')
            .eq('vendor_id', vendorId);
          if (error) {
            console.error('Error fetching imported products:', error);
          } else {
            console.log('Fetched imported products:', data);
            setImportedProducts(data.map((item) => item.product_sku));
          }
        } catch (err) {
          console.error('Fetch imported products exception:', err);
        }
      };

      fetchImportedProducts();
    }
  }, [vendorId]);

  // Handle the import action
  const importProduct = async (product) => {
    try {
      console.log('Import button clicked for product:', product);
      console.log('Logged-in email:', email);
      const { data, error } = await supabase
        .from('vendorcatalog')
        .insert([{ 
          vendor_id: vendorId,
          email: email,
          product_sku: product.product_sku 
        }]);
      if (error) {
        console.error('Error inserting email into vendorcatalog:', error);
      } else {
        console.log('Email inserted into vendorcatalog:', data);
        setImportedProducts((prev) => [...prev, product.product_sku]);
      }
    } catch (err) {
      console.error('Import product exception:', err);
    }
  };

  // Handle the delist action
  const delistProduct = async (product) => {
    try {
      console.log('Delist button clicked for product:', product);
      console.log('Logged-in email:', email);
      const { data, error } = await supabase
        .from('vendorcatalog')
        .delete()
        .eq('vendor_id', vendorId)
        .eq('product_sku', product.product_sku);
      if (error) {
        console.error('Error deleting record from vendorcatalog:', error);
      } else {
        console.log('Record deleted from vendorcatalog:', data);
        setImportedProducts((prev) => prev.filter((sku) => sku !== product.product_sku));
      }
    } catch (err) {
      console.error('Delist product exception:', err);
    }
  };

  return (
    <div>
      <h1>Virtual Warehouse</h1>
      <div>
        {products.length === 0 ? (
          <p>Products Loading...</p>
        ) : (
          products.map((product) => (
            <div key={product.product_sku}>
              <h2>{product.product_name}</h2>
              <p>{product.description}</p>
              <p>Wholesale Price: ${product.wholesale_price}</p>
              <p>Availability: {product.availability}</p>
              {importedProducts.includes(product.product_sku) ? (
                <button onClick={() => delistProduct(product)}>Delist from my storefront</button>
              ) : (
                <button onClick={() => importProduct(product)}>Import to my storefront</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VirtualWarehouse;
