import { io, Socket } from 'socket.io-client';

// Connect to the same origin as the page — Vite proxies /socket.io → NestJS.
// This makes cross-device access work: any device that can reach the Vite server
// gets WebSocket forwarded to localhost:3000 on the host machine.
export const createSocket = (): Socket =>
  io({
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
