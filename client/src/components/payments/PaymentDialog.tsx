import { useState, useMemo, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Banknote, CreditCard, Shuffle, Tag, Percent, FileText, CheckCircle2, Loader2, Clock, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatCurrency, formatTime, formatDuration } from '@/lib/utils';
import { sessionsApi, type StopAndPayPayload } from '@/api/sessions';
import { useAuthStore } from '@/store/authStore';
import type { Session, Table, ReceiptData } from '@/types';

function useBillingPreview(session: Session, table: Table) {
  return useMemo(() => {
    const now = new Date();
    const activeRound = session.rounds?.find((r) => !r.endTime);

    let currentCost = 0;
    let currentMinutes = 0;

    if (activeRound) {
      const ms = now.getTime() - new Date(activeRound.startTime).getTime();
      currentMinutes = Math.ceil(ms / 60000);
      const h = new Date(activeRound.startTime).getHours();
      const isNight = h >= 18 || h < 6;
      const rate = table.nightPrice && isNight ? table.nightPrice : table.hourlyPrice;
      currentCost = Math.round((currentMinutes / 60) * rate * 100) / 100;
    }

    const completedRounds = session.rounds?.filter((r) => !!r.endTime) ?? [];
    const completedCost = completedRounds.reduce((s, r) => s + (r.cost ?? 0), 0);

    const allRoundsPreview = [
      ...completedRounds,
      ...(activeRound
        ? [{ ...activeRound, endTime: now.toISOString(), minutes: currentMinutes, cost: currentCost }]
        : []),
    ];

    const playCost = Math.round((completedCost + currentCost) * 100) / 100;
    const orderCost = Math.round((session.orders ?? []).reduce((s, o) => s + o.total, 0) * 100) / 100;
    const totalMinutes = allRoundsPreview.reduce((s, r) => s + (r.minutes ?? 0), 0);

    return { playCost, orderCost, totalMinutes, allRoundsPreview };
  }, [session, table]);
}

type PayMethod = 'CASH' | 'CARD' | 'MIXED';

interface PaymentDialogProps {
  session: Session;
  table: Table;
  open: boolean;
  onCancel: () => void;
  onSuccess: (receipt: ReceiptData) => void;
}

