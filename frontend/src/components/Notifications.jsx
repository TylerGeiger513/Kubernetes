import React, { useState, useEffect } from 'react';
import { createNotificationsSocket } from '../utils/api';

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = createNotificationsSocket();
    socket.on('notification', (data) => {
      setNotifications((prev) => [...prev, data]);
    });
    return () => socket.disconnect();
  }, []);

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
