import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Play, Eye, Clock, Sun, Moon } from 'lucide-react';
import { cn, formatCurrency, calcCostMs, parseTimeHour, now as serverNow } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Table, BusinessSettings } from '@/types';
import { sessionsApi } from '@/api/sessions';
import { useUiStore } from '@/store/uiStore';
import { useTimer } from '@/hooks/useTimer';

function LiveTimer({ startTime }: { startTime: string }) {
  const { display } = useTimer(startTime);
  return <span className="font-mono text-3xl font-bold text-primary tabular-nums">{display}</span>;
}

function LiveCost({ startTime, settings }: { startTime: string; settings?: BusinessSettings }) {
  const { elapsed } = useTimer(startTime);
  if (!settings) return null;
  const now = serverNow();
  const start = now - elapsed;
  const cost = calcCostMs(
    start,
    now,
    settings.dayHourlyPrice,
    settings.nightHourlyPrice,
    parseTimeHour(settings.dayStartTime),
    parseTimeHour(settings.nightStartTime),
  );
  return <span className="text-emerald-400 font-semibold">{formatCurrency(cost)}</span>;
}

interface TableCardProps {
  table: Table;
  settings?: BusinessSettings;
}

export default function TableCard({ table, settings }: TableCardProps) {
  const { setSelectedTable } = useUiStore();
  const qc = useQueryClient();

  const { mutate: startSession, isPending } = useMutation({
    mutationFn: () => sessionsApi.start(table.id),
    onMutate: async () => {
      // Cancel in-flight refetches so they don't overwrite the optimistic update
      await qc.cancelQueries({ queryKey: ['tables'] });
      const snapshot = qc.getQueryData<Table[]>(['tables']);
      // Instantly flip the card to OCCUPIED
      qc.setQueryData<Table[]>(['tables'], (old) =>
        old?.map((t) => (t.id === table.id ? { ...t, status: 'OCCUPIED' as const } : t))
      );
      return { snapshot };
    },
    onSuccess: (newSession) => {
      // Replace with actual session data from the API
      qc.setQueryData<Table[]>(['tables'], (old) =>
        old?.map((t) =>
          t.id === table.id ? { ...t, status: 'OCCUPIED', activeSession: newSession as any } : t
        )
      );
      toast.success(`${table.name}da seans boshlandi`);
    },
    onError: (err: any, _, context: any) => {
      if (context?.snapshot) qc.setQueryData(['tables'], context.snapshot);
      toast.error(err.response?.data?.message || "Seansni boshlab bo'lmadi");
    },
  });

  const isOccupied = table.status === 'OCCUPIED';
  const session = table.activeSession;
  const currentRound = session?.rounds?.find((r) => !r.endTime);

  const nowHour = parseInt(new Date(serverNow()).toLocaleString('en-US', { timeZone: 'Asia/Tashkent', hour: 'numeric', hour12: false }), 10);
  const dayStartHour = settings ? parseTimeHour(settings.dayStartTime) : 6;
  const nightStartHour = settings ? parseTimeHour(settings.nightStartTime) : 18;
  const isCurrentlyNight = nowHour >= nightStartHour || nowHour < dayStartHour;

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
            <LiveCost
              startTime={currentRound?.startTime ?? session.startTime}
              settings={settings}
            />
          </div>
        </div>
      )}

      {!isOccupied && settings && (
        <div className="text-xs space-y-1 text-muted-foreground">
          <p className={cn('flex items-center gap-1.5', !isCurrentlyNight && 'text-amber-400 font-medium')}>
            <Sun className="w-3 h-3" />
            Kun: {formatCurrency(settings.dayHourlyPrice)}/soat
          </p>
          <p className={cn('flex items-center gap-1.5', isCurrentlyNight && 'text-blue-400 font-medium')}>
            <Moon className="w-3 h-3" />
            Tun: {formatCurrency(settings.nightHourlyPrice)}/soat
          </p>
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
