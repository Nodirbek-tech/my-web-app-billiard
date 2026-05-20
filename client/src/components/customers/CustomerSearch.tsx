import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, UserPlus, X, CreditCard, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { customersApi } from '@/api/customers';
import { sessionsApi } from '@/api/sessions';
import type { Customer } from '@/types';

interface CustomerSearchProps {
  sessionId: number;
  attachedCustomer?: Customer | null;
  open: boolean;
  onClose: () => void;
}

export default function CustomerSearch({ sessionId, attachedCustomer, open, onClose }: CustomerSearchProps) {
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['customers', 'search', search],
    queryFn: () => customersApi.findAll(search || undefined),
    enabled: open,
    staleTime: 10000,
  });

  const { mutate: attach, isPending } = useMutation({
    mutationFn: (customerId: number | null) => sessionsApi.attachCustomer(sessionId, customerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mijoz biriktirildi');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Xatolik yuz berdi'),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="p-4 pb-3 border-b border-border flex-shrink-0">
          <DialogTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Mijoz biriktirish
          </DialogTitle>
          <DialogDescription className="sr-only">Mijozni ism, telefon yoki karta raqami bo'yicha qidiring</DialogDescription>
        </DialogHeader>

        <div className="p-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, telefon yoki karta raqami…"
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {attachedCustomer && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-primary">{attachedCustomer.name}</p>
                  <p className="text-xs text-muted-foreground">{attachedCustomer.cardNumber} · {attachedCustomer.phone}</p>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    Bonus: {formatCurrency(attachedCustomer.bonusBalance)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => attach(null)}
                  disabled={isPending}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Qidirilmoqda…</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {search ? 'Mijoz topilmadi' : 'Qidirish uchun yozing'}
            </p>
          ) : (
            results.map((c: Customer) => (
              <button
                key={c.id}
                onClick={() => attach(c.id)}
                disabled={isPending || c.id === attachedCustomer?.id}
                className="w-full text-left rounded-lg border border-border hover:border-primary/50 hover:bg-accent p-3 text-sm transition-colors disabled:opacity-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      <CreditCard className="w-3 h-3" />
                      {c.cardNumber}
                      <span>·</span>
                      {c.phone}
                    </p>
                  </div>
                  {c.bonusBalance > 0 && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3" />
                      {formatCurrency(c.bonusBalance)}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
