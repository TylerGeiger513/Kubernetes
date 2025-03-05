import React from 'react';
import LeftSidebar from './LeftSidebar';
import CentralArea from './CentralArea';
import RightSidebar from './RightSidebar';

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

export default MainContainer;