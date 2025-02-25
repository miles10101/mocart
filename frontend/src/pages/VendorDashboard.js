// C:\Users\oyooc\Desktop\mocart\frontend\src\pages\VendorDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const VendorDashboard = () => {
  const navigate = useNavigate();

  const goToVirtualWarehouse = () => {
    navigate('/virtual-warehouse');
  };

  const goToStoreFront = () => {
    navigate('/vendor-storefront');
  };

  return (
    <div>
      <h1>Vendor Dashboard</h1>
      <button onClick={goToVirtualWarehouse}>Browse Virtual Warehouse</button>
      <button onClick={goToStoreFront}>View My Storefront</button>
    </div>
  );
};

export default VendorDashboard;
