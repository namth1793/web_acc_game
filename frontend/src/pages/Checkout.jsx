import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../api/axios';
import { formatPrice } from '../components/AccountCard';
import toast from 'react-hot-toast';
import { FiCreditCard, FiSmartphone, FiCheck } from 'react-icons/fi';

const PAYMENT_METHODS = [
  { id: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: '🏦', desc: 'Vietcombank, VPBank, Techcombank...' },
  { id: 'momo', label: 'Ví MoMo', icon: '📱', desc: 'Quét QR hoặc chuyển tiền MoMo' },
  { id: 'zalopay', label: 'ZaloPay', icon: '💳', desc: 'Ví ZaloPay' },
  { id: 'atm', label: 'Thẻ ATM / NAPAS', icon: '💰', desc: 'Thẻ ATM nội địa' },
];

const BANK_INFO = {
  bank_transfer: { bank: 'Vietcombank', account: '1234 5678 90', name: 'NGUYEN VAN A', branch: 'CN Đà Nẵng' },
  momo: { phone: '0901 234 567', name: 'Tiền Game VN' },
  zalopay: { phone: '0901 234 567', name: 'Tiền Game VN' },
  atm: { info: 'Liên hệ admin để được hỗ trợ nạp thẻ ATM' }
};

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState('bank_transfer');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = cart.map(i => ({ account_id: i.id, price: i.price }));
      const orderRes = await api.post('/orders', { items, payment_method: method, notes });
      const payRes = await api.post('/payments', { order_id: orderRes.data.order.id, method });
      setOrder({ ...orderRes.data.order, paymentInfo: payRes.data });
      clearCart();
      toast.success('Đặt hàng thành công! Vui lòng hoàn tất thanh toán.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    const info = BANK_INFO[method];
    const content = `THANHTOAN${order.id}`;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card p-8 text-center mb-6">
          <div className="w-16 h-16 bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck size={32} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Đặt hàng thành công!</h2>
          <p className="text-gray-400 mb-1">Mã đơn hàng: <span className="text-primary font-bold">#{order.id}</span></p>
          <p className="text-gray-400">Tổng tiền: <span className="text-primary font-bold text-xl">{formatPrice(order.total_price)}</span></p>
        </div>

        <div className="card p-6 mb-6">
          <h3 className="font-bold text-white text-lg mb-4">Thông Tin Thanh Toán</h3>
          <div className="bg-dark rounded-lg p-4 space-y-3">
            {method === 'bank_transfer' && (
              <>
                <InfoRow label="Ngân hàng" value={info.bank} />
                <InfoRow label="Số tài khoản" value={info.account} highlight />
                <InfoRow label="Chủ tài khoản" value={info.name} />
                <InfoRow label="Chi nhánh" value={info.branch} />
                <InfoRow label="Nội dung CK" value={content} highlight />
              </>
            )}
            {method === 'momo' && (
              <>
                <InfoRow label="Số điện thoại" value={info.phone} highlight />
                <InfoRow label="Tên" value={info.name} />
                <InfoRow label="Nội dung" value={content} highlight />
              </>
            )}
            {method === 'zalopay' && (
              <>
                <InfoRow label="Số điện thoại" value={info.phone} highlight />
                <InfoRow label="Tên" value={info.name} />
                <InfoRow label="Nội dung" value={content} highlight />
              </>
            )}
            {method === 'atm' && <p className="text-gray-300">{info.info}</p>}
          </div>
          <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-lg text-sm text-yellow-300">
            ⚠️ Vui lòng ghi đúng nội dung chuyển khoản để được xác nhận tự động. Sau khi chuyển tiền, admin sẽ xác nhận trong vòng 5-15 phút.
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/don-hang')} className="btn-primary flex-1">Xem đơn hàng</button>
          <button onClick={() => navigate('/')} className="btn-outline flex-1">Tiếp tục mua</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Thanh Toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Payment method selection */}
            <div className="card p-5">
              <h3 className="font-bold text-white mb-4">Phương Thức Thanh Toán</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id} type="button"
                    onClick={() => setMethod(m.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${method === m.id ? 'border-primary bg-primary/10' : 'border-dark-border hover:border-gray-500'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <p className="font-medium text-white text-sm">{m.label}</p>
                        <p className="text-gray-500 text-xs">{m.desc}</p>
                      </div>
                      {method === m.id && <FiCheck className="ml-auto text-primary" size={18} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="card p-5">
              <label className="text-sm text-gray-400 mb-2 block">Ghi chú đơn hàng (tùy chọn)</label>
              <textarea rows={3} placeholder="Nhập ghi chú..." className="input resize-none" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
              {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" /> : <FiCreditCard size={20} />}
              {loading ? 'Đang xử lý...' : `Đặt hàng - ${formatPrice(cartTotal)}`}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div className="card p-5 h-fit sticky top-20">
          <h3 className="font-bold text-white mb-4 pb-3 border-b border-dark-border">Đơn Hàng</h3>
          <div className="space-y-3 mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-14 h-10 bg-dark rounded overflow-hidden flex-shrink-0">
                  {item.images?.[0] ? <img src={item.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🎮</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium line-clamp-2">{item.title}</p>
                  <p className="text-primary text-sm font-bold">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-dark-border pt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Tổng cộng</span>
              <span className="text-primary font-black text-xl">{formatPrice(cartTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400 text-sm">{label}:</span>
      <span className={`font-medium text-sm ${highlight ? 'text-primary' : 'text-white'}`}>{value}</span>
    </div>
  );
}
