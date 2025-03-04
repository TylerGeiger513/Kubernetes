import React from 'react';
import './ServerUI.css';

const ServerUI = () => {
  return (
    <div className="app-container">
      <TopBar />
      <MainContainer />
    </div>
  );
};

const TopBar = () => (
  <div className="top-bar">
    <div className="server-info">Campus Connect</div>
    <div className="icons">⚙️   👤</div>
  </div>
);

const MainContainer = () => (
  <div className="main-container">
    <LeftSidebar />
    <CentralArea />
    <RightSidebar />
  </div>
);

const LeftSidebar = () => (
  <div className="left-sidebar">
    <div className="server-header">WCUPA</div>
    
    <div className="channel-header">TEXT CHANNELS</div>
    <ul className="channel-list">
      <li className="channel selected"># general</li>
      <li className="channel"># stuff</li>
      <li className="channel"># other</li>
    </ul>
    
    <div className="channel-header">VOICE CHANNELS</div>
    <ul className="channel-list">
      <li className="channel">🔊 General</li>
    </ul>
  </div>
);

const CentralArea = () => (
  <div className="central-area">
    <header>
      <h1 className="header-title"># general</h1>
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