import { useEffect, useState, useCallback } from 'react';
import { getStats } from '@/lib/db';
import type { MenuItem } from '@/lib/types';
import { getMenuItems } from '@/lib/db';
import {
  ClipboardList, ChefHat, Receipt, Package, LayoutGrid,
  UtensilsCrossed, Table2, TrendingUp, Clock, AlertTriangle, DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    activeOrders: 0, pendingKitchen: 0, unpaidTotal: 0, lowStockCount: 0,
    todayRevenue: 0, totalTables: 0, occupiedTables: 0,
  });
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);

  const load = useCallback(async () => {
    setStats(await getStats());
    const items = await getMenuItems();
    setFeaturedItems(items.filter(i => i.is_available).slice(0, 6));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const statCards = [
    { label: 'Active Orders', value: stats.activeOrders, icon: ClipboardList, color: 'blue', page: 'orders' },
    { label: 'Kitchen Queue', value: stats.pendingKitchen, icon: ChefHat, color: 'amber', page: 'kitchen' },
    { label: 'Unpaid Bills', value: formatCurrency(stats.unpaidTotal), icon: Receipt, color: 'orange', page: 'billing' },
    { label: "Today's Revenue", value: formatCurrency(stats.todayRevenue), icon: TrendingUp, color: 'green', page: 'billing' },
    { label: 'Low Stock Items', value: stats.lowStockCount, icon: AlertTriangle, color: 'red', page: 'inventory' },
    { label: 'Tables Occupied', value: `${stats.occupiedTables}/${stats.totalTables}`, icon: Table2, color: 'slate', page: 'tables' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600 text-blue-50',
    amber: 'from-amber-500 to-amber-600 text-amber-50',
    orange: 'from-orange-500 to-orange-600 text-orange-50',
    green: 'from-emerald-500 to-emerald-600 text-emerald-50',
    red: 'from-red-500 to-red-600 text-red-50',
    slate: 'from-slate-600 to-slate-700 text-slate-50',
  };

  const quickActions = [
    { label: 'New Order', icon: ClipboardList, page: 'orders', desc: 'Take a new order' },
    { label: 'Kitchen', icon: ChefHat, page: 'kitchen', desc: 'View cooking queue' },
    { label: 'Billing', icon: Receipt, page: 'billing', desc: 'Settle bills' },
    { label: 'Inventory', icon: Package, page: 'inventory', desc: 'Stock levels' },
    { label: 'Menu', icon: UtensilsCrossed, page: 'menu', desc: 'Manage dishes' },
    { label: 'Tables', icon: Table2, page: 'tables', desc: 'Manage tables' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutGrid className="w-7 h-7 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <button
            key={card.label}
            onClick={() => onNavigate(card.page)}
            className={`bg-gradient-to-br ${colorMap[card.color]} rounded-xl p-4 text-left shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-200`}
          >
            <card.icon className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs opacity-80 mt-1">{card.label}</p>
          </button>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.page)}
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-center group"
            >
              <action.icon className="w-8 h-8 mx-auto mb-2 text-slate-500 group-hover:text-blue-600 transition-colors" />
              <p className="text-sm font-semibold text-slate-700">{action.label}</p>
              <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-3">Featured Dishes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 group">
              <div className="relative h-32 overflow-hidden">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-slate-700">
                  {formatCurrency(item.price)}
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-slate-700 truncate">{item.name}</p>
                <p className="text-xs text-slate-400">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
