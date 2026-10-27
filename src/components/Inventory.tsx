import { useEffect, useState, useCallback } from 'react';
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, restockInventory } from '@/lib/db';
import type { InventoryItem } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Package, Plus, Edit2, Trash2, AlertTriangle, PackagePlus, X, TrendingUp } from 'lucide-react';

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState(0);
  const [formData, setFormData] = useState({ item_name: '', stock: 0, unit: 'kg', min_stock: 0, cost_per_unit: 0 });

  const loadData = useCallback(async () => {
    setItems(await getInventory());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateInventoryItem(editing.id, formData);
    } else {
      await addInventoryItem(formData);
    }
    setShowForm(false);
    setEditing(null);
    setFormData({ item_name: '', stock: 0, unit: 'kg', min_stock: 0, cost_per_unit: 0 });
    loadData();
  };

  const handleEdit = (item: InventoryItem) => {
    setEditing(item);
    setFormData({ item_name: item.item_name, stock: item.stock, unit: item.unit, min_stock: item.min_stock, cost_per_unit: item.cost_per_unit });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Remove this inventory item?')) {
      await deleteInventoryItem(id);
      loadData();
    }
  };

  const handleRestock = async () => {
    if (restockItem && restockAmount > 0) {
      await restockInventory(restockItem.id, restockAmount);
      setRestockItem(null);
      setRestockAmount(0);
      loadData();
    }
  };

  const totalValue = items.reduce((sum, i) => sum + i.stock * i.cost_per_unit, 0);
  const lowStock = items.filter(i => i.stock <= i.min_stock);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-7 h-7 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Inventory</h2>
        </div>
        <button
          onClick={() => { setEditing(null); setFormData({ item_name: '', stock: 0, unit: 'kg', min_stock: 0, cost_per_unit: 0 }); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Total Items</p>
          <p className="text-2xl font-bold text-slate-800">{items.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Stock Value</p>
          <p className="text-2xl font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-5 h-5" /> {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Low Stock Alerts</p>
          <p className={`text-2xl font-bold flex items-center gap-1 ${lowStock.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            <AlertTriangle className="w-5 h-5" /> {lowStock.length}
          </p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="font-semibold text-red-700">Low Stock Warning</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(item => (
              <span key={item.id} className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full">
                {item.item_name} — {item.stock} {item.unit} left
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Item</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Stock</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Min Level</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Cost/Unit</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Value</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 ${item.stock <= item.min_stock ? 'bg-red-50/50' : ''}`}>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-slate-700">{item.item_name}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-medium ${item.stock <= item.min_stock ? 'text-red-600' : 'text-slate-700'}`}>
                    {item.stock} {item.unit}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-500">{item.min_stock} {item.unit}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-600">{formatCurrency(item.cost_per_unit)}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-slate-700">{formatCurrency(item.stock * item.cost_per_unit)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => { setRestockItem(item); setRestockAmount(0); }}
                      className="text-blue-600 hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                      title="Restock"
                    >
                      <PackagePlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Item' : 'Add Inventory Item'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text" placeholder="Item name" required value={formData.item_name}
                onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" placeholder="Stock" required value={formData.stock || ''}
                  onChange={e => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text" placeholder="Unit (kg, litres, etc.)" required value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" placeholder="Min stock alert level" value={formData.min_stock || ''}
                  onChange={e => setFormData({ ...formData, min_stock: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="number" placeholder="Cost per unit" value={formData.cost_per_unit || ''}
                  onChange={e => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors">
                {editing ? 'Update Item' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setRestockItem(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Restock {restockItem.item_name}</h3>
              <button onClick={() => setRestockItem(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-3">Current stock: {restockItem.stock} {restockItem.unit}</p>
            <input
              type="number" placeholder={`Amount to add (${restockItem.unit})`} value={restockAmount || ''}
              onChange={e => setRestockAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
            />
            <button onClick={handleRestock} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              <PackagePlus className="w-4 h-4" /> Confirm Restock
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
