import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pickupLocations, setPickupLocations] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
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
          setCartItems(data);
        }
      } catch (err) {
        console.error('Exception fetching cart items:', err);
      }
    };

    const fetchPickupLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('pickup_locations')
          .select('*');

        if (error) {
          console.error('Error fetching pickup locations:', error);
        } else {
          setPickupLocations(data);
        }
      } catch (err) {
        console.error('Exception fetching pickup locations:', err);
      }
    };

    fetchCartItems();
    fetchPickupLocations();
  }, []);

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setSelectedRegion('');
    setSelectedStation('');
  };

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
    setSelectedStation('');
  };

  const handleCheckout = async () => {
    const session_id = localStorage.getItem('session_id');

    const orderItems = cartItems.map(item => ({
      session_id,
      product_sku: item.product_sku,
      quantity: item.quantity,
      buyer_email: email,
      vendor_email: item.vendor_email,
      phone_number: phoneNumber,
      pickup_country: selectedCountry,
      pickup_region: selectedRegion,
      pickup_station: selectedStation
    }));

    console.log("Order Items:", orderItems); // Log order items

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderItems);

      if (error) {
        console.error('Error creating order:', error);
      } else {
        console.log('Order created successfully', data);

        // Optionally, clear the guest cart after placing the order
        await supabase
          .from('guest_cart')
          .delete()
          .eq('session_id', session_id);

        // Navigate to OrderSummary
        navigate('/order-summary', { state: { session_id, email } });
      }
    } catch (err) {
      console.error('Exception creating order:', err);
    }
  };

  const uniqueCountries = [...new Set(pickupLocations.map(location => location.country))];
  const filteredRegions = selectedCountry ? pickupLocations.filter(location => location.country === selectedCountry) : [];
  const uniqueRegions = [...new Set(filteredRegions.map(location => location.region))];
  const filteredStations = selectedRegion ? pickupLocations.filter(location => location.region === selectedRegion) : [];
  const uniqueStations = [...new Set(filteredStations.map(location => location.station))];

  return (
    <div>
      <h2>Checkout</h2>
      <input 
        type="email" 
        placeholder="Enter your email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="tel" 
        placeholder="Enter your phone number" 
        value={phoneNumber} 
        onChange={(e) => setPhoneNumber(e.target.value)} 
      />
      <select 
        value={selectedCountry} 
        onChange={handleCountryChange}
      >
        <option value="" disabled>Select country</option>
        {uniqueCountries.map(country => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
      <select 
        value={selectedRegion} 
        onChange={handleRegionChange}
        disabled={!selectedCountry}
      >
        <option value="" disabled>Select region</option>
        {uniqueRegions.map(region => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>
      <select 
        value={selectedStation} 
        onChange={(e) => setSelectedStation(e.target.value)}
        disabled={!selectedRegion}
      >
        <option value="" disabled>Select station</option>
        {uniqueStations.map(station => (
          <option key={station} value={station}>{station}</option>
        ))}
      </select>
      <button onClick={handleCheckout}>Place Order</button>
    </div>
  );
};

export default Checkout;
