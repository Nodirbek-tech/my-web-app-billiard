import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { SessionOrder } from '@/types';
import { ordersApi } from '@/api/orders';

interface OrderListProps {
  orders: SessionOrder[];
  sessionActive?: boolean;
}

export default function OrderList({ orders, sessionActive = true }: OrderListProps) {
  const qc = useQueryClient();

  const { mutate: removeOrder } = useMutation({
    mutationFn: ordersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success("Mahsulot o'chirildi");
    },
    onError: () => toast.error("Mahsulotni o'chirib bo'lmadi"),
  });

  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Hali mahsulot qo'shilmagan</p>;
  }

  const total = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 text-sm">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
              {order.quantity}
            </span>
            <span className="font-medium">{order.product.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-foreground font-semibold">{formatCurrency(order.total)}</span>
            {sessionActive && (
              <button
                onClick={() => removeOrder(order.id)}
                className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2 border-t border-border text-sm font-semibold">
        <span className="text-muted-foreground">Mahsulotlar jami</span>
        <span className="text-foreground">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
