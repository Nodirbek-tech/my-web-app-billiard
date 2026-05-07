import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

export function useWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
      transports: ['websocket'],
    });

    socket.on('table:update', () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    });

    socket.on('session:update', (data: { id: number; tableId: number }) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['session', data.id] });
    });

    return () => { socket.disconnect(); };
  }, [queryClient]);
}
