import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VendorLoginPage from './pages/VendorLoginPage';
import VendorSignupPage from './pages/VendorSignupPage';
import VendorDashboard from './pages/VendorDashboard';
import VirtualWarehouse from './pages/VirtualWarehouse';
import VendorStorefront from './pages/VendorStorefront';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vendor-login" element={<VendorLoginPage />} />
        <Route path="/vendor-signup" element={<VendorSignupPage />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="/virtual-warehouse" element={<VirtualWarehouse />} />
        <Route path="/vendor-storefront" element={<VendorStorefront />} />
      </Routes>
    </Router>
  );
};

export default App;
