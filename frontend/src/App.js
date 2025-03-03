import React, { useState, useEffect } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState('Loading backend status...');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campus, setCampus] = useState('');

  // Check backend health and authentication status when the component mounts
  useEffect(() => {
    // Check backend health
    fetch('/api/health', { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        setBackendStatus(`Backend Status: healthy | Mongo: ${data.mongo} | Redis: ${data.redis}`);
      })
      .catch(err => {
        console.error('Error connecting to API:', err);
        setBackendStatus('Error connecting to API');
      });

    // Check if user is authenticated by calling a protected endpoint
    fetch('/api/auth/session', {
      method: 'POST',
      credentials: 'include'
    })
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Not authenticated');
      })
      .then(data => {
        setIsAuthenticated(true);
        setMessage(`Logged in as user: ${data.userId}`);
      })
      .catch(err => {
        setIsAuthenticated(false);
        setMessage('Not authenticated');
      });
  }, []);

  const handleLogin = () => {
    fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        setIsAuthenticated(true);
      })
      .catch(err => {
        console.error('Login error:', err);
        setMessage('Login failed');
      });
  };

  const handleSignup = () => {
    fetch('/api/auth/signup', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, campus })
    })
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        // Optionally, you can automatically log in the user after a successful signup.
      })
      .catch(err => {
        console.error('Signup error:', err);
        setMessage('Signup failed');
      });
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        setIsAuthenticated(false);
      })
      .catch(err => {
        console.error('Logout error:', err);
        setMessage('Logout failed');
      });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Campus Connect Test</h1>
      <p>{backendStatus}</p>
      <p>{message}</p>
      {!isAuthenticated ? (
        <div>
          <h2>Login / Signup</h2>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ margin: '5px' }}
            /><br/>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ margin: '5px' }}
            /><br/>
            <input
              type="text"
              placeholder="Campus"
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              style={{ margin: '5px' }}
            /><br/>
            <button onClick={handleLogin} style={{ margin: '5px' }}>Login</button>
            <button onClick={handleSignup} style={{ margin: '5px' }}>Signup</button>
          </div>
        </div>
      ) : (
        <div>
          <h2>Welcome!</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
