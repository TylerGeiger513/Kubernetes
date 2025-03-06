import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import MainContainer from '../components/MainContainer';
import UserProfilePopup from '../components/UserProfilePopup';
import './styles/ChatsUI.css';

// Sample chat data
const chatsData = [
  { id: 1, name: 'Alice', participants: ['You', 'Alice'] },
  { id: 2, name: 'Bob', participants: ['You', 'Bob'] },
  { id: 3, name: 'Group Chat', participants: ['You', 'Alice', 'Bob', 'Charlie'] },
];

const ChatUI = () => {
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

export default ChatUI;