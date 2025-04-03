import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import '../styles.css'; // Import the CSS file

const VirtualWarehouse = () => {
  const [products, setProducts] = useState([]); // Will store grouped product objects
  const [email, setEmail] = useState('');
  const [importedProducts, setImportedProducts] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [profit, setProfit] = useState('');
  // For standalone products, retailPrice will be a string; for variant groups, an array of prices.
  const [retailPrice, setRetailPrice] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          const groupedProducts = groupProductsByVariants(data);
          console.log('Grouped products:', groupedProducts);
          setProducts(groupedProducts);
        }
      } catch (err) {
        console.error('Fetch products exception:', err);
      }
    };

    fetchProducts();
  }, []);

  // Fetch imported products for the logged-in vendor
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

  // For both standalone products and variant groups, 
  // store the current item (or group) for import/delist.
  const handleImportClick = (item) => {
    console.log('Import button clicked for item:', item);
    setCurrentProduct(item);
    setShowPopup(true);
  };

  // Handle profit input change.
  // For standalone products, we calculate one retail price.
  // For variant groups, calculate retail price for each variant individually.
  const handleProfitChange = (e) => {
    const profitValue = parseFloat(e.target.value);
    setProfit(profitValue);

    if (currentProduct) {
      if (currentProduct.isVariantGroup) {
        // Calculate retail price per variant using each variant's wholesale_price.
        const newPrices = currentProduct.variants.map((variant) => {
          const wholesalePrice = variant.wholesale_price;
          const price = (wholesalePrice + profitValue) / 0.85;
          return price.toFixed(2);
        });
        setRetailPrice(newPrices);
      } else {
        const wholesalePrice = currentProduct.wholesale_price;
        const price = (wholesalePrice + profitValue) / 0.85;
        setRetailPrice(price.toFixed(2));
      }
    }
  };

  const importProduct = async () => {
    if (!profit) {
      alert('Please enter a profit.');
      return;
    }
    setIsSubmitting(true);

    try {
      if (currentProduct.isVariantGroup) {
        const newRecords = currentProduct.variants.map((variant) => ({
          vendor_id: vendorId,
          email: email,
          product_sku: variant.product_sku,
          // For each variant, find its calculated retail price.
          retail_price: parseFloat(retailPrice[currentProduct.variants.indexOf(variant)]),
          wholesale_price: variant.wholesale_price,
          profit: parseFloat(profit),
          availability: variant.availability,
          // New fields added
          variants: variant.variants,
          option1name: variant.option1name,
          option1: variant.option1,
        }));
        const { data, error } = await supabase
          .from('vendorcatalog')
          .insert(newRecords);
        if (error) {
          console.error('Error inserting variant group into vendorcatalog:', error);
        } else {
          console.log('Variant group inserted into vendorcatalog:', data);
          setImportedProducts((prev) => [
            ...prev,
            ...currentProduct.variants.map((variant) => variant.product_sku),
          ]);
          setShowPopup(false);
          setProfit('');
          setRetailPrice('');
        }
      } else {
        const { data, error } = await supabase
          .from('vendorcatalog')
          .insert([
            {
              vendor_id: vendorId,
              email: email,
              product_sku: currentProduct.product_sku,
              retail_price: parseFloat(retailPrice),
              wholesale_price: currentProduct.wholesale_price,
              profit: parseFloat(profit),
              availability: currentProduct.availability,
              // New fields added
              variants: currentProduct.variants,
              option1name: currentProduct.option1name,
              option1: currentProduct.option1,
            },
          ]);
        if (error) {
          console.error('Error inserting product into vendorcatalog:', error);
        } else {
          console.log('Product inserted into vendorcatalog:', data);
          setImportedProducts((prev) => [...prev, currentProduct.product_sku]);
          setShowPopup(false);
          setProfit('');
          setRetailPrice('');
        }
      }
    } catch (err) {
      console.error('Import product exception:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const delistProduct = async (item) => {
    try {
      if (item.isVariantGroup) {
        const skus = item.variants.map((variant) => variant.product_sku);
        const { data, error } = await supabase
          .from('vendorcatalog')
          .delete()
          .in('product_sku', skus)
          .eq('vendor_id', vendorId);
        if (error) {
          console.error('Error deleting variant group from vendorcatalog:', error);
        } else {
          console.log('Variant group deleted from vendorcatalog:', data);
          setImportedProducts((prev) =>
            prev.filter((sku) => !skus.includes(sku))
          );
        }
      } else {
        const { data, error } = await supabase
          .from('vendorcatalog')
          .delete()
          .eq('vendor_id', vendorId)
          .eq('product_sku', item.product_sku);
        if (error) {
          console.error('Error deleting product from vendorcatalog:', error);
        } else {
          console.log('Product deleted from vendorcatalog:', data);
          setImportedProducts((prev) =>
            prev.filter((sku) => sku !== item.product_sku)
          );
        }
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
          products.map((group) => {
            if (group.isVariantGroup) {
              // For variant groups, always display the default variant (first in array)
              const defaultVariant = group.variants[0];
              return (
                <div key={group.groupKey}>
                  <h2>{defaultVariant.product_name}</h2>
                  <p>{defaultVariant.description}</p>
                  <p>Wholesale Price: ${defaultVariant.wholesale_price}</p>
                  <p>Availability: {defaultVariant.availability}</p>
                  {importedProducts.includes(defaultVariant.product_sku) ? (
                    <button onClick={() => delistProduct(group)}>
                      Delist from my storefront
                    </button>
                  ) : (
                    <button onClick={() => handleImportClick(group)}>
                      Import to my storefront
                    </button>
                  )}
                </div>
              );
            } else {
              // Standalone product rendering
              const product = group.product;
              return (
                <div key={product.product_sku}>
                  <h2>{product.product_name}</h2>
                  <p>{product.description}</p>
                  <p>Wholesale Price: ${product.wholesale_price}</p>
                  <p>Availability: {product.availability}</p>
                  {importedProducts.includes(product.product_sku) ? (
                    <button onClick={() => delistProduct(product)}>
                      Delist from my storefront
                    </button>
                  ) : (
                    <button onClick={() => handleImportClick(product)}>
                      Import to my storefront
                    </button>
                  )}
                </div>
              );
            }
          })
        )}
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Enter Target Profit (in USD)</h3>
            <input 
              type="number" 
              value={profit} 
              onChange={handleProfitChange} 
              placeholder="Enter profit"
            />
            {currentProduct && currentProduct.isVariantGroup ? (
              <div>
                <h4>Calculated Retail Prices:</h4>
                <ul>
                  {currentProduct.variants.map((variant, index) => (
                    <li key={variant.product_sku}>
                      {variant.product_name} {variant.option1 ? `(${variant.option1})` : ''} : ${retailPrice && retailPrice[index]}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Retail Price (inclusive of fees): ${retailPrice}</p>
            )}
            <button onClick={importProduct} disabled={isSubmitting}>Confirm</button>
            <button onClick={() => setShowPopup(false)} disabled={isSubmitting}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualWarehouse;
