import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Friends from './components/Friends';
import Notifications from './components/Notifications';
import { api } from './utils/api';

function App() {
  const [user, setUser] = useState(null);

  // On mount, check if the user is already authenticated.
  useEffect(() => {
    api.get('/auth/session', { withCredentials: true })
      .then((res) => {
        if (res.data && res.data.userId) {
          setUser({ userId: res.data.userId, username: res.data.userId });
        }
      })
      .catch(err => console.error('No active session', err));
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.username}</h1>
          <Friends user={user} />
          <Notifications />
        </div>
      ) : (
        <Auth onAuthSuccess={(userData) => setUser(userData)} />
      )}
    </div>
  );
}

export default App;
