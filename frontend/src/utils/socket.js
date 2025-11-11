import { io } from 'socket.io-client';

let socket = null;

// Dynamically choose the Socket.IO server URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const initializeSocket = (userId) => {
  if (!userId) return null;

  // Disconnect any existing socket
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Initialize a new Socket.IO connection
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    withCredentials: true, // ✅ send cookies (important for auth if needed)
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    socket.emit('join', `user_${userId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log('⚠️ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  return socket;
};

// Get the existing socket instance
export const getSocket = () => socket;

// Disconnect socket manually (e.g. on logout)
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log('🧹 Socket manually disconnected');
    socket = null;
  }
};
