import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient'; // Ensure the path is correct

const VendorDashboard = () => {
  const [vendorId, setVendorId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorId = async () => {
      const { data } = await supabase.auth.getSession(); // Removed unused error variable
      if (data.session) {
        const user = data.session.user;
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', user.email);

        if (profileData && profileData.length > 0) {
          setVendorId(profileData[0].id);
        } else if (profileError) {
          console.error('Error fetching profile:', profileError);
        }
      }
    };
    fetchVendorId();
  }, []);

  const goToVirtualWarehouse = () => {
    navigate('/virtual-warehouse');
  };

  const goToStoreFront = () => {
    navigate(`/vendor-storefront/${vendorId}`); // Navigate to unique URL with vendor_id
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
