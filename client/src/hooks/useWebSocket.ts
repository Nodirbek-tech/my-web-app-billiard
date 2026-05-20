import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createSocket } from '@/lib/socket';

export function useWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = createSocket();

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
