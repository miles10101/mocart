import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VendorLoginPage from './pages/VendorLoginPage';
import VendorSignupPage from './pages/VendorSignupPage';
import VendorDashboard from './pages/VendorDashboard';
import VirtualWarehouse from './pages/VirtualWarehouse';
import VendorStorefront from './pages/VendorStorefront';
import GuestCart from './pages/GuestCart'; // Import GuestCart
import Checkout from './pages/Checkout'; // Import Checkout
import OrderSummary from './pages/OrderSummary'; // Import OrderSummary
import OutOfStockProducts from './pages/OutOfStockProducts'; // Import OutOfStockProducts
import Payment from './components/payment'; // ✅ Added Payment component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vendor-login" element={<VendorLoginPage />} />
        <Route path="/vendor-signup" element={<VendorSignupPage />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="/virtual-warehouse" element={<VirtualWarehouse />} />
        <Route path="/vendor-storefront/:vendor_id" element={<VendorStorefront />} /> {/* Updated route */}
        <Route path="/guest-cart" element={<GuestCart />} /> {/* Add GuestCart route */}
        <Route path="/checkout" element={<Checkout />} /> {/* Add Checkout route */}
        <Route path="/order-summary" element={<OrderSummary />} /> {/* Add OrderSummary route */}
        <Route path="/out-of-stock-products" element={<OutOfStockProducts />} /> {/* Add OutOfStockProducts route */}
        <Route path="/payment" element={<Payment phoneNumber="0712345678" onPaymentConfirm={() => alert("Payment Confirmed")} />} /> {/* ✅ Added Payment route */}
      </Routes>
    </Router>
  );
};

export default App;
