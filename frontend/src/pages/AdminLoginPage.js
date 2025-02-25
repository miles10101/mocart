// src/pages/AdminLoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === 'mocart') {
      navigate('/admin-dashboard');
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div>
      <h1>Admin Login</h1>
      <input
        type="text"
        value="admin"
        readOnly
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default AdminLoginPage;
