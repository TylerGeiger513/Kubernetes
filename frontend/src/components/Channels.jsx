import React, { useState, useEffect, useRef } from 'react';
import { api, createSocket } from '../utils/api';

function Channels({ user }) {
  const [channels, setChannels] = useState([]);
  const [currentChannelId, setCurrentChannelId] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);

  // Fetch channels for the user.
  useEffect(() => {
    api.get('/channels', { withCredentials: true })
      .then((res) => {
        setChannels(res.data);
        if (res.data.length > 0) {
          setCurrentChannelId(res.data[0]._id);
        }
      })
      .catch((err) => console.error('Error fetching channels:', err));
  }, []);

  // Fetch messages when currentChannelId changes.
  useEffect(() => {
    if (currentChannelId) {
      api.get(`/channels/${currentChannelId}/messages`, { withCredentials: true })
        .then((res) => setMessages(res.data))
        .catch((err) => console.error('Error fetching messages:', err));
    }
  }, [currentChannelId]);

  // Setup socket connection.
  useEffect(() => {
    if (currentChannelId) {
      const socket = createSocket();
      socketRef.current = socket;
      // Join the channel room.
      socket.emit('joinChannel', currentChannelId);

      // Listen for messages.
      socket.on('messageReceived', (data) => {
        if (data.channelId === currentChannelId) {
          setMessages((prev) => [...prev, data]);
        }
      });

      // Listen for notifications.
      socket.on('notification', (data) => {
        console.log('Notification:', data);
      });

      return () => socket.disconnect();
    }
  }, [currentChannelId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await api.post('/channels/message', {
        channelId: currentChannelId,
        content: newMessage,
      }, { withCredentials: true });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error);
    }
  };

  return (
    <div>
      <h2>Channels for {user.username}</h2>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '0.5rem' }}>
          <h3>Your Channels</h3>
          {channels.length === 0 ? (
            <p>No channels found.</p>
          ) : (
            <ul>
              {channels.map((ch) => (
                <li key={ch._id} onClick={() => setCurrentChannelId(ch._id)} style={{cursor: 'pointer'}}>
                  {ch.type === 'DM'
                    ? `DM: ${ch.participants.join(', ')}`
                    : ch.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ flexGrow: 1, padding: '0.5rem' }}>
          <h3>Channel: {currentChannelId}</h3>
          <div style={{ border: '1px solid #ccc', padding: '0.5rem', minHeight: '200px' }}>
            {messages.length === 0 ? (
              <p>No messages.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg._id}>
                  <strong>{msg.senderId}: </strong>
                  <span>{msg.content}</span>
                  {msg.edited && <em> (edited)</em>}
                </div>
              ))
            )}
          </div>
          <input
            type="text"
            placeholder="Enter your message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Send Message</button>
        </div>
      </div>
    </div>
  );
}

export default Channels;
