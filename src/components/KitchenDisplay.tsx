import { useEffect, useState, useCallback } from 'react';
import { getActiveOrders, updateOrderItemStatus, updateOrderStatus } from '@/lib/db';
import type { Order } from '@/lib/types';
import { formatCurrency, timeAgo } from '@/lib/format';
import { ChefHat, Check, Clock, Flame, Bell, RotateCcw } from 'lucide-react';

export function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadData = useCallback(async () => {
    setOrders(await getActiveOrders());
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleItemStatus = async (itemId: number, status: string) => {
    await updateOrderItemStatus(itemId, status);
    loadData();
  };

  const handleOrderServed = async (orderId: number) => {
    await updateOrderStatus(orderId, 'Served');
    loadData();
  };

  const pendingItems = orders.flatMap(o =>
    o.items.filter(i => i.status !== 'Ready' && i.status !== 'Served')
      .map(i => ({ ...i, table_no: o.table_no, order_id: o.id, created_at: o.created_at }))
  );
  const readyOrders = orders.filter(o => o.status === 'Ready');

  const statusColors: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Ready: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Served: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ChefHat className="w-7 h-7 text-amber-600" />
        <h2 className="text-2xl font-bold text-slate-800">Kitchen Display</h2>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
          {pendingItems.length} items in queue
        </span>
      </div>

      {pendingItems.length === 0 && readyOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Flame className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400 text-lg">Kitchen is clear — no pending orders</p>
        </div>
      ) : (
        <>
          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Cooking Queue
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <img src={item.item_image_url} alt={item.item_name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">#{item.order_id}</span>
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-medium">{item.table_no}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 truncate">{item.item_name}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity} · {timeAgo(item.created_at)}</p>
                      </div>
                    </div>
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full border mb-3 ${statusColors[item.status] || statusColors.Pending}`}>
                      {item.status}
                    </span>
                    <button
                      onClick={() => handleItemStatus(item.id, 'Ready')}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Mark Ready
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ready Orders */}
          {readyOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" /> Ready to Serve ({readyOrders.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {readyOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-4 animate-pulse"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{order.id}</span>
                        <span className="text-sm font-bold text-emerald-700">{order.table_no}</span>
                      </div>
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-sm text-slate-600">
                          <img src={item.item_image_url} alt="" className="w-6 h-6 rounded object-cover" />
                          <span>{item.quantity}x {item.item_name}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleOrderServed(order.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" /> Mark Served
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
