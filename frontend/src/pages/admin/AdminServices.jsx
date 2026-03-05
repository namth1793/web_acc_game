import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const EMPTY = {
  name: '', slug: '', description: '', base_price: '', is_price_fixed: false,
  category: 'game', icon: '🎮', note: '', sort_order: 0, is_active: true
};

const CATEGORIES = ['game', 'vps', 'proxy'];

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get('/admin/services').then(r => setServices(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setModal(true); };
  const openEdit = (s) => {
    setEditItem(s);
    setForm({ ...s, base_price: s.base_price || '', is_price_fixed: !!s.is_price_fixed, is_active: !!s.is_active });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, base_price: form.base_price ? Number(form.base_price) : null, sort_order: Number(form.sort_order) || 0 };
      if (editItem) await api.put(`/admin/services/${editItem.id}`, payload);
      else await api.post('/admin/services', payload);
      toast.success(editItem ? 'Cập nhật thành công!' : 'Thêm dịch vụ thành công!');
      setModal(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu!');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa dịch vụ này?')) return;
    try { await api.delete(`/admin/services/${id}`); toast.success('Đã xóa!'); fetch(); }
    catch { toast.error('Lỗi!'); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Quản Lý Dịch Vụ</h1>
          <p className="text-gray-400 text-sm mt-0.5">{services.length} dịch vụ</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus size={16}/> Thêm Mới</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Icon</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Tên dịch vụ</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Danh mục</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Giá</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Thứ tự</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Trạng thái</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-dark-border">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-dark-border rounded animate-pulse"/></td>)}
                </tr>
              ))
            ) : services.map(s => (
              <tr key={s.id} className="border-b border-dark-border hover:bg-dark/30">
                <td className="px-4 py-3 text-2xl">{s.icon}</td>
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{s.name}</p>
                  <p className="text-gray-500 text-xs truncate max-w-[200px]">{s.description}</p>
                </td>
                <td className="px-4 py-3"><span className="badge-yellow text-xs px-2 py-0.5">{s.category}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{s.base_price ? new Intl.NumberFormat('vi-VN').format(s.base_price) + ' ₫' : 'Liên hệ'}</td>
                <td className="px-4 py-3 text-gray-400">{s.sort_order}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${s.is_active ? 'badge-green' : 'badge-red'}`}>
                    {s.is_active ? 'Hiển thị' : 'Ẩn'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><FiEdit2 size={14}/></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"><FiTrash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && services.length === 0 && <div className="text-center py-12 text-gray-500">Chưa có dịch vụ</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-dark-border flex items-center justify-between">
              <h2 className="font-bold text-white">{editItem ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Icon (emoji)</label>
                  <input className="input text-sm" value={form.icon} onChange={set('icon')} placeholder="🎮"/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Danh mục</label>
                  <select className="input text-sm" value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tên dịch vụ *</label>
                <input required className="input text-sm" value={form.name} onChange={set('name')} placeholder="VD: Bán Xu"/>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Slug *</label>
                <input required className="input text-sm" value={form.slug} onChange={set('slug')} placeholder="ban-xu"/>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Mô tả</label>
                <textarea rows={3} className="input resize-none text-sm" value={form.description} onChange={set('description')}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Giá cơ bản (VNĐ, để trống = liên hệ)</label>
                  <input type="number" min={0} className="input text-sm" value={form.base_price} onChange={set('base_price')}/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Thứ tự hiển thị</label>
                  <input type="number" min={0} className="input text-sm" value={form.sort_order} onChange={set('sort_order')}/>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Ghi chú (giá/điều kiện)</label>
                <input className="input text-sm" value={form.note} onChange={set('note')} placeholder="VD: Giá điều chỉnh theo yêu cầu"/>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_price_fixed} onChange={e => setForm(f => ({...f, is_price_fixed: e.target.checked}))} className="w-4 h-4"/>
                  <span className="text-sm text-gray-300">Giá cố định</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} className="w-4 h-4"/>
                  <span className="text-sm text-gray-300">Hiển thị</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline py-2 px-5">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary py-2 px-5">{saving ? 'Đang lưu...' : (editItem ? 'Cập nhật' : 'Thêm mới')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}