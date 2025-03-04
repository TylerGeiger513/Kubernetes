import React, { useState, useEffect, useRef } from 'react';
import { FaCog, FaUser, FaVolumeUp, FaTimes } from 'react-icons/fa';
import { HiPaperAirplane } from "react-icons/hi2";
import './ServerUI.css';

const ServerUI = () => {
  const [selectedChannel, setSelectedChannel] = useState('# general');
  const [selectedUser, setSelectedUser] = useState(null); // State for selected user
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for popup visibility

  return (
    <div className="app-container">
      <TopBar />
      <MainContainer
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
        setSelectedUser={setSelectedUser} // Pass setter to MainContainer
        setIsPopupOpen={setIsPopupOpen}   // Pass setter to MainContainer
      />
      {isPopupOpen && (
        <UserProfilePopup
          user={selectedUser}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
};

const TopBar = () => (
  <div className="top-bar">
    <div className="server-info">Campus Connect</div>
    <div className="icons">
      <FaCog className="icon" style={{ marginRight: 15 }} />
      <FaUser className="icon" />
    </div>
  </div>
);

const MainContainer = ({ selectedChannel, setSelectedChannel, setSelectedUser, setIsPopupOpen }) => (
  <div className="main-container">
    <LeftSidebar
      selectedChannel={selectedChannel}
      setSelectedChannel={setSelectedChannel}
    />
    <CentralArea selectedChannel={selectedChannel} />
    <RightSidebar
      setSelectedUser={setSelectedUser}
      setIsPopupOpen={setIsPopupOpen}
    />
  </div>
);

const LeftSidebar = ({ selectedChannel, setSelectedChannel }) => (
  <div className="left-sidebar">
    <div className="server-header">WCUPA</div>

    <div className="channel-header">TEXT CHANNELS</div>
    <ul className="channel-list">
      {['# general', '# stuff', '# other'].map((channel) => (
        <li
          key={channel}
          className={`channel ${selectedChannel === channel ? 'selected' : ''}`}
          onClick={() => setSelectedChannel(channel)}
        >
          {channel}
        </li>
      ))}
    </ul>

    <div className="channel-header">VOICE CHANNELS</div>
    <ul className="channel-list">
      <li className="channel">
        <FaVolumeUp style={{ marginRight: 8 }} /> General
      </li>
    </ul>
  </div>
);

const CentralArea = ({ selectedChannel }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      user: 'You',
      content: inputText.trim(),
      timestamp: new Date().toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      id: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  return (
    <div className="central-area">
      <div className="chat-messages">
        <header>
          <h1 className="header-title">{selectedChannel}</h1>
          <p className="header-subtitle">This is the beginning of this server.</p>
          <p className="header-timestamp">February 3, 2025</p>
        </header>

        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const showUserInfo = !prevMessage || prevMessage.user !== message.user;

          return (
            <div className="message" key={message.id}>
              {showUserInfo ? (
                <>
                  <div className="avatar">Y</div>
                  <div className="message-content">
                    <span className="username">{message.user}</span>
                    <span className="timestamp">{message.timestamp}</span>
                    {message.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </>
              ) : (
                <div className="message-content collapsed">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          placeholder={`Message ${selectedChannel}`}
          className="chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault(); // Prevent new line
              handleSend();
            }
          }}
        />
        <button className="send-button" onClick={handleSend}>
          <HiPaperAirplane className="send-icon" />
        </button>
      </div>
    </div>
  );
};

const RightSidebar = ({ setSelectedUser, setIsPopupOpen }) => {
  const onlineUsers = ['user1', 'user2'];
  const offlineUsers = ['user3', 'user4', 'user5', 'user6'];

  return (
    <div className="right-sidebar">
      <h3>ONLINE — {onlineUsers.length}</h3>
      <div className="user-list">
        {onlineUsers.map(name => (
          <User
            key={name}
            name={name}
            status="online"
            onClick={() => {
              setSelectedUser({ name, status: 'online' });
              setIsPopupOpen(true);
            }}
          />
        ))}
      </div>

      <h3>OFFLINE — {offlineUsers.length}</h3>
      <div className="user-list">
        {offlineUsers.map(name => (
          <User
            key={name}
            name={name}
            status="offline"
            onClick={() => {
              setSelectedUser({ name, status: 'offline' });
              setIsPopupOpen(true);
            }}
          />
        ))}
      </div>
    </div>
  );
};

const User = ({ name, status, onClick }) => (
  <div className="user" onClick={onClick} style={{ cursor: 'pointer' }}>
    <div className={`status-dot ${status}`} />
    <div className="avatar">{name.slice(-1)}</div>
    <span>{name}</span>
  </div>
);

const UserProfilePopup = ({ user, onClose }) => (
  <div className="popup-overlay" onClick={onClose}>
    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
      <button className="close-button" onClick={onClose}>
        <FaTimes />
      </button>
      <div className="user-profile">
        <div className="profile-avatar">{user.name.slice(-1)}</div>
        <h2>{user.name}</h2>
        <div className="status-container">
          <div className={`status-dot ${user.status}`} />
          <span>{user.status}</span>
        </div>
      </div>
    </div>
  </div>
);

export default ServerUI;