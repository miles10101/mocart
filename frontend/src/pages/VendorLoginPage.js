// src/pages/VendorLoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../supabaseClient';

const VendorLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Incorrect email or password');
    } else if (!signInData.user.email_confirmed_at) {
      alert('Please verify your email to proceed');
    } else {
      // Fetch the username from the profiles table
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('username')
        .eq('email', email)
        .single();

      if (fetchError) {
        alert(fetchError.message);
      } else if (profileData.username !== username) {
        alert('Username does not match the email provided');
      } else {
        localStorage.setItem('username', username);
        navigate('/vendor-dashboard');
      }
    }
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <div>
      <h1>Vendor Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <Link to="/vendor-signup">Create Account</Link>
    </div>
  );
};

export default VendorLoginPage;
