import React, { useState } from 'react';

const EmailPopup = ({ onSubmit, onCancel }) => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please input your email to proceed.');
    } else {
      onSubmit(email);
    }
  };

  return (
    <div className="email-popup">
      <form onSubmit={handleSubmit}>
        <label>
          Please input your email to proceed:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit">Okay</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  );
};

export default EmailPopup;
