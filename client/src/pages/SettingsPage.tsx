import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Settings, Save, Percent, Sun, Moon, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { settingsApi, type UpdateSettingsPayload } from '@/api/settings';
import type { BusinessSettings } from '@/types';

function usePricingForm(settings: BusinessSettings | undefined) {
  const [cashback, setCashback] = useState('');
  const [dayPrice, setDayPrice] = useState('');
  const [nightPrice, setNightPrice] = useState('');
  const [dayStart, setDayStart] = useState('');
  const [nightStart, setNightStart] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    if (!settings) return;
    setCashback(String(settings.cashbackPercent));
    setDayPrice(String(settings.dayHourlyPrice));
    setNightPrice(String(settings.nightHourlyPrice));
    setDayStart(settings.dayStartTime);
    setNightStart(settings.nightStartTime);
    setAddress(settings.address ?? '');
    setContactPhone(settings.contactPhone ?? '');
  }, [settings]);

  const cashbackNum = parseFloat(cashback) || 0;
  const dayPriceNum = parseFloat(dayPrice) || 0;
  const nightPriceNum = parseFloat(nightPrice) || 0;
  const timePattern = /^\d{2}:\d{2}$/;
  const isValid =
    cashbackNum >= 0 && cashbackNum <= 100 &&
    dayPriceNum >= 0 &&
    nightPriceNum >= 0 &&
    timePattern.test(dayStart) &&
    timePattern.test(nightStart);

  const payload: UpdateSettingsPayload = {
    cashbackPercent: cashbackNum,
    dayHourlyPrice: dayPriceNum,
    nightHourlyPrice: nightPriceNum,
    dayStartTime: dayStart,
    nightStartTime: nightStart,
    address: address || undefined,
    contactPhone: contactPhone || undefined,
  };

  return {
    cashback, setCashback,
    dayPrice, setDayPrice,
    nightPrice, setNightPrice,
    dayStart, setDayStart,
    nightStart, setNightStart,
    address, setAddress,
    contactPhone, setContactPhone,
    isValid, payload,
  };
}

export default function SettingsPage() {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const form = usePricingForm(settings);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => settingsApi.update(form.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Sozlamalar saqlandi');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Xatolik'),
  });

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Sozlamalar</h1>
          <p className="text-xs text-muted-foreground">Biznes konfiguratsiyasi</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pricing section */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <p className="font-semibold text-sm">Narx sozlamalari</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Kunduzgi narx (so'm/soat)
                </Label>
                <Input
                  type="number"
                  value={form.dayPrice}
                  onChange={(e) => form.setDayPrice(e.target.value)}
                  min="0"
                  step="1000"
                  placeholder="40000"
                />
                <p className="text-xs text-muted-foreground">
                  {form.dayStart} – {form.nightStart}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  Tungi narx (so'm/soat)
                </Label>
                <Input
                  type="number"
                  value={form.nightPrice}
                  onChange={(e) => form.setNightPrice(e.target.value)}
                  min="0"
                  step="1000"
                  placeholder="50000"
                />
                <p className="text-xs text-muted-foreground">
                  {form.nightStart} – {form.dayStart}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Kun boshlanish vaqti
                </Label>
                <Input
                  type="time"
                  value={form.dayStart}
                  onChange={(e) => form.setDayStart(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  Tun boshlanish vaqti
                </Label>
                <Input
                  type="time"
                  value={form.nightStart}
                  onChange={(e) => form.setNightStart(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Cashback section */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <p className="font-semibold text-sm">Bonus tizimi</p>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" />
                Cashback foizi (%)
              </Label>
              <Input
                type="number"
                value={form.cashback}
                onChange={(e) => form.setCashback(e.target.value)}
                min="0"
                max="100"
                step="0.5"
                placeholder="5"
                className="max-w-[140px]"
              />
              {form.payload.cashbackPercent && form.payload.cashbackPercent > 0 && (
                <p className="text-xs text-muted-foreground">
                  Har 10 000 so'm to'lovdan{' '}
                  {Math.round(10000 * (form.payload.cashbackPercent ?? 0)) / 100} so'm bonus
                </p>
              )}
            </div>
          </div>

          {/* Contact info section */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <p className="font-semibold text-sm">Aloqa ma'lumotlari (bot uchun)</p>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                Manzil
              </Label>
              <Input
                value={form.address}
                onChange={(e) => form.setAddress(e.target.value)}
                placeholder="Shahar, ko'cha, uy"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                Telefon raqami
              </Label>
              <Input
                value={form.contactPhone}
                onChange={(e) => form.setContactPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
              />
            </div>
          </div>

          {!form.isValid && (
            <p className="text-xs text-destructive px-1">Barcha maydonlar to'g'ri to'ldirilishi kerak</p>
          )}

          <Button
            onClick={() => save()}
            disabled={isPending || !form.isValid}
            className="w-full"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            {isPending ? 'Saqlanmoqda…' : 'Saqlash'}
          </Button>
        </div>
      )}
    </div>
  );
}
