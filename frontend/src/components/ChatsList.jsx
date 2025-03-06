import React from 'react';
import { Link } from 'react-router-dom';
import '../pages/styles/HomePage.css'; // Import the existing CSS to maintain the look

const ChatsList = ({ chats }) => (
  <ul className="chats-list">
    {chats.map((chat) => (
      <li key={chat.id} className="chat-item">
        <Link to="/" className="chat-link">
          <span>{chat.name}</span>
          <span className="participant-count">
            ({chat.participants.length} members)
          </span>
        </Link>
      </li>
    ))}
  </ul>
);

export default ChatsList;