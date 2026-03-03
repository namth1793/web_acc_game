import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatPrice } from '../../components/AccountCard';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';
import { FiSearch, FiShield, FiTrash2, FiKey } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_MAP = {
  admin: { cls: 'badge-red', text: '👑 Admin' },
  staff: { cls: 'badge-yellow', text: '🛡️ Nhân viên' },
  user: { cls: 'badge-blue', text: '👤 Khách hàng' },
};

export default function AdminUsers() {
  const { user: me, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState(null);
  const [newPw, setNewPw] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page, limit: 15, search: search || undefined, role: roleFilter || undefined } });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);

  const handleRoleChange = async (id, role) => {
    if (!isSuperAdmin) { toast.error('Chỉ admin mới có quyền thay đổi quyền!'); return; }
    if (id === me.id) { toast.error('Không thể thay đổi quyền của chính mình!'); return; }
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      toast.success('Cập nhật quyền thành công!');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi!'); }
  };

  const handleDelete = async (id) => {
    if (!isSuperAdmin) { toast.error('Chỉ admin mới có quyền xóa!'); return; }
    if (!confirm('Xác nhận xóa người dùng này?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Đã xóa người dùng!');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi!'); }
  };

  const handleResetPw = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${resetModal.id}/reset-password`, { new_password: newPw });
      toast.success('Đã đặt lại mật khẩu!');
      setResetModal(null); setNewPw('');
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi!'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Quản Lý Người Dùng</h1>
          <p className="text-gray-400 text-sm mt-0.5">Tổng: {pagination.total} người dùng</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
          <input className="input pl-9 text-sm" placeholder="Tìm tên, email, SĐT..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input text-sm w-auto" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">Tất cả quyền</option>
          <option value="admin">Admin</option>
          <option value="staff">Nhân viên</option>
          <option value="user">Khách hàng</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">ID</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Thông tin</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Điện thoại</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Quyền</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Số dư</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Đơn hàng</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Ngày tạo</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-dark-border">
                    {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-dark-border rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : users.map(u => {
                const r = ROLE_MAP[u.role] || { cls: 'badge-gray', text: u.role };
                return (
                  <tr key={u.id} className="border-b border-dark-border hover:bg-dark/30 transition-colors">
                    <td className="px-4 py-3 text-gray-500">#{u.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{u.name} {u.id === me.id && <span className="text-gray-500 text-xs">(bạn)</span>}</p>
                          <p className="text-gray-500 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      {isSuperAdmin && u.id !== me.id ? (
                        <select className="text-xs bg-transparent border border-dark-border rounded px-2 py-1 text-white" value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}>
                          <option value="user">Khách hàng</option>
                          <option value="staff">Nhân viên</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={r.cls}>{r.text}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-green-400">{formatPrice(u.balance || 0)}</td>
                    <td className="px-4 py-3 text-gray-400">{u.orderCount}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {isSuperAdmin && (
                          <>
                            <button onClick={() => { setResetModal(u); setNewPw(''); }} className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/20 rounded-lg transition-colors" title="Đặt lại mật khẩu">
                              <FiKey size={13} />
                            </button>
                            {u.id !== me.id && (
                              <button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                                <FiTrash2 size={13} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && users.length === 0 && <div className="text-center py-12 text-gray-500">Không có người dùng nào</div>}
        </div>
      </div>
      <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />

      {/* Reset password modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-md p-6">
            <h3 className="font-bold text-white mb-1">Đặt lại mật khẩu</h3>
            <p className="text-gray-400 text-sm mb-4">Người dùng: {resetModal.name} ({resetModal.email})</p>
            <form onSubmit={handleResetPw} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Mật khẩu mới</label>
                <input type="text" className="input" required minLength={6} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setResetModal(null)} className="btn-outline py-2 px-4">Hủy</button>
                <button type="submit" className="btn-primary py-2 px-4">Đặt lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
