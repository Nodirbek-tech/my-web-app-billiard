import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import { productsApi } from '@/api/products';
import { ordersApi } from '@/api/orders';
import type { Product } from '@/types';

interface AddOrderDialogProps {
  sessionId: number;
}

export default function AddOrderDialog({ sessionId }: AddOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const qc = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
    staleTime: 60_000,
  });

  const currentCategory = activeCategory ?? categories[0]?.id ?? null;
  const products = categories.find((c) => c.id === currentCategory)?.products ?? [];

  const totalItems = Object.values(cart).reduce((s, q) => s + q, 0);

  const adjust = (productId: number, delta: number) => {
    setCart((prev) => {
      const next = { ...prev, [productId]: Math.max(0, (prev[productId] ?? 0) + delta) };
      if (next[productId] === 0) delete next[productId];
      return next;
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const entries = Object.entries(cart);
      for (const [productId, qty] of entries) {
        await ordersApi.add(sessionId, parseInt(productId), qty);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success("Mahsulotlar seansga qo'shildi");
      setCart({});
      setOpen(false);
    },
    onError: () => toast.error("Mahsulotlarni qo'shib bo'lmadi"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buyurtma qo'shish
          {totalItems > 0 && <Badge className="ml-2 h-5 px-1.5">{totalItems}</Badge>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seansga mahsulot qo'shish</DialogTitle>
          <DialogDescription className="sr-only">Seansga qo'shish uchun mahsulotlarni tanlang</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                (activeCategory ?? categories[0]?.id) === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <ScrollArea className="h-72">
          <div className="grid grid-cols-2 gap-3 pr-3">
            {products.map((product: Product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30"
              >
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-primary">{formatCurrency(product.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjust(product.id, -1)}
                    className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30"
                    disabled={!cart[product.id]}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold tabular-nums">
                    {cart[product.id] ?? 0}
                  </span>
                  <button
                    onClick={() => adjust(product.id, 1)}
                    className="w-7 h-7 rounded-md bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {totalItems > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">{totalItems} ta mahsulot tanlangan</span>
            <Button onClick={() => mutate()} disabled={isPending}>
              {isPending ? "Qo'shilmoqda..." : "Seansga qo'shish"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
