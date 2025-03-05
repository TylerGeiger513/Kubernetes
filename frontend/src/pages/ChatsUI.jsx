import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { HiPaperAirplane } from 'react-icons/hi2';
import TopBar from '../components/TopBar';
import './ChatsUI.css';

// Sample chat data
const chatsData = [
  { id: 1, name: 'Alice', participants: ['You', 'Alice'] },
  { id: 2, name: 'Bob', participants: ['You', 'Bob'] },
  { id: 3, name: 'Group Chat', participants: ['You', 'Alice', 'Bob', 'Charlie'] },
];

const ServerUI = () => {
  const [selectedChat, setSelectedChat] = useState(chatsData[0]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div className="app-container">
      <TopBar />
      <MainContainer
        chats={chatsData}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        setSelectedUser={setSelectedUser}
        setIsPopupOpen={setIsPopupOpen}
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


/** MainContainer Component */
const MainContainer = ({ chats, selectedChat, setSelectedChat, setSelectedUser, setIsPopupOpen }) => (
  <div className="main-container">
    <LeftSidebar
      chats={chats}
      selectedChat={selectedChat}
      setSelectedChat={setSelectedChat}
    />
    <CentralArea selectedChat={selectedChat} />
    <RightSidebar
      participants={selectedChat.participants}
      setSelectedUser={setSelectedUser}
      setIsPopupOpen={setIsPopupOpen}
    />
  </div>
);

/** LeftSidebar Component */
const LeftSidebar = ({ chats, selectedChat, setSelectedChat }) => (
  <div className="left-sidebar">
    <div className="channel-header">CHATS</div>
    <ul className="channel-list">
      {chats.map((chat) => (
        <li
          key={chat.id}
          className={`channel ${selectedChat.id === chat.id ? 'selected' : ''}`}
          onClick={() => setSelectedChat(chat)}
        >
          {chat.name}
        </li>
      ))}
    </ul>
  </div>
);

/** CentralArea Component */
const CentralArea = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        hour12: true,
      }),
      id: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  return (
    <div className="central-area">
      <div className="chat-messages">
        <header>
          <h1 className="header-title">{selectedChat.name}</h1>
          <p className="header-subtitle">
            This is the beginning of your conversation with {selectedChat.name}.
          </p>
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
          placeholder={`Message ${selectedChat.name}`}
          className="chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
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

/** RightSidebar Component */
const RightSidebar = ({ participants, setSelectedUser, setIsPopupOpen }) => {
  const onlineUsers = participants.filter((user) => user !== 'You');

  return (
    <div className="right-sidebar">
      <h3>PARTICIPANTS — {onlineUsers.length}</h3>
      <div className="user-list">
        {onlineUsers.map((name) => (
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
    </div>
  );
};

/** User Component */
const User = ({ name, status, onClick }) => (
  <div className="user" onClick={onClick} style={{ cursor: 'pointer' }}>
    <div className={`status-dot ${status}`} />
    <div className="avatar">{name.slice(-1)}</div>
    <span>{name}</span>
  </div>
);

/** UserProfilePopup Component */
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