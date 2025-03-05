import React from 'react';

const User = ({ name, status, onClick }) => (
  <div className="user" onClick={onClick} style={{ cursor: 'pointer' }}>
    <div className={`status-dot ${status}`} />
    <div className="avatar">{name.slice(-1)}</div>
    <span>{name}</span>
  </div>
);

export default User;