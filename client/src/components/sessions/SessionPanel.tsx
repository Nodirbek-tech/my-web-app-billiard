import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, SkipForward, StopCircle, Clock, DollarSign, UserPlus, CreditCard, Star, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatTime, calcCostMs, parseTimeHour } from '@/lib/utils';
import { useTimer } from '@/hooks/useTimer';
import { sessionsApi } from '@/api/sessions';
import { tablesApi } from '@/api/tables';
import { useUiStore } from '@/store/uiStore';
import OrderList from '@/components/orders/OrderList';
import AddOrderDialog from '@/components/orders/AddOrderDialog';
import PaymentDialog from '@/components/payments/PaymentDialog';
import CustomerSearch from '@/components/customers/CustomerSearch';
import type { Table, BusinessSettings, Session } from '@/types';

interface SessionTimerProps {
  startTime: string;
  dayRate: number;
  nightRate: number;
  dayStartHour: number;
  nightStartHour: number;
}

function SessionTimer({ startTime, dayRate, nightRate, dayStartHour, nightStartHour }: SessionTimerProps) {
  const { display, elapsed } = useTimer(startTime);
  const now = Date.now();
  const start = now - elapsed;
  const liveCost = calcCostMs(start, now, dayRate, nightRate, dayStartHour, nightStartHour);

  const currentHour = new Date().getHours();
  const isNight = currentHour >= nightStartHour || currentHour < dayStartHour;
  const currentRate = isNight ? nightRate : dayRate;

  return (
    <div className="bg-secondary/40 rounded-xl p-4 text-center space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Joriy raund</p>
      <p className="font-mono text-5xl font-bold text-primary tabular-nums leading-tight">{display}</p>
      <p className="text-emerald-400 font-semibold text-lg">{formatCurrency(liveCost)}</p>
      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
        {isNight
          ? <><Moon className="w-3 h-3" /> Tun</>
          : <><Sun className="w-3 h-3" /> Kun</>
        }
        {' · '}{formatCurrency(currentRate)}/soat
      </p>
    </div>
  );
}

interface SessionPanelProps {
  table: Table;
  settings?: BusinessSettings;
}

export default function SessionPanel({ table, settings }: SessionPanelProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const { setSelectedTable, setReceiptData } = useUiStore();
  const qc = useQueryClient();

  // No polling — WsHook (useTableSocket) pushes targeted updates to ['tables', table.id]
  const { data: tableData, isLoading } = useQuery({
    queryKey: ['tables', table.id],
    queryFn: () => tablesApi.getOne(table.id),
    staleTime: 10_000,
  });

  const currentTable = tableData ?? table;
  const session = currentTable.activeSession;
  const currentRound = session?.rounds?.find((r) => !r.endTime);
  const completedRounds = session?.rounds?.filter((r) => !!r.endTime) ?? [];

  const dayRate = settings?.dayHourlyPrice ?? 40000;
  const nightRate = settings?.nightHourlyPrice ?? 50000;
  const dayStartHour = settings ? parseTimeHour(settings.dayStartTime) : 6;
  const nightStartHour = settings ? parseTimeHour(settings.nightStartTime) : 18;

  const { mutate: nextRound, isPending: isNextRound } = useMutation({
    mutationFn: () => sessionsApi.nextRound(session!.id),
    onSuccess: () => {
      // Targeted: only refetch this one table, not the whole list
      qc.invalidateQueries({ queryKey: ['tables', table.id] });
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
              <SessionTimer
                startTime={currentRound.startTime}
                dayRate={dayRate}
                nightRate={nightRate}
                dayStartHour={dayStartHour}
                nightStartHour={nightStartHour}
              />
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

            {/* Customer section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  Mijoz
                </p>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowCustomerSearch(true)}>
                  <UserPlus className="w-3 h-3 mr-1" />
                  {session.customer ? "O'zgartirish" : 'Biriktirish'}
                </Button>
              </div>
              {session.customer ? (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                  <p className="font-semibold">{session.customer.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session.customer.cardNumber} · {session.customer.phone}
                  </p>
                  {session.customer.bonusBalance > 0 && (
                    <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Bonus: {formatCurrency(session.customer.bonusBalance)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-1">Mijoz biriktirilmagan</p>
              )}
            </div>

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
          settings={settings}
          open={showPayment}
          onCancel={() => setShowPayment(false)}
          onSuccess={(receipt) => {
            setShowPayment(false);
            setSelectedTable(null);
            // Immediately mark this table as available in the cache — no full refetch
            qc.setQueryData<Table[]>(['tables'], (old) =>
              old?.map((t) =>
                t.id === table.id ? { ...t, status: 'AVAILABLE' as const, activeSession: null } : t
              )
            );
            setReceiptData(receipt);
          }}
        />
      )}

      {showCustomerSearch && session && (
        <CustomerSearch
          sessionId={session.id}
          attachedCustomer={session.customer}
          open={showCustomerSearch}
          onClose={() => setShowCustomerSearch(false)}
        />
      )}
    </>
  );
}
