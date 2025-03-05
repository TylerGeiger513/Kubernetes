import React from 'react';
import { FaUser, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './TopBar.css';

const TopBar = () => (
  <div className="top-bar">
    <div className="server-info">Campus Connect</div>
    <div className="icons">
      <Link to="/home">
        <FaHome className="top-bar-icon home-icon" />
      </Link>
      <Link to="/profile">
        <FaUser className="top-bar-icon" />
      </Link>
    </div>
  </div>
);

export default TopBar;