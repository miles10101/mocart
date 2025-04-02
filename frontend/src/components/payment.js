import React, { useState } from "react";

const exchangeRateMultiplier = 150; // 🔄 Modify this to update the exchange rate (1 USD = X KES)

const Payment = ({ phoneNumber, totalAmountUSD, onPaymentConfirm }) => {
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Convert USD to KES using the multiplier
  const totalAmountKES = (totalAmountUSD * exchangeRateMultiplier).toFixed(2);

  const handleConfirm = () => {
    if (inputValue === "0000") {
      onPaymentConfirm(); // Trigger confirmation back to guestcart.js
    } else {
      setErrorMessage("Payment Declined");
    }
  };

  return (
    <div className="payment-popup">
      <h2>Confirm Payment</h2>
      <p>Phone Number: {phoneNumber}</p>
      <p>Order Amount (in Ksh.): {totalAmountKES} KES</p> {/* ✅ Display converted amount */}
      <input
        type="text"
        placeholder="Enter payment confirmation code"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={handleConfirm}>Confirm</button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default Payment;
