import React from 'react';
import { FaCog, FaUser, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './TopBar.css';

const TopBar = () => (
  <div className="top-bar">
    <div className="server-info">Campus Connect</div>
    <div className="icons">
      <Link to="/home">
        <FaHome className="top-bar-icon" />
      </Link>
      <FaCog className="top-bar-icon" />
      <Link to="/profile">
        <FaUser className="top-bar-icon" />
      </Link>
    </div>
  </div>
);

export default TopBar;