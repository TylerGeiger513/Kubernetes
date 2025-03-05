import React, { useState, useEffect, useRef } from 'react';
import { api, createSocket } from '../utils/api';

function ChatWindow({ friend, currentUser, onClose }) {
  const [channelId, setChannelId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);

  // Helper to extract an identifier from a user object.
  const getUserId = (user) => user.id || user._id;

  // Get (or create) the DM channel with the friend.
  useEffect(() => {
    const friendId = getUserId(friend);
    api.post('/channels/channel/getDMChannel', { userId: friendId }, { withCredentials: true })
      .then((res) => {
        // Use whichever property is returned.
        setChannelId(res.data._id || res.data.id);
      })
      .catch((err) => console.error('Error getting DM channel:', err));
  }, [friend]);

  // Fetch messages for the DM channel.
  useEffect(() => {
    if (channelId) {
      api.get(`/channels/${channelId}/messages`, { withCredentials: true })
        .then((res) => setMessages(res.data))
        .catch((err) => console.error('Error fetching messages:', err));
    }
  }, [channelId]);

  // Set up a socket connection for real-time messaging.
  useEffect(() => {
    if (channelId) {
      const socket = createSocket();
      socketRef.current = socket;
      socket.emit('joinChannel', channelId);

      socket.on('messageReceived', (data) => {
        if (data.channelId === channelId) {
          setMessages((prev) => [...prev, data]);
        }
      });

      return () => socket.disconnect();
    }
  }, [channelId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await api.post('/channels/message', { channelId, content: newMessage }, { withCredentials: true });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      await api.post(`/channels/message/${messageId}/edit`, { content: newContent }, { withCredentials: true });
      setMessages(messages.map(msg => msg._id === messageId ? { ...msg, content: newContent, edited: true } : msg));
    } catch (error) {
      console.error('Error editing message:', error.response?.data || error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.post(`/channels/message/${messageId}/delete`, {}, { withCredentials: true });
      setMessages(messages.filter(msg => msg._id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error.response?.data || error);
    }
  };

  return (
    <div style={{ border: '1px solid #000', padding: '1rem', marginTop: '1rem' }}>
      <h3>Chat with {friend.username}</h3>
      <button onClick={onClose}>Close Chat</button>
      <div style={{ border: '1px solid #ccc', padding: '0.5rem', minHeight: '200px', marginBottom: '1rem' }}>
        {messages.length === 0 ? (
          <p>No messages.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg._id}>
              <strong>{msg.senderId}: </strong>
              <span>{msg.content}</span>
              {msg.edited && <em> (edited)</em>}
              {(msg.senderId === (currentUser.id || currentUser._id)) && (
                <>
                  <button onClick={() => {
                    const newContent = prompt('Edit your message:', msg.content);
                    if (newContent) {
                      handleEditMessage(msg._id, newContent);
                    }
                  }}>Edit</button>
                  <button onClick={() => handleDeleteMessage(msg._id)}>Delete</button>
                </>
              )}
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
  );
}

export default ChatWindow;
