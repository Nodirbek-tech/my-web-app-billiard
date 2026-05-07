import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 bg-card border-b border-border">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{user?.name}</span>
          <Badge variant={user?.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
            {user?.role === 'ADMIN' ? 'Admin' : 'Xodim'}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Chiqish">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
