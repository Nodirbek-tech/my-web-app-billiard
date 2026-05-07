import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@billiard.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      setAuth(token, user);
      navigate('/');
    } catch {
      toast.error("Email yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Circle className="w-6 h-6 text-primary fill-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Billiard Club</h1>
              <p className="text-sm text-muted-foreground">Boshqaruv tizimi</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tizimga kirish</CardTitle>
            <CardDescription>Tizimga kirish uchun ma'lumotlaringizni kiriting</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Elektron pochta</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@billiard.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Parol</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Kirish
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
