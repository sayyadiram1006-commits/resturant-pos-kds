import { useState } from 'react';
import { useDB } from '@/hooks/useDB';
import { Dashboard } from '@/components/Dashboard';
import { OrderTaking } from '@/components/OrderTaking';
import { KitchenDisplay } from '@/components/KitchenDisplay';
import { Billing } from '@/components/Billing';
import { Inventory } from '@/components/Inventory';
import { MenuManagement } from '@/components/MenuManagement';
import { Tables } from '@/components/Tables';
import {
  LayoutGrid, ClipboardList, ChefHat, Receipt, Package,
  UtensilsCrossed, Table2, ChefHat as Logo, Loader2
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'orders', label: 'New Order', icon: ClipboardList },
  { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
  { id: 'billing', label: 'Billing', icon: Receipt },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'tables', label: 'Tables', icon: Table2 },
];

function App() {
  const ready = useDB();
  const [page, setPage] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Starting up your restaurant POS...</p>
        </div>
      </div>
    );
  }

  const navigate = (p: string) => {
    setPage(p);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={`
        ${mobileNavOpen ? 'fixed inset-0 z-40 flex' : 'hidden'}
        md:relative md:flex md:inset-auto
      `}>
        {mobileNavOpen && (
          <div className="absolute inset-0 bg-black/40 md:hidden" onClick={() => setMobileNavOpen(false)} />
        )}
        <nav className={`
          relative w-64 bg-slate-900 text-white flex flex-col h-screen md:h-auto md:sticky md:top-0
          ${mobileNavOpen ? 'animate-slide-in' : ''}
        `}>
          <div className="p-5 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Logo className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">RestoPOS</h1>
                <p className="text-xs text-slate-400">Local Network POS</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  page === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              LAN Active · Data stored locally
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Logo className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold">RestoPOS</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
        {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {page === 'orders' && <OrderTaking />}
        {page === 'kitchen' && <KitchenDisplay />}
        {page === 'billing' && <Billing />}
        {page === 'inventory' && <Inventory />}
        {page === 'menu' && <MenuManagement />}
        {page === 'tables' && <Tables />}
      </main>
    </div>
  );
}

export default App;
