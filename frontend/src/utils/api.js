import axios from 'axios';
import io from 'socket.io-client';

// Use relative paths since NGINX routes /api and /channels appropriately.
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const createSocket = () => {
  // Connect to the /channels namespace.
  return io('/channels', { withCredentials: true });
};
