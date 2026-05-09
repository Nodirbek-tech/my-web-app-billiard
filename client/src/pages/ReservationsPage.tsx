import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarDays, Check, X, Clock, Users, Phone, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { reservationsApi } from '@/api/reservations';
import type { Reservation, ReservationStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'Kutilmoqda',
  CONFIRMED: 'Tasdiqlangan',
  CANCELLED: 'Bekor qilingan',
};

const STATUS_VARIANTS: Record<ReservationStatus, 'default' | 'secondary' | 'destructive'> = {
  PENDING: 'secondary',
  CONFIRMED: 'default',
  CANCELLED: 'destructive',
};

const TABS: { label: string; value: ReservationStatus | 'ALL' }[] = [
  { label: 'Barchasi', value: 'ALL' },
  { label: 'Kutilmoqda', value: 'PENDING' },
  { label: 'Tasdiqlangan', value: 'CONFIRMED' },
  { label: 'Bekor', value: 'CANCELLED' },
];

function ReservationCard({ r, onConfirm, onCancel, onDelete }: {
  r: Reservation;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const date = new Date(r.date);
  const dateStr = date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm">{r.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3" />
            {r.phone}
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[r.status]}>{STATUS_LABELS[r.status]}</Badge>
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5" />
          {dateStr}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {timeStr}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {r.peopleCount} kishi
        </span>
      </div>

      {r.note && (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">{r.note}</p>
      )}

      {r.customer && (
        <p className="text-xs text-primary flex items-center gap-1">
          Mijoz: {r.customer.name} ({r.customer.cardNumber})
          {r.customer.telegramId && (
            <span className="text-sky-400 font-medium ml-1">• TG</span>
          )}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        {r.status === 'PENDING' && (
          <>
            <Button size="sm" variant="default" className="flex-1 h-8" onClick={() => onConfirm(r.id)}>
              <Check className="w-3.5 h-3.5 mr-1" />
              Tasdiqlash
            </Button>
            <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => onCancel(r.id)}>
              <X className="w-3.5 h-3.5 mr-1" />
              Bekor
            </Button>
          </>
        )}
        <Button
          size="sm"
          variant="ghost"
          className={cn('h-8 px-2 text-muted-foreground hover:text-destructive', r.status === 'PENDING' ? '' : 'ml-auto')}
          onClick={() => onDelete(r.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const [tab, setTab] = useState<ReservationStatus | 'ALL'>('ALL');
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['reservations', tab],
    queryFn: () => reservationsApi.getAll(tab === 'ALL' ? undefined : tab),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ReservationStatus }) =>
      reservationsApi.updateStatus(id, status),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      const isActionableStatus =
        variables.status === 'CONFIRMED' || variables.status === 'CANCELLED';
      if (isActionableStatus) {
        if (data.customer?.telegramId) {
          toast.success('Bron holati yangilandi va mijozga xabar yuborildi');
        } else if (data.customer) {
          toast.success("Bron holati yangilandi, lekin mijoz Telegramga ulanmagan");
        } else {
          toast.success('Bron holati yangilandi');
        }
      } else {
        toast.success('Holat yangilandi');
      }
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => reservationsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Bron o\'chirildi');
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Bronlar</h1>
          <p className="text-xs text-muted-foreground">Telegram bot orqali kelgan so'rovlar</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              tab === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Bronlar yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((r) => (
            <ReservationCard
              key={r.id}
              r={r}
              onConfirm={(id) => updateStatus.mutate({ id, status: 'CONFIRMED' })}
              onCancel={(id) => updateStatus.mutate({ id, status: 'CANCELLED' })}
              onDelete={(id) => remove.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
