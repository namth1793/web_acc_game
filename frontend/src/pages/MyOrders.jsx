import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatPrice } from '../components/AccountCard';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { FiPackage, FiX } from 'react-icons/fi';

const STATUS_MAP = {
  pending: { cls: 'badge-yellow', text: 'Chờ thanh toán' },
  paid: { cls: 'badge-blue', text: 'Đã thanh toán' },
  completed: { cls: 'badge-green', text: 'Hoàn thành' },
  cancelled: { cls: 'badge-red', text: 'Đã hủy' },
};

const PAYMENT_METHOD_MAP = {
  bank_transfer: '🏦 Chuyển khoản',
  momo: '📱 MoMo',
  zalopay: '💳 ZaloPay',
  atm: '💰 ATM',
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders', { params: { page, limit: 10, status: statusFilter || undefined } });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleCancel = async (id) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      await api.post(`/orders/${id}/cancel`);
      toast.success('Đã hủy đơn hàng!');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Đơn Hàng Của Tôi</h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[['', 'Tất cả'], ['pending', 'Chờ TT'], ['paid', 'Đã TT'], ['completed', 'Hoàn thành'], ['cancelled', 'Đã hủy']].map(([v, l]) => (
          <button key={v} onClick={() => { setStatusFilter(v); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${statusFilter === v ? 'bg-primary border-primary text-white' : 'border-dark-border text-gray-400 hover:border-primary hover:text-primary'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card p-5 animate-pulse h-24" />)}</div>
      ) : orders.length === 0 ? (
        <div className="card p-16 text-center">
          <FiPackage size={60} className="mx-auto text-gray-700 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Chưa có đơn hàng</h3>
          <p className="text-gray-400">Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = STATUS_MAP[order.status] || { cls: 'badge-gray', text: order.status };
            const expanded = expandedId === order.id;
            return (
              <div key={order.id} className="card overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-dark/30 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">Đơn #{order.id}</p>
                      <p className="text-gray-400 text-sm mt-0.5">
                        {new Date(order.created_at).toLocaleString('vi-VN')}
                        {order.payment_method && <span className="ml-2">· {PAYMENT_METHOD_MAP[order.payment_method] || order.payment_method}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={status.cls}>{status.text}</span>
                      <span className="text-primary font-bold text-lg">{formatPrice(order.total_price)}</span>
                    </div>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-dark-border p-5">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Sản phẩm trong đơn:</h4>
                    <div className="space-y-2 mb-4">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm bg-dark rounded-lg px-3 py-2">
                          <div>
                            <p className="text-white font-medium">{item.title}</p>
                            <p className="text-gray-500 text-xs">{item.game_name}{item.level && ` · Lv.${item.level}`}</p>
                          </div>
                          <span className="text-primary font-bold">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>
                    {order.status === 'pending' && (
                      <button onClick={() => handleCancel(order.id)} className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm border border-red-900 hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors">
                        <FiX size={14} /> Hủy đơn hàng
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
    </div>
  );
}
