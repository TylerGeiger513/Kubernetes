import React, { useState, useEffect } from 'react';
import { api, createNotificationsSocket } from '../utils/api';
import ChatWindow from './ChatWindow';

function Friends({ user }) {
  const [friendRequestTarget, setFriendRequestTarget] = useState('');
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [selectedChatFriend, setSelectedChatFriend] = useState(null);

  // Helper to extract friend identifier.
  const getFriendId = (friend) => friend.id || friend._id;

  // Initial fetch of all lists.
  useEffect(() => {
    fetchFriends();
    fetchIncomingRequests();
    fetchSentRequests();
    fetchBlockedUsers();
  }, []);

  // Set up real-time updates via notifications socket.
  useEffect(() => {
    const socket = createNotificationsSocket();
    socket.on('friendsList', (data) => {
      setFriends(data.friends || []);
    });
    socket.on('incomingRequests', (data) => {
      setIncomingRequests(data.requests || []);
    });
    socket.on('sentRequests', (data) => {
      setSentRequests(data.requests || []);
    });
    socket.on('blockedUsers', (data) => {
      setBlockedUsers(data.blockedUsers || []);
    });
    return () => socket.disconnect();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await api.post('/friends/friendsList', {}, { withCredentials: true });
      setFriends(res.data.friends || []);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const res = await api.post('/friends/getIncomingRequests', {}, { withCredentials: true });
      setIncomingRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching incoming requests:', err);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const res = await api.post('/friends/getSentRequests', {}, { withCredentials: true });
      setSentRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching sent requests:', err);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const res = await api.post('/friends/getBlockedUsers', {}, { withCredentials: true });
      setBlockedUsers(res.data.blockedUsers || []);
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!friendRequestTarget.trim()) return;
    try {
      await api.post('/friends/request', { target: friendRequestTarget }, { withCredentials: true });
      alert('Friend request sent.');
      setFriendRequestTarget('');
      fetchSentRequests();
    } catch (error) {
      console.error('Error sending friend request:', error.response?.data || error);
    }
  };

  const handleAcceptRequest = async (friend) => {
    const friendId = getFriendId(friend);
    try {
      await api.post('/friends/accept', { target: friendId }, { withCredentials: true });
      alert('Friend request accepted.');
      fetchIncomingRequests();
      fetchFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error.response?.data || error);
    }
  };

  const handleDenyRequest = async (friend) => {
    const friendId = getFriendId(friend);
    try {
      await api.post('/friends/deny', { target: friendId }, { withCredentials: true });
      alert('Friend request denied.');
      fetchIncomingRequests();
    } catch (error) {
      console.error('Error denying friend request:', error.response?.data || error);
    }
  };

  const handleCancelRequest = async (friend) => {
    const friendId = getFriendId(friend);
    try {
      await api.post('/friends/cancel', { target: friendId }, { withCredentials: true });
      alert('Friend request cancelled.');
      fetchSentRequests();
    } catch (error) {
      console.error('Error cancelling friend request:', error.response?.data || error);
    }
  };

  const handleRemoveFriend = async (friend) => {
    const friendId = getFriendId(friend);
    try {
      await api.post('/friends/remove', { target: friendId }, { withCredentials: true });
      alert('Friend removed.');
      fetchFriends();
    } catch (error) {
      console.error('Error removing friend:', error.response?.data || error);
    }
  };

  const handleBlockFriend = async (friend) => {
    const friendId = getFriendId(friend);
    try {
      await api.post('/friends/block', { target: friendId }, { withCredentials: true });
      alert('User blocked.');
      fetchFriends();
      fetchIncomingRequests();
      fetchSentRequests();
      fetchBlockedUsers();
    } catch (error) {
      console.error('Error blocking user:', error.response?.data || error);
    }
  };

  const handleUnblockFriend = async (friend) => {
    const friendId = getFriendId(friend);
    try {
      await api.post('/friends/unblock', { target: friendId }, { withCredentials: true });
      alert('User unblocked.');
      fetchBlockedUsers();
    } catch (error) {
      console.error('Error unblocking user:', error.response?.data || error);
    }
  };

  const handleChat = (friend) => {
    setSelectedChatFriend(friend);
  };

  const handleCloseChat = () => {
    setSelectedChatFriend(null);
  };

  return (
    <div>
      <h2>Friends</h2>
      <div>
        <input
          type="text"
          placeholder="Enter friend user ID"
          value={friendRequestTarget}
          onChange={(e) => setFriendRequestTarget(e.target.value)}
        />
        <button onClick={handleSendFriendRequest}>Send Friend Request</button>
      </div>

      {/* Incoming Friend Requests */}
      <div style={{ marginTop: '1rem' }}>
        <h3>Incoming Friend Requests</h3>
        {incomingRequests.length === 0 ? (
          <p>No incoming friend requests.</p>
        ) : (
          <ul>
            {incomingRequests.map(req => (
              <li key={req.id || req._id}>
                {req.username}
                <button onClick={() => handleAcceptRequest(req)}>Accept</button>
                <button onClick={() => handleDenyRequest(req)}>Reject</button>
                <button onClick={() => handleBlockFriend(req)}>Block</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sent Friend Requests */}
      <div style={{ marginTop: '1rem' }}>
        <h3>Sent Friend Requests</h3>
        {sentRequests.length === 0 ? (
          <p>No sent friend requests.</p>
        ) : (
          <ul>
            {sentRequests.map(req => (
              <li key={req.id || req._id}>
                {req.username}
                <button onClick={() => handleCancelRequest(req)}>Cancel Request</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Friends List */}
      <div style={{ marginTop: '1rem' }}>
        <h3>Your Friends</h3>
        {friends.length === 0 ? (
          <p>No friends found.</p>
        ) : (
          <ul>
            {friends.map(friend => (
              <li key={friend.id || friend._id}>
                {friend.username}
                <button onClick={() => handleChat(friend)}>Chat</button>
                <button onClick={() => handleRemoveFriend(friend)}>Remove</button>
                <button onClick={() => handleBlockFriend(friend)}>Block</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Blocked Users */}
      <div style={{ marginTop: '1rem' }}>
        <h3>Blocked Users</h3>
        {blockedUsers.length === 0 ? (
          <p>No blocked users.</p>
        ) : (
          <ul>
            {blockedUsers.map(blocked => (
              <li key={blocked.id || blocked._id}>
                {blocked.username}
                <button onClick={() => handleUnblockFriend(blocked)}>Unblock</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedChatFriend && (
        <ChatWindow friend={selectedChatFriend} currentUser={user} onClose={handleCloseChat} />
      )}
    </div>
  );
}

export default Friends;
