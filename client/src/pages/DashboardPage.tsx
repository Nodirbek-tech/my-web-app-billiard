import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard } from 'lucide-react';
import { tablesApi } from '@/api/tables';
import { settingsApi } from '@/api/settings';
import { useUiStore } from '@/store/uiStore';
import { useTableSocket } from '@/hooks/useTableSocket';
import { Skeleton } from '@/components/ui/skeleton';
import TableCard from '@/components/tables/TableCard';
import AddTableDialog from '@/components/tables/AddTableDialog';
import SessionPanel from '@/components/sessions/SessionPanel';
import ReceiptModal from '@/components/receipt/ReceiptModal';
import type { Table, BusinessSettings } from '@/types';

function TablesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { selectedTableId, setSelectedTable } = useUiStore();

  // WebSocket: real-time table/session updates — polling is a 30s fallback only
  useTableSocket();

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 60_000,
  });

  const selectedTable = tables.find((t: Table) => t.id === selectedTableId);

  const available = tables.filter((t: Table) => t.status === 'AVAILABLE').length;
  const occupied = tables.filter((t: Table) => t.status === 'OCCUPIED').length;

  return (
    <div className="flex gap-6 h-full">
      <div className={`flex-1 min-w-0 transition-all duration-300 ${selectedTableId ? 'mr-0' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-primary" />
              Stollar
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {available} bo'sh • {occupied} band • {tables.length} jami
            </p>
          </div>
          <AddTableDialog />
        </div>

        {isLoading ? (
          <TablesSkeleton />
        ) : tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <LayoutDashboard className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-lg font-medium">Hali stol yo'q</p>
            <p className="text-sm">Boshlash uchun birinchi bilyard stolini qo'shing</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((table: Table) => (
              <TableCard key={table.id} table={table} settings={settings} />
            ))}
          </div>
        )}
      </div>

      {selectedTable && (
        <div className="w-80 flex-shrink-0 bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
          <SessionPanel table={selectedTable} settings={settings} />
        </div>
      )}

      <ReceiptModal />
    </div>
  );
}
