import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatPrice } from '../../components/AccountCard';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiImage } from 'react-icons/fi';

const PAYMENT_STATUS = {
  pending: { cls: 'badge-yellow', text: 'Chờ xác nhận' },
  success: { cls: 'badge-green', text: 'Đã xác nhận' },
  failed: { cls: 'badge-red', text: 'Thất bại' },
};
const PAYMENT_METHOD = { bank_transfer: '🏦 CK Ngân hàng', momo: '📱 MoMo', zalopay: '💳 ZaloPay', atm: '💰 ATM' };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/payments', { params: { page, limit: 15, status: statusFilter || undefined } });
      setPayments(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, [page, statusFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/payments/${id}/status`, { status });
      toast.success(`Đã ${status === 'success' ? 'xác nhận' : 'từ chối'} thanh toán!`);
      fetchPayments();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi!'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Quản Lý Thanh Toán</h1>
          <p className="text-gray-400 text-sm mt-0.5">Tổng: {pagination.total} giao dịch</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {[['', 'Tất cả'], ['pending', 'Chờ xác nhận'], ['success', 'Đã xác nhận'], ['failed', 'Thất bại']].map(([v, l]) => (
          <button key={v} onClick={() => { setStatusFilter(v); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${statusFilter === v ? 'bg-primary border-primary text-white' : 'border-dark-border text-gray-400 hover:border-primary hover:text-primary'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">ID</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Đơn hàng</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Khách hàng</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Phương thức</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Số tiền</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Mã GD</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Ảnh CM</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Thời gian</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Xác nhận</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-dark-border">
                    {[...Array(10)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-dark-border rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : payments.map(p => {
                const s = PAYMENT_STATUS[p.status] || { cls: 'badge-gray', text: p.status };
                return (
                  <tr key={p.id} className="border-b border-dark-border hover:bg-dark/30 transition-colors">
                    <td className="px-4 py-3 text-gray-500">#{p.id}</td>
                    <td className="px-4 py-3 text-white font-medium">#{p.order_id}</td>
                    <td className="px-4 py-3">
                      <p className="text-white">{p.user_name}</p>
                      <p className="text-gray-500 text-xs">{p.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{PAYMENT_METHOD[p.method] || p.method}</td>
                    <td className="px-4 py-3 text-primary font-bold">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-3"><span className={s.cls}>{s.text}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{p.transaction_id || '—'}</td>
                    <td className="px-4 py-3">
                      {p.proof_image ? (
                        <button onClick={() => setProofModal(p.proof_image)} className="flex items-center gap-1 text-primary hover:underline text-xs">
                          <FiImage size={13} /> Xem
                        </button>
                      ) : (
                        <span className="text-gray-600 text-xs">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3">
                      {p.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStatusChange(p.id, 'success')}
                            className="p-1.5 bg-green-900/30 text-green-400 hover:bg-green-900/60 rounded-lg transition-colors"
                            title="Xác nhận thanh toán"
                          >
                            <FiCheck size={14} />
                          </button>
                          <button
                            onClick={() => handleStatusChange(p.id, 'failed')}
                            className="p-1.5 bg-red-900/30 text-red-400 hover:bg-red-900/60 rounded-lg transition-colors"
                            title="Từ chối thanh toán"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && payments.length === 0 && <div className="text-center py-12 text-gray-500">Không có giao dịch nào</div>}
        </div>
      </div>
      <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />

      {/* Proof image modal */}
      {proofModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setProofModal(null)}>
          <div className="relative max-w-2xl w-full">
            <img src={proofModal} alt="Ảnh chứng minh thanh toán" className="w-full rounded-xl" />
            <button onClick={() => setProofModal(null)} className="absolute -top-3 -right-3 w-8 h-8 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:text-red-400">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
