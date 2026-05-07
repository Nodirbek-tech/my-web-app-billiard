import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users, Plus, Trash2, Shield, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usersApi } from '@/api/users';
import { useAuthStore } from '@/store/authStore';
import type { AuthUser } from '@/types';

export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'STAFF' });
  const { user: me } = useAuthStore();
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: () => usersApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Foydalanuvchi yaratildi');
      setOpen(false);
      setForm({ email: '', password: '', name: '', role: 'STAFF' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const { mutate: removeUser } = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success("Foydalanuvchi o'chirildi");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Foydalanuvchilar
        </h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Foydalanuvchi qo'shish
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((u: AuthUser) => (
              <div key={u.id} className="px-5 py-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                    {u.role === 'ADMIN' ? (
                      <Shield className="w-5 h-5 text-primary" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {u.role === 'ADMIN' ? 'Admin' : 'Xodim'}
                  </Badge>
                  {u.id !== me?.id && (
                    <button
                      onClick={() => removeUser(u.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Foydalanuvchi qo'shish</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>To'liq ism</Label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ism Familiya" />
            </div>
            <div className="space-y-2">
              <Label>Elektron pochta</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Parol</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Kamida 6 ta belgi" />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF">Xodim</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
            <Button onClick={() => createUser()} disabled={isPending || !form.name || !form.email || !form.password}>
              {isPending ? 'Yaratilmoqda...' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
