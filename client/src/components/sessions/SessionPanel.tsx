import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, SkipForward, StopCircle, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatTime } from '@/lib/utils';
import { useTimer } from '@/hooks/useTimer';
import { sessionsApi } from '@/api/sessions';
import { tablesApi } from '@/api/tables';
import { useUiStore } from '@/store/uiStore';
import OrderList from '@/components/orders/OrderList';
import AddOrderDialog from '@/components/orders/AddOrderDialog';
import PaymentDialog from '@/components/payments/PaymentDialog';
import type { Table } from '@/types';

function SessionTimer({ startTime, table }: { startTime: string; table: Table }) {
  const { display, elapsed } = useTimer(startTime);
  const hours = elapsed / 3600000;
  const h = new Date(startTime).getHours();
  const isNight = h >= 18 || h < 6;
  const rate = table.nightPrice && isNight ? table.nightPrice : table.hourlyPrice;
  const liveCost = Math.round(hours * rate * 100) / 100;

  return (
    <div className="bg-secondary/40 rounded-xl p-4 text-center space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Joriy raund</p>
      <p className="font-mono text-5xl font-bold text-primary tabular-nums leading-tight">{display}</p>
      <p className="text-emerald-400 font-semibold text-lg">{formatCurrency(liveCost)}</p>
      <p className="text-xs text-muted-foreground">
        {isNight ? '🌙 Tun' : '☀️ Kun'} · {formatCurrency(rate)}/soat
      </p>
    </div>
  );
}

interface SessionPanelProps {
  table: Table;
}

export default function SessionPanel({ table }: SessionPanelProps) {
  const [showPayment, setShowPayment] = useState(false);
  const { setSelectedTable, setReceiptData } = useUiStore();
  const qc = useQueryClient();

  const { data: tableData, isLoading } = useQuery({
    queryKey: ['tables', table.id],
    queryFn: () => tablesApi.getOne(table.id),
    refetchInterval: 5000,
  });

  const currentTable = tableData ?? table;
  const session = currentTable.activeSession;
  const currentRound = session?.rounds?.find((r) => !r.endTime);
  const completedRounds = session?.rounds?.filter((r) => !!r.endTime) ?? [];

  const { mutate: nextRound, isPending: isNextRound } = useMutation({
    mutationFn: () => sessionsApi.nextRound(session!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Keyingi raund boshlandi!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  if (isLoading && !session) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 gap-2">
        <StopCircle className="w-10 h-10 opacity-20" />
        <p className="text-sm">Faol seans yo'q</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-bold text-foreground">{currentTable.name}</h2>
            <p className="text-xs text-muted-foreground">
              #{currentTable.number} · Boshlangan: {formatTime(session.startTime)}
            </p>
          </div>
          <button
            onClick={() => setSelectedTable(null)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {currentRound && (
              <SessionTimer startTime={currentRound.startTime} table={currentTable} />
            )}

            {completedRounds.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Tugallangan raundlar
                </p>
                {completedRounds.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs font-bold">
                        R{r.roundNum}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {formatTime(r.startTime)} → {r.endTime ? formatTime(r.endTime) : '…'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(r.cost ?? 0)}</p>
                      <p className="text-xs text-muted-foreground">{r.minutes} daqiqa</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Buyurtmalar ({session.orders?.length ?? 0})
                </p>
                <AddOrderDialog sessionId={session.id} />
              </div>
              <OrderList orders={session.orders ?? []} sessionActive />
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border space-y-2 flex-shrink-0">
          <Button
            variant="warning"
            size="lg"
            className="w-full"
            onClick={() => nextRound()}
            disabled={isNextRound || showPayment}
          >
            <SkipForward className="w-4 h-4 mr-2" />
            {isNextRound ? 'Boshlanmoqda…' : 'Keyingi raund'}
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="w-full"
            onClick={() => setShowPayment(true)}
            disabled={isNextRound}
          >
            <StopCircle className="w-4 h-4 mr-2" />
            Yakunlash va to'lov
          </Button>
        </div>
      </div>

      {showPayment && session && (
        <PaymentDialog
          session={session}
          table={currentTable}
          open={showPayment}
          onCancel={() => setShowPayment(false)}
          onSuccess={(receipt) => {
            setShowPayment(false);
            setSelectedTable(null);
            qc.invalidateQueries({ queryKey: ['tables'] });
            setReceiptData(receipt);
          }}
        />
      )}
    </>
  );
}
