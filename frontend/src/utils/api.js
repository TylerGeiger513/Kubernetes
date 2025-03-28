import axios from 'axios';
import io from 'socket.io-client';

// Use relative paths since NGINX routes /api and /channels appropriately.
if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = '/api';
} else {
  axios.defaults.baseURL = 'http://localhost:8081/api';
}

export const api = axios.create({
  withCredentials: true,
});

export const createSocket = () => {
  return io('/channels', { 
    path: '/channels/socket.io', 
    withCredentials: true 
  });
};

export const createNotificationsSocket = () => {
  return io('/notifications', { 
    path: '/notifications/socket.io', 
    withCredentials: true 
  });
};
