import { useEffect, useMemo } from 'react';
import { X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUiStore } from '@/store/uiStore';
import { BUSINESS } from '@/lib/config';
import {
  divider, padLine, dotLine, center,
  formatMoney, receiptDateTime, receiptTime, durationStr,
} from '@/lib/receipt';
import type { ReceiptData } from '@/types';

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Naqd',
  CARD: 'Karta',
  MIXED: 'Aralash',
};

function buildLines(r: ReceiptData): string[] {
  const L: string[] = [];

  L.push(divider('='));
  L.push(center(BUSINESS.name));
  if (BUSINESS.branch)  L.push(center(BUSINESS.branch));
  if (BUSINESS.address) L.push(center(BUSINESS.address));
  if (BUSINESS.phone)   L.push(center(BUSINESS.phone));
  L.push(divider('='));

  L.push(padLine('Chek raqami:', r.receiptNumber));
  L.push(padLine('Sana:', receiptDateTime(r.paidAt)));
  L.push(padLine('Kassir:', r.cashierName || 'Xodim'));

  L.push(divider());
  L.push(padLine(`Stol #${r.tableNumber}`, r.tableName));
  L.push(padLine('Boshlanish:', receiptTime(r.startTime)));
  L.push(padLine('Yakunlash:', receiptTime(r.endTime)));
  L.push(padLine('Davomiylik:', durationStr(r.totalMinutes)));

  // Rounds
  L.push(divider());
  L.push("O'YIN VAQTI");
  for (const round of r.rounds) {
    const label = `  R${round.roundNum} ${receiptTime(round.startTime)}-${receiptTime(round.endTime)} (${round.minutes} daq)`;
    L.push(dotLine(label, formatMoney(round.cost)));
  }
  L.push(padLine("  O'yin jami", formatMoney(r.playCost)));

  // Items
  if (r.orders.length > 0) {
    L.push(divider());
    L.push('MAHSULOTLAR');
    for (const o of r.orders) {
      const label = `  ${o.name} x${o.quantity}`;
      L.push(dotLine(label, formatMoney(o.total)));
    }
    L.push(padLine('  Mahsulotlar jami', formatMoney(r.orderCost)));
  }

  // Customer info
  if (r.customerName) {
    L.push(divider());
    L.push(padLine('Mijoz:', r.customerName));
    if (r.customerCard) L.push(padLine('Karta:', r.customerCard));
  }

  // Billing breakdown
  L.push(divider());
  L.push(dotLine("O'yin", formatMoney(r.playCost)));
  if (r.orderCost > 0)   L.push(dotLine('Mahsulotlar', formatMoney(r.orderCost)));
  if (r.serviceFee > 0)  L.push(dotLine('Xizmat haqi', `+${formatMoney(r.serviceFee)}`));
  if (r.discount > 0)    L.push(dotLine('Chegirma', `-${formatMoney(r.discount)}`));
  if ((r.bonusRedeemed ?? 0) > 0) L.push(dotLine('Bonus ishlatildi', `-${formatMoney(r.bonusRedeemed!)}`));
  L.push(divider('='));
  L.push(padLine('JAMI', formatMoney(r.totalCost)));
  L.push(divider('='));

  // Payment details
  L.push(padLine("To'lov turi:", METHOD_LABELS[r.method] ?? r.method));
  if ((r.method === 'CASH' || r.method === 'MIXED') && r.cashAmount != null)
    L.push(dotLine('  Naqd qabul qilindi', formatMoney(r.cashAmount)));
  if ((r.method === 'CARD' || r.method === 'MIXED') && r.cardAmount != null)
    L.push(dotLine('  Karta', formatMoney(r.cardAmount)));
  if (r.change != null && r.change > 0)
    L.push(dotLine('  Qaytim', formatMoney(r.change)));

  // Bonus earned
  if ((r.bonusEarned ?? 0) > 0) {
    L.push(divider());
    L.push(dotLine('Bonus yig\'ildi', `+${formatMoney(r.bonusEarned!)}`));
    if (r.bonusBalance != null) L.push(dotLine('Bonus balansi', formatMoney(r.bonusBalance)));
  }

  if (r.notes) {
    L.push(divider());
    L.push(`Izoh: ${r.notes}`);
  }

  L.push(divider());
  for (const line of BUSINESS.footer.split('\n')) L.push(center(line));
  L.push(divider('='));

  return L;
}

export default function ReceiptModal() {
  const { receiptData, setReceiptData } = useUiStore();

  const lines = useMemo(() => (receiptData ? buildLines(receiptData) : []), [receiptData]);
  const receiptText = lines.join('\n');

  useEffect(() => {
    if (receiptData) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [receiptData]);

  const handleClose = () => setReceiptData(null);

  return (
    <>
      <Dialog open={!!receiptData} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="p-4 pb-3 border-b border-border flex-shrink-0">
            <DialogTitle className="text-base">Chek {receiptData?.receiptNumber}</DialogTitle>
            <DialogDescription className="sr-only">To'lov cheki tafsilotlari</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <pre className="font-mono text-[11px] leading-[1.45] rounded-lg p-3 whitespace-pre overflow-x-auto" style={{ background: '#ffffff', color: '#000000', border: '1px solid #d1d5db' }}>
                {receiptText}
              </pre>
            </div>
          </ScrollArea>

          <div className="p-4 pt-3 border-t border-border flex gap-2 flex-shrink-0 bg-card">
            <Button variant="outline" className="flex-none" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" /> Yopish
            </Button>
            <Button className="flex-1" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" /> Chop etish
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {receiptData && (
        <div
          id="receipt-print-area"
          style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '80mm' }}
          aria-hidden="true"
        >
          <pre style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '11px',
            lineHeight: '1.4',
            color: '#000',
            background: '#fff',
            margin: 0,
            padding: '2mm',
            whiteSpace: 'pre',
          }}>
            {receiptText}
          </pre>
        </div>
      )}
    </>
  );
}
