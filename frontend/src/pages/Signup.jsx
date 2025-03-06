import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import './styles/Auth.css'; 

const Signup = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup submitted');
    // Replace with actual signup logic 
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input type="text" id="username" placeholder="Enter your username" required />
          </div>
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input type="email" id="email" placeholder="Enter your email" required />
          </div>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input type="password" id="password" placeholder="Enter your password" required />
          </div>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input type="password" id="confirm-password" placeholder="Confirm your password" required />
          </div>
          <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Signup;