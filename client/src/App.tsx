import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import { Skeleton } from './components/ui/skeleton';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'));
const PromotionsPage = lazy(() => import('./pages/PromotionsPage'));

function PageLoader() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster theme="dark" position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<PageLoader />}><UsersPage /></Suspense>} />
          <Route path="customers" element={<Suspense fallback={<PageLoader />}><CustomersPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
          <Route path="reservations" element={<Suspense fallback={<PageLoader />}><ReservationsPage /></Suspense>} />
          <Route path="promotions" element={<Suspense fallback={<PageLoader />}><PromotionsPage /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
