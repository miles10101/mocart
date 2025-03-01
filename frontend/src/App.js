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
      </Routes>
    </Router>
  );
};

export default App;