export default function PaymentDialog({ session, table, open, onCancel, onSuccess }: PaymentDialogProps) {
  const { user } = useAuthStore();
  const [method, setMethod] = useState<PayMethod>('CASH');
  const [discount, setDiscount] = useState('');
  const [serviceFee, setServiceFee] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [notes, setNotes] = useState('');

  const { playCost, orderCost, totalMinutes, allRoundsPreview } = useBillingPreview(session, table);

  const discountNum = Math.max(0, parseFloat(discount) || 0);
  const serviceFeeNum = Math.max(0, parseFloat(serviceFee) || 0);
  const total = Math.max(0, Math.round((playCost + orderCost + serviceFeeNum - discountNum) * 100) / 100);
  const cashNum = parseFloat(cashAmount) || 0;
  const cardNum = parseFloat(cardAmount) || 0;
  const change = method === 'CASH' && cashNum >= total ? Math.round((cashNum - total) * 100) / 100 : 0;

  useEffect(() => {
    if (method === 'MIXED' && cashNum > 0 && cashNum < total) {
      const remaining = Math.max(0, total - cashNum);
      setCardAmount(remaining.toFixed(0));
    }
  }, [cashNum, total, method]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload: StopAndPayPayload = {
        method,
        discount: discountNum || undefined,
        serviceFee: serviceFeeNum || undefined,
        notes: notes.trim() || undefined,
        cashierName: user?.name,
      };
      if (method === 'CASH' && cashNum > 0) payload.cashAmount = cashNum;
      if (method === 'CARD') payload.cardAmount = total;
      if (method === 'MIXED') { payload.cashAmount = cashNum; payload.cardAmount = cardNum; }
      return sessionsApi.stopAndPay(session.id, payload);
    },
    onSuccess: (receipt) => {
      toast.success("To'lov muvaffaqiyatli amalga oshirildi!");
      onSuccess(receipt);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "To'lov amalga oshmadi");
    },
  });

  const canSubmit = !isPending && (method !== 'MIXED' || (cashNum > 0 && cardNum > 0));

  const methodLabels: Record<PayMethod, string> = { CASH: 'NAQD', CARD: 'KARTA', MIXED: 'ARALASH' };
  const methodIcons = { CASH: Banknote, CARD: CreditCard, MIXED: Shuffle };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isPending) onCancel(); }}>
      <DialogContent className="max-w-lg max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 flex-shrink-0 border-b border-border">
          <DialogTitle className="text-lg">
            To'lov — {table.name} #{table.number}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Seans · {formatDuration(totalMinutes)} umumiy o'yin vaqti
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">

            {/* Billing summary */}
            <div className="rounded-xl bg-secondary/30 border border-border/50 overflow-hidden text-sm">
              <div className="p-3 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5" /> O'yin vaqti
                </p>
                {allRoundsPreview.map((r) => {
                  const isLive = !session.rounds.find((sr) => sr.id === r.id)?.endTime;
                  return (
                    <div key={r.id} className={cn('flex items-center justify-between', isLive && 'text-primary')}>
                      <div className="flex items-center gap-2">
                        <Badge variant={isLive ? 'default' : 'secondary'} className="h-4 px-1.5 text-xs">
                          R{r.roundNum}
                        </Badge>
                        <span className={cn('text-xs', isLive ? 'text-primary/80' : 'text-muted-foreground')}>
                          {formatTime(r.startTime)} {r.endTime ? `→ ${formatTime(r.endTime)}` : '→ hozir'} ({r.minutes} daq)
                          {isLive && ' *tax'}
                        </span>
                      </div>
                      <span className="font-medium tabular-nums">{formatCurrency(r.cost ?? 0)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between font-semibold pt-1.5 border-t border-border/50">
                  <span>O'yin jami</span>
                  <span>{formatCurrency(playCost)}</span>
                </div>
              </div>

              {(session.orders?.length ?? 0) > 0 && (
                <>
                  <Separator />
                  <div className="p-3 space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <ShoppingCart className="w-3.5 h-3.5" /> Mahsulotlar ({session.orders.length})
                    </p>
                    {session.orders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          {o.product.name} x{o.quantity}
                        </span>
                        <span className="font-medium tabular-nums">{formatCurrency(o.total)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold pt-1.5 border-t border-border/50">
                      <span>Mahsulotlar jami</span>
                      <span>{formatCurrency(orderCost)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Adjustments */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Chegirma (so'm)
                </Label>
                <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} min="0" step="500" placeholder="0" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Percent className="w-3 h-3" /> Xizmat haqi (so'm)
                </Label>
                <Input type="number" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} min="0" step="500" placeholder="0" className="h-9" />
              </div>
            </div>

            {/* Grand Total */}
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>O'yin</span><span>{formatCurrency(playCost)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Mahsulotlar</span><span>{formatCurrency(orderCost)}</span></div>
              {serviceFeeNum > 0 && <div className="flex justify-between text-muted-foreground"><span>Xizmat haqi</span><span>+{formatCurrency(serviceFeeNum)}</span></div>}
              {discountNum > 0 && <div className="flex justify-between text-amber-400 font-medium"><span>Chegirma</span><span>-{formatCurrency(discountNum)}</span></div>}
              <Separator />
              <div className="flex justify-between font-bold text-2xl">
                <span>JAMI</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To'lov turi</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['CASH', 'CARD', 'MIXED'] as PayMethod[]).map((m) => {
                  const Icon = methodIcons[m];
                  return (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                        method === m ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:border-accent hover:text-foreground',
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {methodLabels[m]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount inputs */}
            {method === 'CASH' && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Naqd miqdori (so'm)</Label>
                <Input type="number" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} min="0" step="500" placeholder={String(total)} className="h-9" />
                {change > 0 && (
                  <div className="flex items-center justify-between text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 mt-1">
                    <span className="text-emerald-400 font-medium">Qaytim pul</span>
                    <span className="text-emerald-400 font-bold text-base">{formatCurrency(change)}</span>
                  </div>
                )}
              </div>
            )}

            {method === 'MIXED' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Naqd miqdori (so'm)</Label>
                    <Input type="number" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} min="0" step="500" placeholder="0" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Karta miqdori (so'm)</Label>
                    <Input type="number" value={cardAmount} onChange={(e) => setCardAmount(e.target.value)} min="0" step="500" placeholder="0" className="h-9" />
                  </div>
                </div>
                {cashNum + cardNum > 0 && Math.abs(cashNum + cardNum - total) > 0.01 && (
                  <p className="text-xs text-amber-400">
                    Yig'indi: {formatCurrency(cashNum + cardNum)} · Farq: {formatCurrency(Math.abs(cashNum + cardNum - total))}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Izoh (ixtiyoriy)
              </Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="VIP chegirma, guruh bron…" className="h-9" />
            </div>
          </div>
        </ScrollArea>

        <div className="p-5 pt-3 border-t border-border flex gap-3 flex-shrink-0 bg-card">
          <Button variant="outline" onClick={onCancel} disabled={isPending} className="flex-none">
            Bekor qilish
          </Button>
          <Button onClick={() => mutate()} disabled={!canSubmit} className="flex-1" size="lg">
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Amalga oshirilmoqda…</>
            ) : (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> To'lovni yakunlash {formatCurrency(total)}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
