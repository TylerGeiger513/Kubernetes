import React from 'react';

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

export default LeftSidebar;