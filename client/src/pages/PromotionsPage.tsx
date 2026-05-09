import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Megaphone, Plus, Send, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { promotionsApi, type CreatePromotionPayload } from '@/api/promotions';
import type { Promotion } from '@/types';
import { cn } from '@/lib/utils';

function PromotionCard({ p, onToggle, onBroadcast, onDelete }: {
  p: Promotion;
  onToggle: (id: number, active: boolean) => void;
  onBroadcast: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const sentCount = p._count?.sendLogs ?? 0;

  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 space-y-3 transition-opacity',
      !p.active && 'opacity-60',
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{p.title}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.message}</p>
        </div>
        <button
          onClick={() => onToggle(p.id, !p.active)}
          className="flex-shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
          title={p.active ? 'O\'chirish' : 'Yoqish'}
        >
          {p.active
            ? <ToggleRight className="w-6 h-6 text-primary" />
            : <ToggleLeft className="w-6 h-6" />
          }
        </button>
      </div>

      {sentCount > 0 && (
        <p className="text-xs text-muted-foreground">
          Jami yuborilgan: {sentCount} ta foydalanuvchi
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant="default"
          className="flex-1 h-8"
          onClick={() => onBroadcast(p.id)}
          disabled={!p.active}
        >
          <Send className="w-3.5 h-3.5 mr-1" />
          Yuborish
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(p.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function CreateForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const qc = useQueryClient();

  const { mutate: create, isPending } = useMutation({
    mutationFn: (payload: CreatePromotionPayload) => promotionsApi.create(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['promotions'] });
      toast.success(
        data.active
          ? 'Aksiya yaratildi va mijozlarga yuborildi'
          : 'Aksiya yaratildi',
      );
      onClose();
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    create({ title: title.trim(), message: message.trim(), active: true });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-primary/30 bg-card p-5 space-y-4">
      <p className="font-semibold text-sm">Yangi aksiya yaratish</p>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Sarlavha</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Aksiya nomi"
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Xabar matni</Label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Foydalanuvchilarga yuboriladigan xabar..."
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-ring"
          maxLength={1000}
          required
        />
        <p className="text-xs text-muted-foreground text-right">{message.length}/1000</p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending || !title.trim() || !message.trim()}>
          {isPending ? 'Saqlanmoqda…' : 'Yaratish'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          Bekor
        </Button>
      </div>
    </form>
  );
}

export default function PromotionsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: promotionsApi.getAll,
  });

  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      promotionsApi.toggle(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  const broadcast = useMutation({
    mutationFn: (id: number) => promotionsApi.broadcast(id),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['promotions'] });
      toast.success(`Xabar ${result.sent} ta foydalanuvchiga yuborildi`);
    },
    onError: () => toast.error('Yuborishda xatolik'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => promotionsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Aksiya o\'chirildi');
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Aksiyalar</h1>
            <p className="text-xs text-muted-foreground">Telegram bot orqali broadcast</p>
          </div>
        </div>
        {!showCreate && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Yaratish
          </Button>
        )}
      </div>

      {showCreate && (
        <>
          <CreateForm onClose={() => setShowCreate(false)} />
          <Separator />
        </>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aksiyalar yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((p: Promotion) => (
            <PromotionCard
              key={p.id}
              p={p}
              onToggle={(id, active) => toggle.mutate({ id, active })}
              onBroadcast={(id) => broadcast.mutate(id)}
              onDelete={(id) => remove.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
