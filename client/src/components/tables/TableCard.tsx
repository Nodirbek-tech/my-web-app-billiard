import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Play, Eye, Clock } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Table } from '@/types';
import { sessionsApi } from '@/api/sessions';
import { useUiStore } from '@/store/uiStore';
import { useTimer } from '@/hooks/useTimer';

function LiveTimer({ startTime }: { startTime: string }) {
  const { display } = useTimer(startTime);
  return <span className="font-mono text-3xl font-bold text-primary tabular-nums">{display}</span>;
}

function LiveCost({ table }: { table: Table }) {
  const { elapsed } = useTimer(table.activeSession?.startTime ?? null);
  const hours = elapsed / 3600000;
  const h = table.activeSession ? new Date(table.activeSession.startTime).getHours() : 0;
  const isNight = h >= 18 || h < 6;
  const rate = table.nightPrice && isNight ? table.nightPrice : table.hourlyPrice;
  const cost = Math.round(hours * rate * 100) / 100;
  return <span className="text-emerald-400 font-semibold">{formatCurrency(cost)}</span>;
}

interface TableCardProps {
  table: Table;
}

export default function TableCard({ table }: TableCardProps) {
  const { setSelectedTable } = useUiStore();
  const qc = useQueryClient();

  const { mutate: startSession, isPending } = useMutation({
    mutationFn: () => sessionsApi.start(table.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success(`${table.name}da seans boshlandi`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Seansni boshlab bo'lmadi"),
  });

  const isOccupied = table.status === 'OCCUPIED';
  const session = table.activeSession;
  const currentRound = session?.rounds?.find((r) => !r.endTime);

  return (
    <div
      className={cn(
        'relative rounded-xl border p-5 flex flex-col gap-4 transition-all duration-200 cursor-pointer hover:shadow-lg',
        isOccupied
          ? 'bg-card border-primary/40 shadow-primary/10 shadow-md hover:border-primary/60'
          : 'bg-card border-border hover:border-accent',
      )}
      onClick={() => isOccupied && setSelectedTable(table.id)}
    >
      {isOccupied && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">#{table.number}</p>
          <h3 className="text-lg font-bold text-foreground mt-0.5">{table.name}</h3>
        </div>
        <Badge variant={isOccupied ? 'danger' : 'success'}>
          {isOccupied ? 'Band' : "Bo'sh"}
        </Badge>
      </div>

      {isOccupied && session && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <LiveTimer startTime={currentRound?.startTime ?? session.startTime} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Raund {(session.rounds?.filter(r => r.endTime).length ?? 0) + 1}
            </span>
            <LiveCost table={table} />
          </div>
        </div>
      )}

      {!isOccupied && (
        <div className="text-xs text-muted-foreground">
          <p>Kun: {formatCurrency(table.hourlyPrice)}/soat</p>
          {table.nightPrice && <p>Tun: {formatCurrency(table.nightPrice)}/soat</p>}
        </div>
      )}

      <div className="mt-auto">
        {isOccupied ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-primary/30 text-primary hover:bg-primary/10"
            onClick={(e) => { e.stopPropagation(); setSelectedTable(table.id); }}
          >
            <Eye className="w-4 h-4 mr-2" />
            Seansni boshqarish
          </Button>
        ) : (
          <Button
            variant="success"
            size="sm"
            className="w-full"
            disabled={isPending}
            onClick={(e) => { e.stopPropagation(); startSession(); }}
          >
            <Play className="w-4 h-4 mr-2" />
            {isPending ? 'Boshlanmoqda...' : "O'yinni boshlash"}
          </Button>
        )}
      </div>
    </div>
  );
}
