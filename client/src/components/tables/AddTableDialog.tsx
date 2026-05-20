import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { tablesApi } from '@/api/tables';

export default function AddTableDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', number: '', hourlyPrice: '', nightPrice: '' });
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      tablesApi.create({
        name: form.name,
        number: parseInt(form.number),
        hourlyPrice: parseFloat(form.hourlyPrice),
        nightPrice: form.nightPrice ? parseFloat(form.nightPrice) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success("Stol qo'shildi");
      setOpen(false);
      setForm({ name: '', number: '', hourlyPrice: '', nightPrice: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Stolni qo'shib bo'lmadi"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Stol qo'shish
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi stol qo'shish</DialogTitle>
          <DialogDescription className="sr-only">Yangi stol ma'lumotlarini kiriting</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stol nomi</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Stol Alfa" />
            </div>
            <div className="space-y-2">
              <Label>Stol raqami</Label>
              <Input type="number" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} placeholder="1" min="1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kungi narx (so'm/soat)</Label>
              <Input type="number" value={form.hourlyPrice} onChange={(e) => setForm((f) => ({ ...f, hourlyPrice: e.target.value }))} placeholder="20000" min="0" step="500" />
            </div>
            <div className="space-y-2">
              <Label>
                Tungi narx (so'm/soat){' '}
                <span className="text-muted-foreground text-xs">ixtiyoriy</span>
              </Label>
              <Input type="number" value={form.nightPrice} onChange={(e) => setForm((f) => ({ ...f, nightPrice: e.target.value }))} placeholder="30000" min="0" step="500" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !form.name || !form.number || !form.hourlyPrice}
          >
            {isPending ? "Qo'shilmoqda..." : "Stol qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
