import React from 'react';
import { FaTimes } from 'react-icons/fa';

const UserProfilePopup = ({ user, onClose }) => (
  <div className="popup-overlay" onClick={onClose}>
    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
      <button className="close-button" onClick={onClose}>
        <FaTimes />
      </button>
      <div className="user-profile">
        <div className="profile-avatar">{user.name.slice(-1)}</div>
        <h2>{user.name}</h2>
        <div className="status-container">
          <div className={`status-dot ${user.status}`} />
          <span>{user.status}</span>
        </div>
      </div>
    </div>
  </div>
);

export default UserProfilePopup;