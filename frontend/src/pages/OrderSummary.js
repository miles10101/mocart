import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import supabase from '../supabaseClient';

const OrderSummary = () => {
  const [orderDetails, setOrderDetails] = useState([]);
  const location = useLocation();
  const { session_id, email } = location.state || {};

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('session_id', session_id)
          .eq('buyer_email', email);

        if (error) {
          console.error('Error fetching order details:', error);
        } else {
          setOrderDetails(data);
        }
      } catch (err) {
        console.error('Exception fetching order details:', err);
      }
    };

    if (session_id && email) {
      fetchOrderDetails();
    }
  }, [session_id, email]);

  // Extract common details (phone number, pickup point) from the first item
  const commonDetails = orderDetails.length > 0 ? orderDetails[0] : {};

  // Calculate the total price for the whole order
  const totalOrderPrice = orderDetails.reduce((acc, item) => acc + item.total_price, 0);

  return (
    <div>
      <h2>Thank You For Shopping With Us!</h2>
      <p>Estimated arrival time: 1-3 days. We will notify you when your package arrives.</p>
      <p>Pay on delivery at pickup.</p>
      <h3>Order Summary:</h3>
      {orderDetails.length === 0 ? (
        <p>Loading order details...</p>
      ) : (
        <div>
          <p>Phone Number: {commonDetails.phone_number}</p>
          <p>Pickup Point: {commonDetails.pickup_country}, {commonDetails.pickup_region}, {commonDetails.pickup_station}</p>
          <ul>
            {orderDetails.map((item) => (
              <li key={item.id}>
                Product SKU: {item.product_sku} - Quantity: {item.quantity} - Price: ${item.price} - Total Price: ${item.total_price.toFixed(2)}
              </li>
            ))}
          </ul>
          <h3>Total Order Price: ${totalOrderPrice.toFixed(2)}</h3> {/* Display total order price */}
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
