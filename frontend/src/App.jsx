import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Channels from './components/Channels';
import Notifications from './components/Notifications';
import { api } from './utils/api';

function App() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // On mount, check if the user is already authenticated.
  useEffect(() => {
    api.get('/auth/session', { withCredentials: true })
      .then((res) => {
        if (res.data && res.data.userId) {
          // For simplicity, assume userId and username are returned.
          setUser({ userId: res.data.userId, username: res.data.userId });
        }
      })
      .catch(err => console.error('No active session', err));
  }, []);

  // For testing, notifications can be fetched via the socket connection (see Channels component) 
  // or via polling an endpoint. Here we assume that Channels component handles its own socket notifications.
  // Optionally, you could implement a separate notifications hook/component.

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.username}</h1>
          <Channels user={user} />
          <Notifications notifications={notifications} />
        </div>
      ) : (
        <Auth onAuthSuccess={(userData) => setUser(userData)} />
      )}
    </div>
  );
}

export default App;
