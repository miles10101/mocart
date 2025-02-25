// src/pages/VendorSignupPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const VendorSignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Check if the email already exists in the profiles table
    const { data: existingProfiles, error: emailCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email);

    if (emailCheckError) {
      alert(emailCheckError.message);
      return;
    }

    if (existingProfiles.length > 0) {
      alert('Email already exists');
      return;
    }

    // Sign up the user
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert(signUpError.message);
    } else {
      // Insert additional user info into the profiles table
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ email, username }]);

      if (insertError) {
        alert(insertError.message);
      } else {
        localStorage.setItem('username', username);
        navigate(`/vendor-dashboard`);
      }
    }
  };

  return (
    <div>
      <h1>Vendor Signup</h1>
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
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={handleSignup}>Create Account</button>
    </div>
  );
};

export default VendorSignupPage;
