import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiCreditCard,
  FiLogOut, FiMenu, FiX, FiHome, FiMonitor, FiLayers, FiSettings
} from 'react-icons/fi';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/tai-khoan-game', label: 'Tài Khoản Game', icon: FiMonitor },
  { to: '/admin/game', label: 'Quản Lý Game', icon: FiPackage },
  { to: '/admin/dich-vu', label: 'Dịch Vụ', icon: FiLayers },
  { to: '/admin/don-hang', label: 'Đơn Hàng', icon: FiShoppingBag },
  { to: '/admin/thanh-toan', label: 'Thanh Toán', icon: FiCreditCard },
  { to: '/admin/nguoi-dung', label: 'Người Dùng', icon: FiUsers },
  { to: '/admin/cai-dat', label: 'Cài Đặt Popup', icon: FiSettings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!');
    navigate('/');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-dark-card border-r border-dark-border">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-black text-lg">T</div>
          <div>
            <p className="font-black text-white text-sm"><span className="text-primary">Tiên</span>Game</p>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-dark hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-dark-border space-y-1">
        <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-dark hover:text-white transition-all">
          <FiHome size={18} /> Về trang chủ
        </NavLink>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-all w-full text-left">
          <FiLogOut size={18} /> Đăng xuất
        </button>
        <div className="px-3 py-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs">{user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-60 lg:w-64 flex-shrink-0">
        <div className="w-full"><Sidebar /></div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-dark-card border-b border-dark-border flex items-center justify-between px-4 flex-shrink-0">
          <button className="md:hidden p-1 text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <h1 className="text-sm font-semibold text-gray-300 hidden md:block">Bảng Điều Khiển Quản Trị</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="hidden sm:block">{user?.name}</span>
            <span className="badge-yellow">{user?.role === 'admin' ? 'Admin' : 'Staff'}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
