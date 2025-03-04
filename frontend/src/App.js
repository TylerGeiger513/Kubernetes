import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function App() {
  // Backend and authentication state
  const [backendStatus, setBackendStatus] = useState('Loading backend status...');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  
  // Login/Signup form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campus, setCampus] = useState('');

  // Friend system state
  const [friendIdInput, setFriendIdInput] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  // Socket state
  const [socket, setSocket] = useState(null);

  // Fetch backend health
  const fetchHealth = () => {
    fetch('/api/health', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setBackendStatus(`Backend Status: healthy | Mongo: ${data.mongo} | Redis: ${data.redis}`);
      })
      .catch(err => {
        console.error('Error connecting to API:', err);
        setBackendStatus('Error connecting to API');
      });
  };

  // Check session for authenticated user
  const checkSession = () => {
    fetch('/api/auth/session', { method: 'POST', credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => {
        setIsAuthenticated(true);
        setUserId(data.userId);
        setMessage(`Logged in as user: ${data.userId}`);
        fetchFriends();
        fetchFriendRequests();
      })
      .catch(err => {
        setIsAuthenticated(false);
        setMessage('Not authenticated');
      });
  };

  useEffect(() => {
    fetchHealth();
    checkSession();
  }, []);

  // Establish WebSocket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      // By using a relative URL, NGINX will route this to /api/notifications/socket.io
      const newSocket = io('/api/notifications', {
        path: '/api/notifications/socket.io',
        transports: ['websocket'],
        withCredentials: true,
      });
  
      newSocket.on('connect', () => {
        console.log(`Connected to WebSocket as user ${userId} with socket ID ${newSocket.id}`); 
      });
  
      newSocket.on('friendRequest', (data) => {
        console.log('Received friend request notification:', data);
        setMessage(`New friend request from ${data.from}`);
        // Optionally refresh friend requests list
        fetchFriendRequests();
      });
  
      setSocket(newSocket);
  
      return () => newSocket.close();
    }
  }, [isAuthenticated, userId]);

  // Handlers for login, signup, and logout
  const handleLogin = () => {
    fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        setIsAuthenticated(true);
        checkSession();
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
      body: JSON.stringify({ email, password, campus }),
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        // Optionally, auto-login here if desired
      })
      .catch(err => {
        console.error('Signup error:', err);
        setMessage('Signup failed');
      });
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        setIsAuthenticated(false);
        setUserId(null);
        setFriends([]);
        setFriendRequests([]);
        if (socket) {
          socket.close();
          setSocket(null);
        }
      })
      .catch(err => {
        console.error('Logout error:', err);
        setMessage('Logout failed');
      });
  };

  // Friend system functions: fetch friends and requests
  const fetchFriends = () => {
    fetch('/api/friends/list', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setFriends(data.friends))
      .catch(err => console.error('Error fetching friends:', err));
  };

  const fetchFriendRequests = () => {
    fetch('/api/friends/requests', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setFriendRequests(data.requests))
      .catch(err => console.error('Error fetching friend requests:', err));
  };

  // Friend actions
  const handleAddFriend = () => {
    fetch('/api/friends/add', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId: friendIdInput }),
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        fetchFriendRequests();
      })
      .catch(err => {
        console.error('Add friend error:', err);
        setMessage('Failed to send friend request');
      });
  };

  const handleAcceptFriend = (fid) => {
    fetch('/api/friends/accept', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId: fid }),
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        fetchFriends();
        fetchFriendRequests();
      })
      .catch(err => {
        console.error('Accept friend error:', err);
        setMessage('Failed to accept friend request');
      });
  };

  const handleRejectFriend = (fid) => {
    fetch('/api/friends/reject', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId: fid }),
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        fetchFriendRequests();
      })
      .catch(err => {
        console.error('Reject friend error:', err);
        setMessage('Failed to reject friend request');
      });
  };

  const handleRemoveFriend = (fid) => {
    fetch('/api/friends/remove', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId: fid }),
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        fetchFriends();
      })
      .catch(err => {
        console.error('Remove friend error:', err);
        setMessage('Failed to remove friend');
      });
  };

  const handleBlockUser = (fid) => {
    fetch('/api/friends/block', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId: fid }),
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        fetchFriends();
      })
      .catch(err => {
        console.error('Block user error:', err);
        setMessage('Failed to block user');
      });
  };

  const handleUnblockUser = (fid) => {
    fetch('/api/friends/unblock', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId: fid }),
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        // Optionally refresh friend list
      })
      .catch(err => {
        console.error('Unblock user error:', err);
        setMessage('Failed to unblock user');
      });
  };

  // If not authenticated, render the login/signup form.
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Campus Connect Test</h1>
        <p>{backendStatus}</p>
        <p>{message}</p>
        <h2>Login / Signup</h2>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ margin: '5px' }}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ margin: '5px' }}
          /><br />
          <input
            type="text"
            placeholder="Campus"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            style={{ margin: '5px' }}
          /><br />
          <button onClick={handleLogin} style={{ margin: '5px' }}>Login</button>
          <button onClick={handleSignup} style={{ margin: '5px' }}>Signup</button>
        </div>
      </div>
    );
  }

  // If authenticated, render the home page with the friend system.
  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>Campus Connect Home</h1>
      <p>{backendStatus}</p>
      <p>{message}</p>
      <p>Your user ID: {userId}</p>
      <button onClick={handleLogout}>Logout</button>
      <hr />

      <h2>Friend System</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Add a Friend</h3>
        <input
          type="text"
          placeholder="Friend ID"
          value={friendIdInput}
          onChange={(e) => setFriendIdInput(e.target.value)}
          style={{ margin: '5px' }}
        />
        <button onClick={handleAddFriend} style={{ margin: '5px' }}>Send Friend Request</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Incoming Friend Requests</h3>
        {friendRequests.length > 0 ? (
          friendRequests.map((req) => (
            <div key={req._id} style={{ margin: '10px', border: '1px solid #ccc', padding: '10px' }}>
              <p>User ID: {req._id}</p>
              <button onClick={() => handleAcceptFriend(req._id)} style={{ margin: '5px' }}>Accept</button>
              <button onClick={() => handleRejectFriend(req._id)} style={{ margin: '5px' }}>Reject</button>
            </div>
          ))
        ) : (
          <p>No incoming friend requests.</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Your Friends</h3>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <div key={friend._id} style={{ margin: '10px', border: '1px solid #ccc', padding: '10px' }}>
              <p>User ID: {friend._id}</p>
              <button onClick={() => handleRemoveFriend(friend._id)} style={{ margin: '5px' }}>Remove Friend</button>
              <button onClick={() => handleBlockUser(friend._id)} style={{ margin: '5px' }}>Block</button>
              <button onClick={() => handleUnblockUser(friend._id)} style={{ margin: '5px' }}>Unblock</button>
            </div>
          ))
        ) : (
          <p>You have no friends yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;
