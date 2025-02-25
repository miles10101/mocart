// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to the Vendor Portal</h1>
      <Link to="/vendor-login">Vendor Login</Link>
      {/* Remove the admin login option */}
    </div>
  );
};

export default HomePage;
