import axios from 'axios';
import io from 'socket.io-client';

// Use relative paths since NGINX routes /api and /channels appropriately.
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const createSocket = () => {
  return io('/channels', { 
    path: '/channels/socket.io', 
    withCredentials: true 
  });
};
