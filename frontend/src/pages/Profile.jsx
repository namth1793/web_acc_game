import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiSave } from 'react-icons/fi';
import { formatPrice } from '../components/AccountCard';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', form);
      await refreshUser();
      toast.success('Cập nhật thông tin thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật!');
    } finally { setLoading(false); }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Mật khẩu xác nhận không khớp!'); return; }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi đổi mật khẩu!');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Hồ Sơ Của Tôi</h1>

      {/* User card */}
      <div className="card p-5 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-black text-2xl">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-gray-400">{user?.email}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {user?.role === 'admin' ? '👑 Quản trị viên' : user?.role === 'staff' ? '🛡️ Nhân viên' : '👤 Khách hàng'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Số dư</p>
          <p className="text-primary font-bold text-xl">{formatPrice(user?.balance || 0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-card border border-dark-border rounded-lg p-1">
        {[['info', <FiUser size={15} />, 'Thông tin'], ['password', <FiLock size={15} />, 'Đổi mật khẩu']].map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${tab === id ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="card p-6">
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Họ và tên</label>
              <input type="text" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input type="email" className="input opacity-60 cursor-not-allowed" value={user?.email} disabled />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Số điện thoại</label>
              <input type="tel" className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901234567" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <FiSave size={16} /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="card p-6">
          <form onSubmit={handleChangePw} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Mật khẩu hiện tại</label>
              <input type="password" className="input" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Mật khẩu mới</label>
              <input type="password" className="input" value={pwForm.newPassword} minLength={6} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Xác nhận mật khẩu mới</label>
              <input type="password" className="input" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <FiLock size={16} /> {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
