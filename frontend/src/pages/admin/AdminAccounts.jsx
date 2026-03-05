import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { formatPrice } from '../../components/AccountCard';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUpload, FiX, FiImage } from 'react-icons/fi';

const EMPTY_FORM = {
  game_id: '', server_id: '', class_id: '', title: '', price: '',
  original_price: '', description: '', status: 'available', images: []
};

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [games, setGames] = useState([]);
  const [servers, setServers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, search: search || undefined, game_id: gameFilter || undefined, status: statusFilter || undefined };
      const res = await api.get('/admin/accounts', { params });
      setAccounts(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { api.get('/games').then(r => setGames(r.data)); }, []);
  useEffect(() => { fetchAccounts(); }, [page, search, gameFilter, statusFilter]);
  useEffect(() => {
    if (form.game_id) {
      api.get(`/games/${form.game_id}/servers`).then(r => setServers(r.data));
      api.get(`/games/${form.game_id}/classes`).then(r => setClasses(r.data));
    } else { setServers([]); setClasses([]); }
  }, [form.game_id]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (acc) => {
    setEditItem(acc);
    setForm({
      game_id: String(acc.game_id), server_id: String(acc.server_id || ''),
      class_id: String(acc.class_id || ''), title: acc.title,
      price: acc.price, original_price: acc.original_price || '',
      description: acc.description || '', status: acc.status,
      images: acc.images || []
    });
    setModal(true);
  };

  const handleUploadImages = async (files) => {
    if (!files || files.length === 0) return;
    const currentCount = form.images.length;
    const maxNew = 12 - currentCount;
    if (maxNew <= 0) { toast.error('Đã đạt tối đa 12 ảnh!'); return; }
    const toUpload = Array.from(files).slice(0, maxNew);

    setUploading(true);
    try {
      const formData = new FormData();
      toUpload.forEach(f => formData.append('images', f));
      const res = await api.post('/accounts/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      setForm(f => ({ ...f, images: [...f.images, ...res.data.urls] }));
      toast.success(`Đã upload ${res.data.urls.length} ảnh!`);
    } catch {
      toast.error('Lỗi upload ảnh!');
    } finally { setUploading(false); }
  };

  const removeImage = (idx) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        game_id: Number(form.game_id),
        server_id: form.server_id ? Number(form.server_id) : null,
        class_id: form.class_id ? Number(form.class_id) : null,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null
      };
      if (editItem) await api.put(`/admin/accounts/${editItem.id}`, payload);
      else await api.post('/admin/accounts', payload);
      toast.success(editItem ? 'Cập nhật thành công!' : 'Thêm tài khoản thành công!');
      setModal(false);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu dữ liệu!');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa tài khoản game này?')) return;
    try {
      await api.delete(`/admin/accounts/${id}`);
      toast.success('Đã xóa tài khoản!');
      fetchAccounts();
    } catch { toast.error('Lỗi xóa!'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/accounts/${id}/status`, { status });
      toast.success('Cập nhật trạng thái!');
      fetchAccounts();
    } catch { toast.error('Lỗi!'); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setGame = (e) => setForm(f => ({ ...f, game_id: e.target.value, server_id: '', class_id: '' }));
  const statusBadge = { available: 'badge-green', sold: 'badge-red', pending: 'badge-yellow' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Quản Lý Tài Khoản Game</h1>
          <p className="text-gray-400 text-sm mt-0.5">Tổng: {pagination.total} tài khoản</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Thêm Mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
          <input className="input pl-9 text-sm" placeholder="Tìm kiếm..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input text-sm w-auto" value={gameFilter} onChange={e => { setGameFilter(e.target.value); setPage(1); }}>
          <option value="">Tất cả game</option>
          {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select className="input text-sm w-auto" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Tất cả TT</option>
          <option value="available">Còn hàng</option>
          <option value="sold">Đã bán</option>
          <option value="pending">Đang xử lý</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">ID</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Tên tài khoản</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Game</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Server</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Giá</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Trạng thái</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-dark-border">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-dark-border rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : accounts.map(acc => (
                <tr key={acc.id} className="border-b border-dark-border hover:bg-dark/30 transition-colors">
                  <td className="px-4 py-3 text-gray-500">#{acc.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {acc.images?.[0] && <img src={acc.images[0]} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0"/>}
                      <div>
                        <p className="text-white font-medium max-w-xs truncate">{acc.title}</p>
                        {acc.class_name && <p className="text-gray-500 text-xs">{acc.class_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{acc.game_name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{acc.server_name || '—'}</td>
                  <td className="px-4 py-3 text-primary font-medium">{formatPrice(acc.price)}</td>
                  <td className="px-4 py-3">
                    <select
                      className={`text-xs rounded-full px-2 py-0.5 border cursor-pointer ${statusBadge[acc.status]} bg-transparent`}
                      value={acc.status}
                      onChange={e => handleStatusChange(acc.id, e.target.value)}
                    >
                      <option value="available">Còn hàng</option>
                      <option value="sold">Đã bán</option>
                      <option value="pending">Đang xử lý</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(acc)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(acc.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && accounts.length === 0 && (
            <div className="text-center py-12 text-gray-500">Không có tài khoản game nào</div>
          )}
        </div>
      </div>
      <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-dark-border flex items-center justify-between">
              <h2 className="font-bold text-white">{editItem ? 'Sửa Tài Khoản Game' : 'Thêm Tài Khoản Game'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Game *</label>
                  <select className="input text-sm" required value={form.game_id} onChange={setGame}>
                    <option value="">Chọn game</option>
                    {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Server</label>
                  <select className="input text-sm" value={form.server_id} onChange={set('server_id')}>
                    <option value="">Chọn server</option>
                    {servers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Phái / Nhân vật</label>
                  <select className="input text-sm" value={form.class_id} onChange={set('class_id')}>
                    <option value="">Chọn phái</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Trạng thái</label>
                  <select className="input text-sm" value={form.status} onChange={set('status')}>
                    <option value="available">Còn hàng</option>
                    <option value="sold">Đã bán</option>
                    <option value="pending">Đang xử lý</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tiêu đề *</label>
                <input type="text" className="input text-sm" required placeholder="VD: Acc NSO SV1 Kiếm Full Đồ VIP" value={form.title} onChange={set('title')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Giá bán (VNĐ) *</label>
                  <input type="number" className="input text-sm" required min={0} value={form.price} onChange={set('price')} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Giá gốc (VNĐ)</label>
                  <input type="number" className="input text-sm" min={0} value={form.original_price} onChange={set('original_price')} />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Mô tả chi tiết</label>
                <textarea rows={3} className="input resize-none text-sm" placeholder="Mô tả tài khoản game..." value={form.description} onChange={set('description')} />
              </div>

              {/* Image Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400 font-medium">
                    Ảnh sản phẩm ({form.images.length}/12)
                  </label>
                  <button
                    type="button"
                    disabled={uploading || form.images.length >= 12}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-all"
                  >
                    {uploading ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <FiUpload size={12} />
                    )}
                    {uploading ? 'Đang upload...' : 'Tải ảnh lên'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => { handleUploadImages(e.target.files); e.target.value = ''; }}
                  />
                </div>

                {form.images.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {form.images.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-dark-border">
                        <img src={url} alt="" className="w-full h-full object-cover"/>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={10}/>
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[9px] text-center py-0.5">Ảnh bìa</div>
                        )}
                      </div>
                    ))}
                    {form.images.length < 12 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-dark-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-primary transition-colors"
                      >
                        <FiImage size={16}/>
                        <span className="text-[10px]">Thêm</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-dark-border hover:border-primary/50 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                  >
                    <FiImage size={28}/>
                    <span className="text-sm">Nhấn để tải ảnh lên (6-12 ảnh)</span>
                    <span className="text-xs text-gray-600">Ảnh đầu tiên sẽ là ảnh bìa</span>
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline py-2 px-5">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary py-2 px-5">
                  {saving ? 'Đang lưu...' : (editItem ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}