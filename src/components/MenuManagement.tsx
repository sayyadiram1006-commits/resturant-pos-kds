import { useEffect, useState, useCallback } from 'react';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '@/lib/db';
import type { MenuItem } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { UtensilsCrossed, Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';

const DEFAULT_IMAGE = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [formData, setFormData] = useState({
    name: '', category: '', price: 0, description: '', image_url: '', is_available: true, prep_time_min: 10,
  });

  const loadData = useCallback(async () => {
    setItems(await getMenuItems());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  const filtered = categoryFilter === 'All' ? items : items.filter(i => i.category === categoryFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, image_url: formData.image_url || DEFAULT_IMAGE };
    if (editing) {
      await updateMenuItem(editing.id, data);
    } else {
      await addMenuItem(data);
    }
    setShowForm(false);
    setEditing(null);
    setFormData({ name: '', category: '', price: 0, description: '', image_url: '', is_available: true, prep_time_min: 10 });
    loadData();
  };

  const handleEdit = (item: MenuItem) => {
    setEditing(item);
    setFormData({
      name: item.name, category: item.category, price: item.price,
      description: item.description, image_url: item.image_url,
      is_available: item.is_available, prep_time_min: item.prep_time_min,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Remove this dish from the menu?')) {
      await deleteMenuItem(id);
      loadData();
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    await updateMenuItem(item.id, { is_available: !item.is_available });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="w-7 h-7 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Menu Management</h2>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ name: '', category: '', price: 0, description: '', image_url: '', is_available: true, prep_time_min: 10 });
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Dish
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
            <div className="relative h-36 overflow-hidden">
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-slate-700">
                {formatCurrency(item.price)}
              </span>
              {!item.is_available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-medium bg-red-600 px-3 py-1 rounded-full">Unavailable</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-700 truncate">{item.name}</p>
              <p className="text-xs text-slate-400 mb-1">{item.category} · {item.prep_time_min}min</p>
              <p className="text-xs text-slate-500 line-clamp-2 h-8">{item.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => toggleAvailability(item)}
                  className={`p-1.5 rounded-lg transition-colors ${item.is_available ? 'text-emerald-600 hover:bg-emerald-100' : 'text-slate-400 hover:bg-slate-100'}`}
                  title={item.is_available ? 'Hide from menu' : 'Show on menu'}
                >
                  {item.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Dish' : 'Add New Dish'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Dish Name</label>
                <input
                  type="text" required value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Category</label>
                  <input
                    type="text" required list="categories" value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <datalist id="categories">
                    {Array.from(new Set(items.map(i => i.category))).map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Price (₹)</label>
                  <input
                    type="number" required value={formData.price || ''}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
                <textarea
                  rows={2} value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Photo URL</label>
                <input
                  type="url" placeholder="Paste an image URL" value={formData.image_url}
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Prep Time (min)</label>
                  <input
                    type="number" required value={formData.prep_time_min}
                    onChange={e => setFormData({ ...formData, prep_time_min: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox" checked={formData.is_available}
                      onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-slate-600">Available</span>
                  </label>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors">
                {editing ? 'Update Dish' : 'Add Dish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
