import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, BarChart3, Users, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { to: '/', label: 'Stollar', icon: LayoutDashboard, exact: true },
  { to: '/products', label: 'Mahsulotlar', icon: Package },
  { to: '/reports', label: 'Hisobotlar', icon: BarChart3 },
];

const adminItems = [
  { to: '/users', label: 'Foydalanuvchilar', icon: Users },
];

export default function Sidebar() {
  const isAdmin = useAuthStore((s) => s.isAdmin());

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-card border-r border-border">
      <div className="px-6 py-5 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Circle className="w-4 h-4 text-primary fill-primary" />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">Billiard Club</p>
          <p className="text-xs text-muted-foreground">Boshqaruv tizimi</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asosiy</p>
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="px-3 mt-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
            {adminItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                  )
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
