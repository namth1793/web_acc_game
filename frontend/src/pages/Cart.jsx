import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../components/AccountCard';
import { FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) { toast.error('Vui lòng đăng nhập để thanh toán!'); navigate('/login'); return; }
    navigate('/thanh-toan');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <FiShoppingCart size={80} className="mx-auto text-gray-700 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-3">Giỏ hàng trống</h2>
        <p className="text-gray-400 mb-6">Bạn chưa thêm tài khoản game nào vào giỏ hàng.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <FiShoppingCart size={16} /> Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Giỏ Hàng <span className="text-gray-400 text-lg">({cart.length} sản phẩm)</span></h1>
        <button onClick={clearCart} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors">
          <FiTrash2 size={14} /> Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item.id} className="card p-4 flex gap-4">
              <div className="w-24 h-16 bg-dark rounded-lg overflow-hidden flex-shrink-0">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/tai-khoan/${item.id}`} className="font-semibold text-white hover:text-primary transition-colors text-sm line-clamp-2">{item.title}</Link>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {item.game_name && <span className="text-xs text-primary">{item.game_name}</span>}
                  {item.server_name && <span className="text-xs text-gray-500">· {item.server_name}</span>}
                  {item.level && <span className="text-xs text-yellow-500">· Lv.{item.level}</span>}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-primary font-bold text-lg">{formatPrice(item.price)}</span>
                  <button onClick={() => { removeFromCart(item.id); toast('Đã xóa khỏi giỏ hàng', { icon: '🗑️' }); }}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h3 className="font-bold text-white text-lg mb-4 pb-3 border-b border-dark-border">Tóm Tắt Đơn Hàng</h3>
            <div className="space-y-2 mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-400 truncate flex-1 mr-2">{item.title}</span>
                  <span className="text-white font-medium flex-shrink-0">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dark-border pt-4 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">Tổng cộng</span>
                <span className="text-primary font-black text-2xl price-glow">{formatPrice(cartTotal)}</span>
              </div>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
              Tiến hành thanh toán <FiArrowRight size={18} />
            </button>
            <Link to="/" className="block text-center text-gray-400 hover:text-primary text-sm mt-3 transition-colors">
              ← Tiếp tục mua hàng
            </Link>

            {/* Trust badges */}
            <div className="mt-5 pt-4 border-t border-dark-border space-y-2">
              <p className="text-xs text-gray-500 flex items-center gap-2">✅ Giao dịch an toàn, bảo mật</p>
              <p className="text-xs text-gray-500 flex items-center gap-2">⚡ Giao hàng tức thì sau khi thanh toán</p>
              <p className="text-xs text-gray-500 flex items-center gap-2">🔒 Bảo hành đổi tài khoản nếu lỗi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
