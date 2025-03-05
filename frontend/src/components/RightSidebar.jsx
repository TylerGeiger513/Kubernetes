import React from 'react';
import User from './User';

const RightSidebar = ({ participants, setSelectedUser, setIsPopupOpen }) => {
  const onlineUsers = participants.filter((user) => user !== 'You');

  return (
    <div className="right-sidebar">
      <h3>PARTICIPANTS — {onlineUsers.length}</h3>
      <div className="user-list">
        {onlineUsers.map((name) => (
          <User
            key={name}
            name={name}
            status="online"
            onClick={() => {
              setSelectedUser({ name, status: 'online' });
              setIsPopupOpen(true);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default RightSidebar;