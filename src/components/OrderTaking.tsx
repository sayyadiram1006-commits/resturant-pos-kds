import { useEffect, useState, useCallback } from 'react';
import { getMenuItems, getTables, createOrder } from '@/lib/db';
import type { MenuItem, RestaurantTable } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { ClipboardList, Plus, Minus, ShoppingCart, Search, Check, User, Phone } from 'lucide-react';

export function OrderTaking() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [success, setSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setMenu(await getMenuItems());
    setTables(await getTables());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))];
  const filtered = menu.filter(m =>
    m.is_available &&
    (categoryFilter === 'All' || m.category === categoryFilter) &&
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev
      .map(c => c.item.id === id ? { ...c, quantity: c.quantity + delta } : c)
      .filter(c => c.quantity > 0));
  };

  const total = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const submitOrder = async () => {
    if (!selectedTable || cart.length === 0) return;
    await createOrder(
      selectedTable, customerName, customerPhone,
      cart.map(c => ({
        menu_item_id: c.item.id,
        item_name: c.item.name,
        item_image_url: c.item.image_url,
        quantity: c.quantity,
        price: c.item.price,
      }))
    );
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-7 h-7 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-800">New Order</h2>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <Check className="w-5 h-5 text-emerald-600" />
          <p className="text-emerald-700 font-medium">Order sent to kitchen successfully!</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Menu Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all text-left group"
              >
                <div className="relative h-28 overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <span className="absolute bottom-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                    {formatCurrency(item.price)}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-slate-700 truncate">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.category} · {item.prep_time_min}min</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart / Order Details */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Order Details
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Table</label>
              <select
                value={selectedTable}
                onChange={e => setSelectedTable(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select table...</option>
                {tables.map(t => (
                  <option key={t.id} value={t.name}>{t.name} (Seats {t.capacity})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Customer Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Optional"
                    className="w-full pl-8 pr-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Phone (for WhatsApp bill)</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Optional"
                    className="w-full pl-8 pr-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-700 mb-3">Cart ({cart.length})</h3>
            {cart.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Tap dishes to add them</p>
            ) : (
              <div className="space-y-2">
                {cart.map(c => (
                  <div key={c.item.id} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                    <img src={c.item.image_url} alt={c.item.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{c.item.name}</p>
                      <p className="text-xs text-slate-400">{formatCurrency(c.item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(c.item.id, -1)} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{c.quantity}</span>
                      <button onClick={() => updateQty(c.item.id, 1)} className="w-6 h-6 rounded bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {cart.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between mb-3">
                  <span className="text-slate-500 text-sm">Total</span>
                  <span className="font-bold text-lg text-slate-800">{formatCurrency(total)}</span>
                </div>
                <button
                  onClick={submitOrder}
                  disabled={!selectedTable}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Send to Kitchen
                </button>
                {!selectedTable && (
                  <p className="text-xs text-amber-600 mt-2 text-center">Select a table first</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
