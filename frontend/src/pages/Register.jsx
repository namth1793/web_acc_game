import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPw: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPw) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      const data = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success('Đăng ký thành công! Chào mừng bạn!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl">T</div>
            <span className="text-2xl font-black"><span className="text-primary">Tiên</span><span className="text-white">Game</span></span>
          </Link>
          <h1 className="text-3xl font-black text-white">Đăng Ký</h1>
          <p className="text-gray-400 mt-1">Tạo tài khoản để mua game dễ hơn</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Họ và tên *</label>
              <input type="text" required placeholder="Nguyễn Văn A" className="input" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email *</label>
              <input type="email" required placeholder="email@example.com" className="input" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Số điện thoại</label>
              <input type="tel" placeholder="0901234567" className="input" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Mật khẩu *</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required minLength={6} placeholder="Tối thiểu 6 ký tự" className="input pr-10" value={form.password} onChange={set('password')} />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Xác nhận mật khẩu *</label>
              <input type={showPw ? 'text' : 'password'} required placeholder="Nhập lại mật khẩu" className="input" value={form.confirmPw} onChange={set('confirmPw')} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" /> : <FiUserPlus size={18} />}
              {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
