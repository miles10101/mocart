import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const GuestCart = () => {
  const [cartItems, setCartItems] = useState([]);
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

    fetchCartItems();
  }, []);

  const handleCheckout = () => {
    navigate('/checkout');
  };

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
                Product SKU: {item.product_sku} - Quantity: {item.quantity}
              </li>
            ))}
          </ul>
          <button onClick={handleCheckout}>Proceed to Checkout</button>
        </>
      )}
    </div>
  );
};

export default GuestCart;
