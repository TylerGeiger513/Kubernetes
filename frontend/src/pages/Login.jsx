import React from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import './styles/Auth.css'; 

const Login = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted');
    // Replace with actual login logic 
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input type="email" id="email" placeholder="Enter your email" required />
          </div>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input type="password" id="password" placeholder="Enter your password" required />
          </div>
          <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
};

export default Login;