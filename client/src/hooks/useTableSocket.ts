import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { tablesApi } from '@/api/tables';
import type { Table } from '@/types';

const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useTableSocket() {
  const qc = useQueryClient();
  // Prevent concurrent fetches for the same tableId
  const pendingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const socket: Socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    async function fetchAndUpdateTable(id: number) {
      if (pendingRef.current.has(id)) return;
      pendingRef.current.add(id);
      try {
        const fresh = await tablesApi.getOne(id);
        qc.setQueryData<Table[]>(['tables'], (old) =>
          old?.map((t) => (t.id === id ? fresh : t))
        );
        qc.setQueryData(['tables', id], fresh);
      } catch {
        // silent — polling fallback will catch it
      } finally {
        pendingRef.current.delete(id);
      }
    }

    socket.on('table:update', ({ id, status }: { id: number; status: string }) => {
      // Instant optimistic status flip while the targeted fetch is in flight
      qc.setQueryData<Table[]>(['tables'], (old) =>
        old?.map((t) =>
          t.id === id
            ? {
                ...t,
                status: status as Table['status'],
                activeSession: status === 'AVAILABLE' ? null : t.activeSession,
              }
            : t
        )
      );
      fetchAndUpdateTable(id);
    });

    socket.on('session:update', ({ tableId }: { id: number; tableId: number }) => {
      fetchAndUpdateTable(tableId);
    });

    return () => {
      socket.disconnect();
    };
  }, [qc]);
}
