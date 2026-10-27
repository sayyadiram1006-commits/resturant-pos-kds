import { useEffect, useState, useCallback } from 'react';
import { getBillingGroups, payOrder } from '@/lib/db';
import type { BillingGroup } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Receipt, MessageCircle, Check, Printer, Phone } from 'lucide-react';

export function Billing() {
  const [bills, setBills] = useState<BillingGroup[]>([]);
  const [paidTable, setPaidTable] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setBills(await getBillingGroups());
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handlePay = async (orderId: number, tableNo: string) => {
    await payOrder(orderId);
    setPaidTable(tableNo);
    setTimeout(() => setPaidTable(null), 2500);
    loadData();
  };

  const sendWhatsApp = (bill: BillingGroup) => {
    let msg = `*${bill.table_no} - Bill Receipt*\n`;
    msg += `----------------------------\n`;
    bill.items.forEach(item => {
      msg += `${item.qty}x ${item.name} — ${formatCurrency(item.price)}\n`;
    });
    msg += `----------------------------\n`;
    msg += `*Total: ${formatCurrency(bill.total)}*\n`;
    msg += `\nThank you for dining with us!`;

    const phone = bill.customer_phone.replace(/[^0-9]/g, '');
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const printBill = (bill: BillingGroup) => {
    let html = `<html><head><title>Bill - ${bill.table_no}</title><style>`;
    html += `body{font-family:monospace;max-width:300px;margin:0 auto;padding:20px;}`;
    html += `h2{text-align:center;margin:0;}hr{border:none;border-top:1px dashed #999;}`;
    html += `table{width:100%;font-size:14px;}.total{font-size:18px;font-weight:bold;text-align:right;margin-top:10px;}`;
    html += `</style></head><body>`;
    html += `<h2>Restaurant Bill</h2><p style="text-align:center;">${bill.table_no}</p><hr>`;
    html += `<table>`;
    bill.items.forEach(item => {
      html += `<tr><td>${item.qty}x ${item.name}</td><td style="text-align:right;">${formatCurrency(item.price)}</td></tr>`;
    });
    html += `</table><hr><p class="total">Total: ${formatCurrency(bill.total)}</p>`;
    html += `<p style="text-align:center;font-size:12px;margin-top:20px;">Thank you for dining with us!</p>`;
    html += `</body></html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="w-7 h-7 text-orange-600" />
        <h2 className="text-2xl font-bold text-slate-800">Billing Desk</h2>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
          {bills.length} active tables
        </span>
      </div>

      {paidTable && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-600" />
          <p className="text-emerald-700 font-medium">Bill settled for {paidTable} — table is now available</p>
        </div>
      )}

      {bills.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400 text-lg">No unpaid tables</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map(bill => (
            <div key={bill.table_no} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{bill.table_no}</h3>
                    {bill.customer_name && <p className="text-xs opacity-90">{bill.customer_name}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(bill.total)}</p>
                    <p className="text-xs opacity-90">{bill.items.length} items</p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {bill.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <img src={item.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="flex-1 text-slate-600">{item.qty}x {item.name}</span>
                    <span className="font-medium text-slate-700">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 pt-0 space-y-2">
                <div className="flex justify-between font-bold text-lg border-t border-slate-100 pt-3">
                  <span className="text-slate-600">Total</span>
                  <span className="text-slate-800">{formatCurrency(bill.total)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => sendWhatsApp(bill)}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2.5 rounded-lg transition-colors flex flex-col items-center gap-1"
                    title="Share bill via WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => printBill(bill)}
                    className="bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium py-2.5 rounded-lg transition-colors flex flex-col items-center gap-1"
                    title="Print bill"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={() => handlePay(bill.order_id, bill.table_no)}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium py-2.5 rounded-lg transition-colors flex flex-col items-center gap-1"
                    title="Settle bill"
                  >
                    <Check className="w-4 h-4" />
                    Pay
                  </button>
                </div>

                {bill.customer_phone && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" /> {bill.customer_phone}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
