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
  return new Date(date).toLocaleTimeString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
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

// Splits a time range at day/night boundaries — mirrors backend calcCostSplit exactly.
export function calcCostMs(
  startMs: number,
  endMs: number,
  dayRate: number,
  nightRate: number,
  dayStartHour = 6,
  nightStartHour = 18,
): number {
  let cost = 0;
  let current = startMs;
  while (current < endMs) {
    const d = new Date(current);
    const h = d.getHours();
    const isNight = h >= nightStartHour || h < dayStartHour;
    const rate = isNight ? nightRate : dayRate;
    const boundary = new Date(d);
    if (isNight) {
      if (h >= nightStartHour) {
        boundary.setDate(boundary.getDate() + 1);
        boundary.setHours(dayStartHour, 0, 0, 0);
      } else {
        boundary.setHours(dayStartHour, 0, 0, 0);
      }
    } else {
      boundary.setHours(nightStartHour, 0, 0, 0);
    }
    const segEnd = Math.min(boundary.getTime(), endMs);
    cost += ((segEnd - current) / 3600000) * rate;
    current = segEnd;
  }
  return Math.round(cost * 100) / 100;
}

export function parseTimeHour(hhmm: string): number {
  return parseInt(hhmm.split(':')[0], 10);
}
