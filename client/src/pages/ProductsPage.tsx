import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Package, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { productsApi } from '@/api/products';
import type { Category, Product } from '@/types';

function AddProductDialog({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', categoryId: '', stock: '' });
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      productsApi.create({
        name: form.name,
        price: parseFloat(form.price),
        categoryId: parseInt(form.categoryId),
        stock: form.stock ? parseInt(form.stock) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Mahsulot qo'shildi");
      setOpen(false);
      setForm({ name: '', price: '', categoryId: '', stock: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" /> Mahsulot qo'shish
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mahsulot qo'shish</DialogTitle>
          <DialogDescription className="sr-only">Mahsulot nomi, narxi va kategoriyasini kiriting</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Mahsulot nomi</Label>
            <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Cola" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Narx (so'm)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} placeholder="5000" min="0" step="500" />
            </div>
            <div className="space-y-2">
              <Label>Zaxira (ixtiyoriy)</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="100" min="0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Kategoriya</Label>
            <Select value={form.categoryId} onValueChange={(v) => setForm(f => ({ ...f, categoryId: v }))}>
              <SelectTrigger><SelectValue placeholder="Kategoriyani tanlang" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
          <Button onClick={() => mutate()} disabled={isPending || !form.name || !form.price || !form.categoryId}>
            {isPending ? "Qo'shilmoqda..." : "Mahsulot qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => productsApi.createCategory(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Kategoriya qo'shildi");
      setOpen(false);
      setName('');
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" /> Kategoriya qo'shish
      </Button>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Kategoriya qo'shish</DialogTitle>
          <DialogDescription className="sr-only">Yangi kategoriya nomini kiriting</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Kategoriya nomi</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ichimliklar" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
          <Button onClick={() => mutate()} disabled={isPending || !name}>
            {isPending ? "Qo'shilmoqda..." : "Qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductsPage() {
  const qc = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
  });

  const { mutate: removeProduct } = useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Mahsulot o'chirildi");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" /> Mahsulotlar va menyu
        </h1>
        <div className="flex gap-2">
          <AddCategoryDialog />
          <AddProductDialog categories={categories} />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Package className="w-12 h-12 mb-3 opacity-30" />
          <p>Hali kategoriya yo'q. Avval kategoriya qo'shing.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat: Category) => (
            <div key={cat.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">{cat.name}</h2>
                <Badge variant="secondary">{cat.products?.length ?? 0} ta mahsulot</Badge>
              </div>
              {!cat.products?.length ? (
                <p className="text-sm text-muted-foreground">Bu kategoriyada mahsulot yo'q</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cat.products.map((p: Product) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-primary text-sm font-semibold">{formatCurrency(p.price)}</p>
                        {p.stock !== null && p.stock !== undefined && (
                          <p className="text-xs text-muted-foreground">Zaxira: {p.stock}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
