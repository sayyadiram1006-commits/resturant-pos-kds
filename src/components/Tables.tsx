import { useEffect, useState, useCallback } from 'react';
import { getTables, addTable, updateTable, deleteTable } from '@/lib/db';
import type { RestaurantTable } from '@/lib/types';
import { Table2, Plus, Edit2, Trash2, X, Users } from 'lucide-react';

export function Tables() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RestaurantTable | null>(null);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(4);

  const loadData = useCallback(async () => {
    setTables(await getTables());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateTable(editing.id, name, capacity);
    } else {
      await addTable(name, capacity);
    }
    setShowForm(false);
    setEditing(null);
    setName('');
    setCapacity(4);
    loadData();
  };

  const handleEdit = (t: RestaurantTable) => {
    setEditing(t);
    setName(t.name);
    setCapacity(t.capacity);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Remove this table?')) {
      await deleteTable(id);
      loadData();
    }
  };

  const statusColors: Record<string, string> = {
    Available: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    Occupied: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  const available = tables.filter(t => t.status === 'Available').length;
  const occupied = tables.filter(t => t.status === 'Occupied').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Table2 className="w-7 h-7 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Tables</h2>
          <span className="text-sm text-slate-500">
            {available} available · {occupied} occupied
          </span>
        </div>
        <button
          onClick={() => { setEditing(null); setName(''); setCapacity(4); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Table
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map(table => (
          <div
            key={table.id}
            className={`rounded-xl border-2 p-4 text-center transition-all hover:shadow-md ${statusColors[table.status] || 'bg-slate-50 border-slate-200'}`}
          >
            <Table2 className="w-8 h-8 mx-auto mb-2 opacity-70" />
            <p className="text-sm font-bold">{table.name}</p>
            <p className="text-xs mt-1 flex items-center justify-center gap-1 opacity-80">
              <Users className="w-3 h-3" /> {table.capacity} seats
            </p>
            <p className="text-xs font-medium mt-2 px-2 py-0.5 rounded-full inline-block">
              {table.status}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                onClick={() => handleEdit(table)}
                className="p-1.5 rounded-lg bg-white/60 hover:bg-white transition-colors"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(table.id)}
                className="p-1.5 rounded-lg bg-white/60 hover:bg-white transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Table' : 'Add Table'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Table Name / Number</label>
                <input
                  type="text" required placeholder="e.g. Table 7" value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Seating Capacity</label>
                <input
                  type="number" required min={1} value={capacity}
                  onChange={e => setCapacity(parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors">
                {editing ? 'Update Table' : 'Add Table'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
