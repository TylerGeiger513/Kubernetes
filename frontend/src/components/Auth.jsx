import React, { useState } from 'react';
import { api } from '../utils/api';

function Auth({ onAuthSuccess }) {
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', username: '', password: '', campus: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', loginForm);
      // Assuming a successful login returns a session cookie and user info.
      onAuthSuccess(res.data.user);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/signup', signupForm);
      // Optionally, auto-login after signup or notify the user.
      onAuthSuccess(res.data.user);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.');
    }
  };

  return (
    <div>
      <h2>Authentication</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
        <h3>Login</h3>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email or Username"
            value={loginForm.identifier}
            onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          /><br />
          <button type="submit">Login</button>
        </form>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <h3>Signup</h3>
        <form onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
            value={signupForm.email}
            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
          /><br />
          <input
            type="text"
            placeholder="Username"
            value={signupForm.username}
            onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={signupForm.password}
            onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
          /><br />
          <input
            type="text"
            placeholder="Campus"
            value={signupForm.campus}
            onChange={(e) => setSignupForm({ ...signupForm, campus: e.target.value })}
          /><br />
          <button type="submit">Signup</button>
        </form>
      </div>
    </div>
  );
}

export default Auth;
