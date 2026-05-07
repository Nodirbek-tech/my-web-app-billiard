// Thermal receipt formatting — 80mm paper, ~42 chars per line

export const LINE_WIDTH = 42;

export function repeatChar(char: string, n: number): string {
  return n > 0 ? char.repeat(n) : '';
}

export function divider(char = '-'): string {
  return repeatChar(char, LINE_WIDTH);
}

export function padLine(left: string, right: string, width = LINE_WIDTH): string {
  const gap = width - left.length - right.length;
  if (gap <= 0) return `${left} ${right}`;
  return left + repeatChar(' ', gap) + right;
}

export function dotLine(left: string, right: string, width = LINE_WIDTH): string {
  const gap = width - left.length - right.length;
  if (gap <= 2) return `${left} ${right}`;
  return left + ' ' + repeatChar('.', gap - 2) + ' ' + right;
}

export function center(text: string, width = LINE_WIDTH): string {
  const pad = Math.max(0, Math.floor((width - text.length) / 2));
  return repeatChar(' ', pad) + text;
}

export function formatMoney(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('ru-RU')} so'm`;
}

export function receiptDateTime(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const HH = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${dd}.${MM}.${yyyy} ${HH}:${mm}:${ss}`;
}

export function receiptTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function durationStr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} daq`;
  if (m === 0) return `${h} soat`;
  return `${h} soat ${m} daq`;
}
