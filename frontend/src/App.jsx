import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PopupAnnouncement from './components/PopupAnnouncement';

// Public pages
import Home from './pages/Home';
import AccountDetail from './pages/AccountDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import NapThe from './pages/NapThe';
import NapATMVi from './pages/NapATMVi';
import TinTuc from './pages/TinTuc';
import Services from './pages/Services';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminAccounts from './pages/admin/AdminAccounts';
import AdminGames from './pages/admin/AdminGames';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminServices from './pages/admin/AdminServices';
import AdminSettings from './pages/admin/AdminSettings';

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' },
              success: { iconTheme: { primary: '#f97316', secondary: '#fff' } }
            }}
          />
          <PopupAnnouncement />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/tai-khoan/:id" element={<PublicLayout><AccountDetail /></PublicLayout>} />
            <Route path="/gio-hang" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/nap-the" element={<PublicLayout><NapThe /></PublicLayout>} />
            <Route path="/nap-atm-vi" element={<PublicLayout><NapATMVi /></PublicLayout>} />
            <Route path="/tin-tuc" element={<PublicLayout><TinTuc /></PublicLayout>} />
            <Route path="/dich-vu" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected user routes */}
            <Route path="/thanh-toan" element={<ProtectedRoute><PublicLayout><Checkout /></PublicLayout></ProtectedRoute>} />
            <Route path="/don-hang" element={<ProtectedRoute><PublicLayout><MyOrders /></PublicLayout></ProtectedRoute>} />
            <Route path="/ho-so" element={<ProtectedRoute><PublicLayout><Profile /></PublicLayout></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="tai-khoan-game" element={<AdminAccounts />} />
              <Route path="game" element={<AdminGames />} />
              <Route path="don-hang" element={<AdminOrders />} />
              <Route path="nguoi-dung" element={<AdminUsers />} />
              <Route path="thanh-toan" element={<AdminPayments />} />
              <Route path="dich-vu" element={<AdminServices />} />
              <Route path="cai-dat" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}