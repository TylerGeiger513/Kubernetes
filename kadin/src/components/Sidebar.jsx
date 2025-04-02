import React, { useState } from 'react';
import { Home, User, MessageCircle, Settings} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const navItems = [
    { id: 'Home', icon: Home, label: 'Home' },
    { id: 'Profile', icon: User, label: 'Profile' },
    { id: 'Chats', icon: MessageCircle, label: 'Chats' },
    { id: 'Settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img 
          src="/LogoTransparent.png" 
          alt="Campus Connect Logo" 
          className="sidebar-logo"
        />
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="nav-icon" size={20} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-profile">
        <img 
          src="https://t3.ftcdn.net/jpg/02/43/12/34/240_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg" 
          alt="Profile" 
          className="profile-image" 
        />
        <div className="profile-info">
          <h3>John Smith</h3>
          <p>john@wcupa.edu</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;