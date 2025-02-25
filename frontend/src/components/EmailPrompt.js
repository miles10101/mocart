import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setEmail } from '../emailSlice'; // Adjust the import path if necessary

const EmailPrompt = ({ onClose }) => {
  const [email, setEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please input your email to proceed.');
    } else {
      dispatch(setEmail(email));
      onClose();
    }
  };

  return (
    <div className="email-prompt">
      <form onSubmit={handleSubmit}>
        <label>
          Enter your email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmailInput(e.target.value)}
            required
          />
        </label>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default EmailPrompt;
