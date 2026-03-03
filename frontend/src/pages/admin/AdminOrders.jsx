import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatPrice } from '../../components/AccountCard';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';
import { FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ thanh toán', cls: 'badge-yellow' },
  { value: 'paid', label: 'Đã thanh toán', cls: 'badge-blue' },
  { value: 'completed', label: 'Hoàn thành', cls: 'badge-green' },
  { value: 'cancelled', label: 'Đã hủy', cls: 'badge-red' },
];

const PAYMENT_MAP = { bank_transfer: '🏦 CK Ngân hàng', momo: '📱 MoMo', zalopay: '💳 ZaloPay', atm: '💰 ATM' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders', { params: { page, limit: 15, search: search || undefined, status: statusFilter || undefined } });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, search, statusFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      toast.success('Cập nhật trạng thái đơn hàng!');
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi!'); }
  };

  const getStatusInfo = (s) => STATUS_OPTIONS.find(o => o.value === s) || { label: s, cls: 'badge-gray' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-400 text-sm mt-0.5">Tổng: {pagination.total} đơn hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
          <input className="input pl-9 text-sm" placeholder="Tìm theo tên, email, ID đơn..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['', 'Tất cả'], ...STATUS_OPTIONS.map(s => [s.value, s.label])].map(([v, l]) => (
            <button key={v} onClick={() => { setStatusFilter(v); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${statusFilter === v ? 'bg-primary border-primary text-white' : 'border-dark-border text-gray-400 hover:border-primary hover:text-primary'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? [...Array(5)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)
          : orders.length === 0 ? (
            <div className="card p-12 text-center text-gray-500">Không có đơn hàng nào</div>
          ) : orders.map(order => {
            const s = getStatusInfo(order.status);
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="card overflow-hidden">
                <div className="p-4 cursor-pointer hover:bg-dark/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      {isExpanded ? <FiChevronUp className="text-gray-400" size={16} /> : <FiChevronDown className="text-gray-400" size={16} />}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm">Đơn #{order.id}</p>
                          <span className={s.cls}>{s.label}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5">
                          👤 {order.user_name} ({order.user_email})
                          {order.payment_method && <span className="ml-2">· {PAYMENT_MAP[order.payment_method] || order.payment_method}</span>}
                        </p>
                        <p className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                      <span className="text-primary font-bold text-lg">{formatPrice(order.total_price)}</span>
                      <select
                        className="input text-xs py-1.5 w-auto"
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-dark-border p-4 space-y-4">
                    {/* Items */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 mb-2">Sản phẩm</h4>
                      <div className="space-y-1.5">
                        {order.items?.map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-dark rounded-lg px-3 py-2 text-sm">
                            <div>
                              <p className="text-white font-medium">{item.title}</p>
                              <p className="text-gray-500 text-xs">{item.game_name}{item.level && ` · Lv.${item.level}`}</p>
                            </div>
                            <span className="text-primary font-bold">{formatPrice(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment info */}
                    {order.payment && (
                      <div className="bg-dark rounded-lg p-3 text-sm">
                        <p className="text-gray-400 text-xs font-semibold mb-1">Thông tin thanh toán</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-white">{PAYMENT_MAP[order.payment.method] || order.payment.method}</span>
                          <span className={order.payment.status === 'success' ? 'badge-green' : order.payment.status === 'failed' ? 'badge-red' : 'badge-yellow'}>
                            {order.payment.status === 'success' ? 'Đã xác nhận' : order.payment.status === 'failed' ? 'Thất bại' : 'Chờ xác nhận'}
                          </span>
                          {order.payment.transaction_id && <span className="text-gray-500 text-xs">TXN: {order.payment.transaction_id}</span>}
                        </div>
                        {order.payment.proof_image && (
                          <a href={order.payment.proof_image} target="_blank" rel="noreferrer" className="text-primary text-xs hover:underline mt-1 block">
                            Xem ảnh chứng minh →
                          </a>
                        )}
                      </div>
                    )}

                    {order.notes && (
                      <div className="bg-dark rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Ghi chú:</p>
                        <p className="text-white text-sm">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
      <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
    </div>
  );
}
