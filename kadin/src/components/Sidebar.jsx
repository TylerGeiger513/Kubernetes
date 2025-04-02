import React, { useState } from 'react';
import { Home, User, BookOpen, Calendar, Settings, School } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const navItems = [
    { id: 'Home', icon: Home, label: 'Home' },
    { id: 'Profile', icon: User, label: 'Profile' },
    { id: 'Courses', icon: BookOpen, label: 'Courses' },
    { id: 'Schedule', icon: Calendar, label: 'Schedule' },
    { id: 'Settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <School className="university-icon" size={28} />
        <h2>Campus Connect</h2>
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
          src="/api/placeholder/40/40" 
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