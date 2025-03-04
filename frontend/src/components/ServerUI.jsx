import React, { useState } from 'react';
import { FaCog, FaUser, FaVolumeUp } from 'react-icons/fa';
import { HiPaperAirplane } from "react-icons/hi2";
import './ServerUI.css';

const ServerUI = () => {
  const [selectedChannel, setSelectedChannel] = useState('# general');

  return (
    <div className="app-container">
      <TopBar />
      <MainContainer 
        selectedChannel={selectedChannel} 
        setSelectedChannel={setSelectedChannel} 
      />
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

const MainContainer = ({ selectedChannel, setSelectedChannel }) => (
  <div className="main-container">
    <LeftSidebar 
      selectedChannel={selectedChannel} 
      setSelectedChannel={setSelectedChannel} 
    />
    <CentralArea selectedChannel={selectedChannel} />
    <RightSidebar />
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

const CentralArea = ({ selectedChannel }) => (
  <div className="central-area">
    <div className="chat-messages">
      <header>
        <h1 className="header-title">{selectedChannel}</h1>
        <p className="header-subtitle">This is the beginning of this server.</p>
        <p className="header-timestamp">February 3, 2025</p>
      </header>
      
      <div className="message">
        <div className="avatar">0</div>
        <div className="message-content">
          <span className="username">user</span>
          <span className="timestamp">2/3/25, 2:58 PM</span>
          <p>hi</p>
          <p>blah</p>
        </div>
      </div>
    </div>
    
    <div className="chat-input-container">
      <input 
        type="text" 
        placeholder={`Message ${selectedChannel}`}
        className="chat-input"
      />
      <button className="send-button">
        <HiPaperAirplane className="send-icon" />
      </button>
    </div>
  </div>
);

const RightSidebar = () => (
  <div className="right-sidebar">
    <h3>ONLINE — 2</h3>
    <div className="user-list">
      <User name="user1" status="online" />
      <User name="user2" status="online" />
    </div>
    
    <h3>OFFLINE — 4</h3>
    <div className="user-list">
      <User name="user3" status="offline" />
      <User name="user4" status="offline" />
      <User name="user5" status="offline" />
      <User name="user6" status="offline" />
    </div>
  </div>
);

const User = ({ name, status }) => (
  <div className="user">
    <div className={`status-dot ${status}`} />
    <div className="avatar">{name.slice(-1)}</div>
    <span>{name}</span>
  </div>
);

export default ServerUI;