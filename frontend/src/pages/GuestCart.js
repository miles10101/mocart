import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const GuestCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pickupCountry, setPickupCountry] = useState('');
  const [pickupRegion, setPickupRegion] = useState('');
  const [pickupStation, setPickupStation] = useState('');
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [stations, setStations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const session_id = localStorage.getItem('session_id');

    const fetchCartItems = async () => {
      try {
        const { data, error } = await supabase
          .from('guest_cart')
          .select('*')
          .eq('session_id', session_id);

        if (error) {
          console.error('Error fetching cart items:', error);
        } else {
          const itemsWithTotalPrice = data.map(item => ({
            ...item,
            total_price: item.price * item.quantity
          }));
          setCartItems(itemsWithTotalPrice);
        }
      } catch (err) {
        console.error('Exception fetching cart items:', err);
      }
    };

    fetchCartItems();

    const fetchCountries = async () => {
      try {
        const { data, error } = await supabase
          .from('pickup_locations')
          .select('country');

        if (error) {
          console.error('Error fetching countries:', error);
        } else {
          const uniqueCountries = [...new Set(data.map(d => d.country))];
          setCountries(uniqueCountries);
        }
      } catch (err) {
        console.error('Exception fetching countries:', err);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchRegions = async () => {
      if (pickupCountry) {
        try {
          const { data, error } = await supabase
            .from('pickup_locations')
            .select('region')
            .eq('country', pickupCountry);

          if (error) {
            console.error('Error fetching regions:', error);
          } else {
            const uniqueRegions = [...new Set(data.map(d => d.region))];
            setRegions(uniqueRegions);
            setStations([]); // Reset stations when country changes
            setPickupRegion(''); // Reset selected region when country changes
          }
        } catch (err) {
          console.error('Exception fetching regions:', err);
        }
      }
    };

    fetchRegions();
  }, [pickupCountry]);

  useEffect(() => {
    const fetchStations = async () => {
      if (pickupRegion) {
        try {
          const { data, error } = await supabase
            .from('pickup_locations')
            .select('station')
            .eq('country', pickupCountry)
            .eq('region', pickupRegion);

          if (error) {
            console.error('Error fetching stations:', error);
          } else {
            const uniqueStations = [...new Set(data.map(d => d.station))];
            setStations(uniqueStations);
          }
        } catch (err) {
          console.error('Exception fetching stations:', err);
        }
      }
    };

    fetchStations();
  }, [pickupRegion, pickupCountry]);

  const handleCheckout = () => {
    setShowCheckoutPopup(true);
  };

  const handleConfirmCheckout = async () => {
    const session_id = localStorage.getItem('session_id');

    if (!session_id) {
      console.error('Session ID is missing or invalid.');
      alert('Session expired. Please refresh and try again.');
      return;
    }

    try {
      // Step 1: Copy records from guest_cart to orders table
      for (const item of cartItems) {
        const { error } = await supabase
          .from('orders')
          .insert([
            {
              session_id,
              product_sku: item.product_sku,
              quantity: item.quantity,
              price: item.price,
              total_price: item.total_price,
              buyer_email: email,
              phone_number: phoneNumber,
              pickup_country: pickupCountry,
              pickup_region: pickupRegion,
              pickup_station: pickupStation,
              vendor_email: item.vendor_email // Include vendor_email field
            },
          ]);

        if (error) {
          console.error('Error copying to orders:', error);
          alert('An error occurred during checkout. Please try again.');
          return; // Exit on error
        }
      }

      // Step 2: Call Supabase function to clear the cart
      const { error: clearError } = await supabase.rpc('clear_cart_on_checkout', {
        p_session_id: session_id,
      });

      if (clearError) {
        console.error('Error clearing guest_cart:', clearError);
        alert('An error occurred while clearing your cart. Please try again.');
      } else {
        console.log('Guest cart cleared successfully.');
      }

      setShowCheckoutPopup(false);
      navigate('/order-summary', { state: { session_id, email } });
    } catch (err) {
      console.error('Exception during checkout:', err);
      alert('A server error occurred. Please try again later.');
    }
  };

  const handleClearCart = async () => {
    const session_id = localStorage.getItem('session_id');
  
    if (!session_id) {
      alert('Session expired. Please refresh and try again.');
      return;
    }
  
    try {
      // Call Supabase function to restore inventory and clear cart
      const { error } = await supabase.rpc('restore_inventory_for_cart', {
        p_session_id: session_id,
      });
  
      if (error) {
        console.error('Error clearing cart and restoring inventory:', error);
        alert('An error occurred while clearing your cart and restoring inventory. Please try again.');
      } else {
        console.log('Cart cleared and inventory restored successfully.');
        setCartItems([]); // Reset UI immediately
      }
    } catch (err) {
      console.error('Exception clearing cart:', err);
    }
  };
  

  // Calculate the total price for the whole order
  const totalOrderPrice = cartItems.reduce((acc, item) => acc + item.total_price, 0);

  return (
    <div>
      <h2>Guest Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item) => (
              <li key={item.id}>
                Product SKU: {item.product_sku} - Quantity: {item.quantity} - Price: ${item.price} - Total Price: ${item.total_price.toFixed(2)}
              </li>
            ))}
          </ul>
          <h3>Total Order Price: ${totalOrderPrice.toFixed(2)}</h3> {/* Display total order price */}
          <button onClick={handleCheckout}>Proceed to Checkout</button>
          <button onClick={handleClearCart}>Clear Cart</button>
        </>
      )}
      {showCheckoutPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Checkout Information</h3>
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <label>Phone Number:</label>
            <input 
              type="tel" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
            />
            <label>Pickup Country:</label>
            <select 
              value={pickupCountry} 
              onChange={(e) => setPickupCountry(e.target.value)}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <label>Pickup Region:</label>
            <select 
              value={pickupRegion} 
              onChange={(e) => setPickupRegion(e.target.value)}
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <label>Pickup Station:</label>
            <select 
              value={pickupStation} 
              onChange={(e) => setPickupStation(e.target.value)}
            >
              <option value="">Select Station</option>
              {stations.map((station) => (
                <option key={station} value={station}>{station}</option>
              ))}
            </select>
            <button onClick={handleConfirmCheckout}>Confirm</button>
            <button onClick={() => setShowCheckoutPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestCart;
