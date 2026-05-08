import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserCheck, Plus, Search, CreditCard, Star, Trash2, Phone, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { customersApi, type CreateCustomerPayload } from '@/api/customers';
import type { Customer, CustomerVisit } from '@/types';

function CustomerProfileDialog({ customerId, onClose }: { customerId: number; onClose: () => void }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['customers', customerId],
    queryFn: () => customersApi.findOne(customerId),
  });

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: () => customersApi.remove(customerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      toast.success("Mijoz o'chirildi");
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Xatolik'),
  });

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-4 pb-3 border-b border-border flex-shrink-0">
          <DialogTitle className="text-base flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Mijoz profili
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : data ? (
          <>
            <div className="p-4 space-y-3 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">{data.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5" /> {data.phone}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <CreditCard className="w-3.5 h-3.5" /> {data.cardNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Bonus balansi</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(data.bonusBalance)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {data._count?.visits ?? 0} ta tashrif
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Ro'yxatga olingan: {formatDateTime(data.createdAt)}
              </div>
            </div>

            <Separator />

            <div className="flex-shrink-0 px-4 pt-3 pb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                So'nggi tashriflar
              </p>
            </div>

            <ScrollArea className="flex-1 px-4 pb-4">
              {(data.visits as CustomerVisit[]).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Tashriflar yo'q</p>
              ) : (
                <div className="space-y-2 pt-2">
                  {(data.visits as CustomerVisit[]).map((v) => (
                    <div key={v.id} className="rounded-lg border border-border bg-secondary/20 p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs">
                          {v.session?.table?.name ?? 'Stol'} · {v.session ? formatDateTime(v.session.startTime) : ''}
                        </span>
                        <span className="font-bold">{formatCurrency(v.totalCost)}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>O'yin: {formatCurrency(v.playCost)}</span>
                        {v.orderCost > 0 && <span>Mahsulot: {formatCurrency(v.orderCost)}</span>}
                        {v.bonusEarned > 0 && <span className="text-emerald-400">+{formatCurrency(v.bonusEarned)} bonus</span>}
                        {v.bonusRedeemed > 0 && <span className="text-amber-400">-{formatCurrency(v.bonusRedeemed)} bonus</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-4 pt-3 border-t border-border flex gap-2 flex-shrink-0">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => remove()}
                disabled={isRemoving}
                className="flex-none"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                O'chirish
              </Button>
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Yopish
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AddCustomerDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<CreateCustomerPayload>({ name: '', phone: '' });

  const { mutate, isPending } = useMutation({
    mutationFn: () => customersApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      toast.success("Mijoz qo'shildi");
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Xatolik'),
  });

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yangi mijoz
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Ism va familiya</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Alisher Toshmatov"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Telefon raqami</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+998901234567"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Bekor qilish</Button>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !form.name.trim() || !form.phone.trim()}
          >
            {isPending ? 'Saqlanmoqda…' : "Qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customersApi.findAll(search || undefined),
    staleTime: 15000,
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Mijozlar</h1>
            <p className="text-xs text-muted-foreground">
              {customers.length} ta mijoz
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yangi mijoz
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism, telefon yoki karta…"
          className="pl-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <UserCheck className="w-10 h-10 opacity-20" />
          <p className="text-sm">{search ? 'Mijoz topilmadi' : "Hali mijozlar yo'q"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {customers.map((c: Customer) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="text-left rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/30 p-4 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    {c.phone}
                  </p>
                </div>
                {c.bonusBalance > 0 && (
                  <Badge variant="secondary" className="flex-shrink-0 ml-2 text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                    <Star className="w-3 h-3 mr-1" />
                    {formatCurrency(c.bonusBalance)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CreditCard className="w-3 h-3" />
                {c.cardNumber}
              </div>
              <div className="text-xs text-muted-foreground">
                {c._count?.visits ?? 0} ta tashrif
              </div>
            </button>
          ))}
        </div>
      )}

      {showAdd && <AddCustomerDialog onClose={() => setShowAdd(false)} />}
      {selectedId !== null && (
        <CustomerProfileDialog
          customerId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
