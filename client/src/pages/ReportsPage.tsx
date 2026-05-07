import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, DollarSign, Users, Activity, TrendingUp, Banknote, CreditCard, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatCurrency, formatDateTime, formatDuration } from '@/lib/utils';
import { reportsApi } from '@/api/reports';
import type { Session } from '@/types';

function StatCard({ label, value, icon: Icon, color = 'text-primary' }: { label: string; value: string; icon: any; color?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [page, setPage] = useState(1);

  const { data: today, isLoading: loadingToday, refetch: refetchToday } = useQuery({
    queryKey: ['reports-today'],
    queryFn: reportsApi.getToday,
    refetchInterval: 60_000,
  });

  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['reports-sessions', page],
    queryFn: () => reportsApi.getSessions(page),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Hisobotlar
        </h1>
        <Button variant="outline" size="sm" onClick={() => refetchToday()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Yangilash
        </Button>
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Bugun</TabsTrigger>
          <TabsTrigger value="history">Seans tarixi</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6 mt-4">
          {loadingToday ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : today ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Bugungi tushum" value={formatCurrency(today.totalRevenue)} icon={DollarSign} color="text-emerald-400" />
                <StatCard label="Bugungi seanslar" value={String(today.sessionCount)} icon={Activity} />
                <StatCard label="Faol stollar" value={String(today.activeTables)} icon={Users} color="text-amber-400" />
                <div className="bg-card rounded-xl border border-border p-5 space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">To'lov taqsimoti</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>Naqd: {formatCurrency(today.paymentBreakdown.cash)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span>Karta: {formatCurrency(today.paymentBreakdown.card)}</span>
                  </div>
                </div>
              </div>

              {today.topProducts.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Bugungi eng ko'p sotilgan mahsulotlar
                  </h2>
                  <div className="space-y-3">
                    {today.topProducts.map((p, i) => (
                      <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium">{p.name}</span>
                          <Badge variant="secondary" className="text-xs">{p.count}x</Badge>
                        </div>
                        <span className="text-sm font-semibold text-emerald-400">{formatCurrency(p.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <p className="text-sm font-semibold text-muted-foreground">
                {sessions?.total ?? 0} ta yakunlangan seans
              </p>
            </div>
            {loadingSessions ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {sessions?.data.map((s: Session) => (
                    <div key={s.id} className="px-4 py-3 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                          #{s.table?.number}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.table?.name}</p>
                          <p className="text-xs text-muted-foreground">{s.endTime ? formatDateTime(s.endTime) : '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-right">
                        <div>
                          <p className="text-muted-foreground">{formatDuration(s.totalMinutes ?? 0)}</p>
                        </div>
                        <div>
                          {s.payment ? (
                            <p className="font-semibold text-emerald-400">{formatCurrency(s.payment.totalCost)}</p>
                          ) : (
                            <Badge variant="warning">To'lanmagan</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {sessions && sessions.pages > 1 && (
                  <div className="p-4 flex items-center justify-between border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      Oldingi
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {sessions.pages} sahifa</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= sessions.pages}>
                      Keyingi
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
