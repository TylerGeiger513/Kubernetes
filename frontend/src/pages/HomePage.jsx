import React, { useState } from 'react';
import { FaPlus, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import TopBar from '../components/TopBar'; 
import './HomePage.css';

const HomePage = () => {
  // Sample friends data
  const [friends] = useState([
    { id: 1, name: 'Alice', profilePic: 'alice.jpg' },
    { id: 2, name: 'Bob', profilePic: 'bob.jpg' },
    { id: 3, name: 'Charlie', profilePic: 'charlie.jpg' },
  ]);

  // Sample chats data
  const [chats, setChats] = useState([
    { id: 1, name: 'General Chat', participants: [1, 2, 3] },
    { id: 2, name: 'Project Discussion', participants: [1, 3] },
  ]);

  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);

  const handleCreateChat = (selectedFriends, chatName) => {
    const newChat = {
      id: Date.now(),
      name: chatName,
      participants: selectedFriends,
    };
    setChats([...chats, newChat]);
    setIsCreateChatOpen(false);
  };

  return (
    <div className="home-page">
      <TopBar /> {/* Uses default title "Campus Connect" */}
      <div className="content">
        <div className="friends-section">
          <h2>Friends</h2>
          <FriendsList friends={friends} />
        </div>
        <div className="chats-section">
          <h2>Chats</h2>
          <ChatsList chats={chats} />
          <button
            className="create-chat-button"
            onClick={() => setIsCreateChatOpen(true)}
          >
            <FaPlus /> Create New Chat
          </button>
        </div>
      </div>
      {isCreateChatOpen && (
        <CreateChatModal
          friends={friends}
          onCreate={handleCreateChat}
          onClose={() => setIsCreateChatOpen(false)}
        />
      )}
    </div>
  );
};

const FriendsList = ({ friends }) => (
  <ul className="friends-list">
    {friends.map((friend) => (
      <li key={friend.id} className="friend-item">
        <div className="avatar">{friend.name[0]}</div>
        <span>{friend.name}</span>
      </li>
    ))}
  </ul>
);

const ChatsList = ({ chats }) => (
  <ul className="chats-list">
    {chats.map((chat) => (
      <li key={chat.id} className="chat-item">
        <span>{chat.name}</span>
        <span className="participant-count">
          ({chat.participants.length} members)
        </span>
      </li>
    ))}
  </ul>
);

const CreateChatModal = ({ friends, onCreate, onClose }) => {
  const [chatName, setChatName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [error, setError] = useState(''); // State for error message

  const handleToggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = () => {
    if (!chatName.trim()) {
      setError('Chat name is required.');
      return;
    }
    if (selectedFriends.length === 0) {
      setError('Please select at least one friend.');
      return;
    }
    onCreate(selectedFriends, chatName);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Chat</h3>
        {error && <div className="error-message">{error}</div>}
        <input
          className="modal-textbox"
          type="text"
          placeholder="Chat Name"
          value={chatName}
          onChange={(e) => {
            setChatName(e.target.value);
            setError('');
          }}
        />
        <div className="friends-selection">
          {friends.map((friend) => (
            <label key={friend.id} className="friend-selection-item">
              <div className="friend-info">
                <div className="avatar">{friend.name[0]}</div>
                <span className="friend-name">{friend.name}</span>
              </div>
              {selectedFriends.includes(friend.id) ? (
                <FaCheckSquare className="checkbox-icon checked" />
              ) : (
                <FaRegSquare className="checkbox-icon" />
              )}
              <input
                type="checkbox"
                checked={selectedFriends.includes(friend.id)}
                onChange={() => handleToggleFriend(friend.id)}
                className="hidden-checkbox"
              />
            </label>
          ))}
        </div>
        <div className="modal-buttons">
          <button onClick={handleSubmit}>Create</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;