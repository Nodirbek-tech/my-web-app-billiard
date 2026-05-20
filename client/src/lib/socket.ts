import { io, Socket } from 'socket.io-client';

export const createSocket = (): Socket =>
  io('https://billiard-api-2210.onrender.com', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
