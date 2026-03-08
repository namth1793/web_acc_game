import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Chào mừng, ${data.user.name}!`);
      if (['admin', 'staff'].includes(data.user.role)) navigate('/admin');
      else navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl">T</div>
            <span className="text-2xl font-black"><span className="text-primary">ACC</span><span className="text-white">NINJA</span></span>
          </Link>
          <h1 className="text-3xl font-black text-white">Đăng Nhập</h1>
          <p className="text-gray-400 mt-1">Chào mừng bạn trở lại!</p>
        </div>

        <div className="card p-8">

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email" required placeholder="email@example.com"
                className="input" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Mật Khẩu</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                  className="input pr-10" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" /> : <FiLogIn size={18} />}
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
