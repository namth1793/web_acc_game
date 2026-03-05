import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiShield, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/', label: 'Trang Chủ', end: true },
  { to: '/dich-vu', label: 'Dịch Vụ' },
  { to: '/nap-the', label: 'Nạp Thẻ' },
  { to: '/tin-tuc', label: 'Tin Tức' },
  { to: '/nap-atm-vi', label: 'Nạp ATM - Ví' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!');
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark-card border-b border-dark-border backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-black text-lg group-hover:bg-primary-dark transition-colors">
              A
            </div>
            <span className="text-xl font-black">
              <span className="text-primary">ACC</span>
              <span className="text-white">NINJA</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-300 hover:text-primary hover:bg-primary/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/gio-hang" className="relative p-2 text-gray-300 hover:text-primary transition-colors">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(p => !p)}
                  className="flex items-center gap-2 bg-dark border border-dark-border rounded-lg px-3 py-1.5 text-sm hover:border-primary transition-colors"
                >
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-white font-medium max-w-[100px] truncate">{user.name}</span>
                  <FiChevronDown size={14} className="text-gray-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 card shadow-2xl py-1 z-50">
                      <div className="px-4 py-2 border-b border-dark-border">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link to="/ho-so" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-primary transition-colors">
                        <FiUser size={15} /> Hồ Sơ
                      </Link>
                      <Link to="/don-hang" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-primary transition-colors">
                        <FiShoppingCart size={15} /> Đơn Hàng
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-primary font-medium hover:bg-dark transition-colors">
                          <FiShield size={15} /> Quản Trị
                        </Link>
                      )}
                      <div className="border-t border-dark-border mt-1 pt-1">
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-dark transition-colors w-full text-left">
                          <FiLogOut size={15} /> Đăng Xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-outline py-1.5 px-4 text-sm hidden sm:block">Đăng Nhập</Link>
                <Link to="/register" className="btn-primary py-1.5 px-4 text-sm">Đăng Ký</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-300" onClick={() => setMenuOpen(p => !p)}>
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-dark-border space-y-1">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-primary bg-primary/10' : 'text-gray-300 hover:text-primary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="border-t border-dark-border pt-2 mt-2">
              <Link to="/gio-hang" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-300 hover:text-primary rounded-lg text-sm">
                Giỏ Hàng {cartCount > 0 && `(${cartCount})`}
              </Link>
              {!user && (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-primary font-medium rounded-lg text-sm">
                  Đăng Nhập / Đăng Ký
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
