import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatPrice } from '../../components/AccountCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign, FiClock } from 'react-icons/fi';

const STATUS_MAP = {
  pending: { cls: 'badge-yellow', text: 'Chờ TT' },
  paid: { cls: 'badge-blue', text: 'Đã TT' },
  completed: { cls: 'badge-green', text: 'Hoàn thành' },
  cancelled: { cls: 'badge-red', text: 'Đã hủy' },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
    </div>
  );

  const { stats, recentOrders, pendingPayments, revenueByDay } = data;

  const statCards = [
    { label: 'Tài Khoản Còn', value: stats.availableAccounts, icon: FiPackage, color: 'text-blue-400', bg: 'bg-blue-900/30' },
    { label: 'Đã Bán', value: stats.soldAccounts, icon: FiShoppingBag, color: 'text-green-400', bg: 'bg-green-900/30' },
    { label: 'Đơn Hàng', value: stats.totalOrders, icon: FiShoppingBag, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
    { label: 'Người Dùng', value: stats.totalUsers, icon: FiUsers, color: 'text-purple-400', bg: 'bg-purple-900/30' },
    { label: 'Doanh Thu Hôm Nay', value: formatPrice(stats.revenueToday), icon: FiDollarSign, color: 'text-orange-400', bg: 'bg-orange-900/30' },
    { label: 'Tuần Này', value: formatPrice(stats.revenueWeek), icon: FiDollarSign, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Tháng Này', value: formatPrice(stats.revenueMonth), icon: FiDollarSign, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Tổng Doanh Thu', value: formatPrice(stats.totalRevenue), icon: FiDollarSign, color: 'text-green-400', bg: 'bg-green-900/30' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Dashboard Tổng Quan</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-xs font-medium">{s.label}</p>
              <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon size={15} className={s.color} />
              </div>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {revenueByDay && revenueByDay.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-white mb-4">Doanh Thu 7 Ngày Gần Nhất</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v) => [formatPrice(v), 'Doanh thu']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#f97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <h3 className="font-bold text-white mb-4">Đơn Hàng Gần Đây</h3>
          <div className="space-y-2">
            {recentOrders.slice(0, 8).map(order => {
              const s = STATUS_MAP[order.status] || { cls: 'badge-gray', text: order.status };
              return (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">#{order.id} — {order.user_name}</p>
                    <p className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={s.cls}>{s.text}</span>
                    <span className="text-primary font-bold text-sm">{formatPrice(order.total_price)}</span>
                  </div>
                </div>
              );
            })}
            {recentOrders.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Chưa có đơn hàng nào</p>}
          </div>
        </div>

        {/* Pending payments */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-white">Thanh Toán Chờ Xác Nhận</h3>
            {pendingPayments.length > 0 && (
              <span className="bg-red-900/50 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-800">{pendingPayments.length}</span>
            )}
          </div>
          <div className="space-y-2">
            {pendingPayments.slice(0, 8).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{p.user_name} — Đơn #{p.order_id}</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1"><FiClock size={11} /> {new Date(p.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <span className="text-yellow-400 font-bold text-sm">{formatPrice(p.amount)}</span>
              </div>
            ))}
            {pendingPayments.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Không có thanh toán chờ xác nhận</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
