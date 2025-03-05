import React from 'react';

function Notifications({ notifications }) {
  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <ul>
          {notifications.map((note, idx) => (
            <li key={idx}>
              <strong>{note.type}: </strong>
              <span>{note.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
