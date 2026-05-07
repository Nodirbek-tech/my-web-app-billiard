import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('ru-RU')} so'm`;
}

export function formatDuration(minutes: number): string {
  if (!minutes) return '0 daqiqa';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} daqiqa`;
  if (m === 0) return `${h} soat`;
  return `${h} soat ${m} daqiqa`;
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const HH = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${MM}.${yyyy} ${HH}:${mm}`;
}

export function padTwo(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatTimer(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${padTwo(h)}:${padTwo(m)}:${padTwo(s)}`;
  return `${padTwo(m)}:${padTwo(s)}`;
}

export function calcLiveCost(startTime: string, hourlyPrice: number, nightPrice?: number | null): number {
  const ms = Date.now() - new Date(startTime).getTime();
  const hours = ms / 3600000;
  const h = new Date(startTime).getHours();
  const isNight = h >= 18 || h < 6;
  const rate = nightPrice && isNight ? nightPrice : hourlyPrice;
  return Math.round(hours * rate * 100) / 100;
}
