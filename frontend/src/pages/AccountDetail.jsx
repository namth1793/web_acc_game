import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiEye, FiShield, FiShoppingCart, FiUser, FiZap } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import AccountCard, { formatPrice } from '../components/AccountCard';
import { NinjaMask, NinjaVillageBadge, Shuriken } from '../components/NinjaArt';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

// ── helpers ──────────────────────────────────────────────────────────────────
const CLASS_COLORS = {
  'Kunai': { text: 'text-orange-400', bg: 'from-orange-950 via-slate-900 to-gray-950', glow: 'rgba(249,115,22,0.3)',  tag: 'text-orange-400 bg-orange-900/30 border-orange-800', kanji: '苦' },
  'Kiếm':  { text: 'text-red-400',    bg: 'from-red-950 via-slate-900 to-gray-950',    glow: 'rgba(239,68,68,0.3)',   tag: 'text-red-400 bg-red-900/30 border-red-800',          kanji: '剣' },
  'Tiêu':  { text: 'text-cyan-400',   bg: 'from-cyan-950 via-slate-900 to-gray-950',   glow: 'rgba(6,182,212,0.3)',   tag: 'text-cyan-400 bg-cyan-900/30 border-cyan-800',        kanji: '矢' },
  'Đao':   { text: 'text-purple-400', bg: 'from-purple-950 via-slate-900 to-gray-950', glow: 'rgba(168,85,247,0.3)',  tag: 'text-purple-400 bg-purple-900/30 border-purple-800',  kanji: '刀' },
  'Quạt':  { text: 'text-pink-400',   bg: 'from-pink-950 via-slate-900 to-gray-950',   glow: 'rgba(236,72,153,0.3)', tag: 'text-pink-400 bg-pink-900/30 border-pink-800',        kanji: '扇' },
  'Cung':  { text: 'text-green-400',  bg: 'from-green-950 via-slate-900 to-gray-950',  glow: 'rgba(34,197,94,0.3)',  tag: 'text-green-400 bg-green-900/30 border-green-800',     kanji: '弓' },
};
const DEFAULT_CLASS = { text: 'text-orange-400', bg: 'from-orange-950 via-slate-900 to-gray-950', glow: 'rgba(249,115,22,0.3)', tag: 'text-orange-400 bg-orange-900/30 border-orange-800', kanji: '忍' };

function serverColor(name) {
  if (name?.includes('VIP'))  return 'text-yellow-300 bg-yellow-900/40 border-yellow-700';
  if (name?.includes('Mới'))  return 'text-green-300 bg-green-900/40 border-green-700';
  return 'text-blue-300 bg-blue-900/40 border-blue-800';
}
function classIcon(name) {
  const icons = { 'Kunai':'🗡️', 'Kiếm':'⚔️', 'Tiêu':'🎯', 'Đao':'🔱', 'Quạt':'🪭', 'Cung':'🏹' };
  return icons[name] || '🥷';
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-5 bg-gray-800 rounded w-24 mb-6"/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-72 bg-gray-800 rounded-2xl"/>
        <div className="space-y-4">
          <div className="h-8 bg-gray-800 rounded w-3/4"/>
          <div className="h-5 bg-gray-800 rounded w-1/2"/>
          <div className="h-14 bg-gray-800 rounded"/>
          <div className="h-12 bg-gray-800 rounded"/>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/accounts/${id}`)
      .then(r => { setAccount(r.data); setSelectedImage(0); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const inCart = account ? isInCart(account.id) : false;

  const handleAddToCart = () => {
    if (!account) return;
    const added = addToCart(account);
    if (added) toast.success('Đã thêm vào giỏ hàng!');
    else if (inCart) toast('Tài khoản đã có trong giỏ hàng!', { icon: 'ℹ️' });
  };

  const handleBuyNow = () => {
    if (!user) { toast.error('Vui lòng đăng nhập để mua hàng!'); navigate('/login'); return; }
    if (!inCart) addToCart(account);
    navigate('/gio-hang');
  };

  if (loading) return <Skeleton />;
  if (!account) return null;

  const cls = CLASS_COLORS[account.class_name] || DEFAULT_CLASS;
  const isVIP  = account.server_name?.includes('VIP');
  const isNew  = account.server_name?.includes('Mới');
  const isHot  = (account.view_count > 5 || account.price >= 3000000) && !isVIP;
  const discount = account.original_price > account.price
    ? Math.round((1 - account.price / account.original_price) * 100) : 0;
  const isSold  = account.status === 'sold';
  const isPending = account.status === 'pending';

  return (
    <div className="min-h-screen pb-16">

      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${cls.bg}`}>
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{background:`radial-gradient(ellipse at 60% 50%, ${cls.glow}, transparent 65%)`}}/>
        {/* Kanji watermark */}
        <div className="absolute right-6 top-2 text-[100px] sm:text-[220px] leading-none font-black opacity-[0.03] select-none" style={{fontFamily:'serif'}}>
          {cls.kanji}
        </div>
        {/* Spinning shurikens */}
        <div className="absolute top-6 left-8 opacity-[0.07] float"><Shuriken size={52} className="spin-slow"/></div>
        <div className="absolute bottom-4 right-1/4 opacity-[0.05] float" style={{animationDelay:'2s'}}><Shuriken size={34} className="spin-slow-rev"/></div>

        {/* Back button */}
        <div className="relative max-w-6xl mx-auto px-4 pt-5">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-primary transition-colors text-sm font-medium group">
            <FiArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform"/> Quay lại
          </button>
        </div>

        {/* Title section */}
        <div className="relative max-w-6xl mx-auto px-4 pt-4 pb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {isVIP  && <span className="badge bg-yellow-900/90 border border-yellow-600 text-xs vip-text font-bold px-2.5 py-1">⭐ Server VIP</span>}
            {isHot  && <span className="badge bg-red-900/90 border border-red-600 text-red-300 hot-badge text-xs px-2.5 py-1">🔥 HOT</span>}
            {isNew  && <span className="badge bg-green-900/90 border border-green-600 text-green-300 text-xs px-2.5 py-1">✨ Server Mới</span>}
            {isSold && <span className="badge bg-gray-900/90 border border-gray-600 text-gray-400 text-xs px-2.5 py-1">Đã bán</span>}
            {discount > 0 && <span className="badge bg-red-600 text-white text-xs font-black px-2.5 py-1">-{discount}% OFF</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight max-w-2xl title-glow">
            {account.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs bg-primary/15 text-primary border border-primary/30 px-2.5 py-1 rounded-lg font-semibold">
              🎮 {account.game_name}
            </span>
            {account.server_name && (
              <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${serverColor(account.server_name)}`}>
                {account.server_name}
              </span>
            )}
            {account.class_name && (
              <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${cls.tag}`}>
                {classIcon(account.class_name)} {account.class_name}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-900/60 px-2 py-1 rounded-lg border border-gray-800">
              <FiEye size={11}/> {account.view_count} lượt xem
            </span>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 24" fill="none" preserveAspectRatio="none" className="w-full">
            <path d="M0 24L0 12Q360 0 720 12Q1080 24 1440 12L1440 24Z" fill="#080c14"/>
          </svg>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

          {/* Left: Image / Art */}
          <div>
            <div className="rounded-2xl overflow-hidden border border-gray-800 mb-3 relative" style={{background:'#0d1625'}}>
              {account.images && account.images[selectedImage] ? (
                <img src={account.images[selectedImage]} alt={account.title}
                  className={`w-full aspect-video object-contain ${isSold ? 'grayscale opacity-60' : ''}`}/>
              ) : (
                /* Class art placeholder */
                <div className={`w-full aspect-video flex items-center justify-center relative bg-gradient-to-br ${cls.bg}`}>
                  <div className="absolute inset-0" style={{background:`radial-gradient(circle at 50% 55%, ${cls.glow}, transparent 60%)`}}/>
                  {/* Spinning ring */}
                  <div className="absolute inset-8 rounded-full border border-white/5 spin-slow pointer-events-none"/>
                  <div className="absolute inset-16 rounded-full border border-white/[0.03] spin-slow-rev pointer-events-none"/>
                  {/* Big kanji bg */}
                  <div className="absolute inset-0 flex items-center justify-center text-[180px] leading-none font-black opacity-[0.04] select-none pointer-events-none" style={{fontFamily:'serif'}}>
                    {cls.kanji}
                  </div>
                  {/* Shuriken corners */}
                  <div className="absolute top-4 left-4 opacity-[0.08]"><Shuriken size={40} className="spin-slow"/></div>
                  <div className="absolute bottom-4 right-4 opacity-[0.06]"><Shuriken size={30} className="spin-slow-rev"/></div>
                  {/* Center NinjaMask art */}
                  <div className={`relative z-10 text-center ${isSold ? 'opacity-40' : ''}`}>
                    <div className="float-slow inline-block">
                      <NinjaMask size={110}/>
                    </div>
                    </div>
                  {isSold && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                      <span className="text-red-400 font-black text-2xl border-2 border-red-600/80 px-8 py-2 rounded rotate-[-10deg] bg-black/40">
                        ĐÃ BÁN
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {account.images && account.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {account.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-primary shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'border-gray-800 hover:border-gray-600'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}

            {/* Guarantee strip */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { icon:'⚡', label:'Giao tức thì' },
                { icon:'🔒', label:'Bảo mật TK' },
                { icon:'🔄', label:'Hoàn tiền 100%' },
              ].map((g,i) => (
                <div key={i} className="rounded-xl border border-gray-800 bg-gray-900/40 px-2 py-2.5 text-center">
                  <div className="text-xl mb-1">{g.icon}</div>
                  <p className="text-gray-400 text-xs font-medium">{g.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-4">

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Trạng thái</p>
                {account.status === 'available' && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 inline-block shadow-[0_0_6px_rgba(74,222,128,0.6)]"/>
                      <span className="text-green-400 font-bold">Còn hàng</span>
                    </div>
                    <p className="text-gray-500 text-xs">Sẵn sàng giao ngay</p>
                  </div>
                )}
                {isSold && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-gray-500 inline-block"/>
                      <span className="text-gray-400 font-bold">Đã bán</span>
                    </div>
                    <p className="text-gray-600 text-xs">Tài khoản không còn</p>
                  </div>
                )}
                {isPending && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/>
                      <span className="text-yellow-400 font-bold">Đang xử lý</span>
                    </div>
                    <p className="text-gray-500 text-xs">Chờ xác nhận thanh toán</p>
                  </div>
                )}
              </div>

              {account.class_name && (
                <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Class</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{classIcon(account.class_name)}</span>
                    <span className={`font-bold text-lg ${cls.text}`}>{account.class_name}</span>
                  </div>
                </div>
              )}

              {account.server_name && (
                <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Server</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{account.server_name.includes('VIP') ? '⭐' : account.server_name.includes('Mới') ? '✨' : '🌐'}</span>
                    <span className={`font-bold text-base ${isVIP ? 'text-yellow-400' : isNew ? 'text-green-400' : 'text-blue-300'}`}>
                      {account.server_name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Price card */}
            <div className="rounded-2xl border border-gray-700 overflow-hidden" style={{background:'linear-gradient(135deg,#0d1625,#111827)'}}>
              <div className="px-5 pt-5 pb-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Giá bán</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl sm:text-5xl font-black text-primary price-glow leading-none">{formatPrice(account.price)}</span>
                  {discount > 0 && (
                    <div className="pb-1">
                      <span className="text-gray-500 line-through text-lg block">{formatPrice(account.original_price)}</span>
                      <span className="text-red-400 text-sm font-bold">Giảm {discount}%</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-800 px-5 py-3 flex items-center gap-2">
                <FiShield size={13} className="text-green-500"/>
                <span className="text-xs text-gray-400">Thanh toán an toàn · Hoàn tiền 100% nếu không giao được</span>
              </div>
            </div>

            {/* Action buttons */}
            {account.status === 'available' ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleBuyNow}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 text-base font-bold rounded-xl">
                  <FiZap size={18}/> Mua ngay
                </button>
                <button onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-base font-semibold rounded-xl border transition-all ${
                    inCart ? 'border-green-800 bg-green-900/30 text-green-400' : 'border-primary/40 bg-primary/5 text-primary hover:bg-primary/10'
                  }`}>
                  {inCart ? <><FiCheck size={18}/> Đã thêm giỏ</> : <><FiShoppingCart size={18}/> Thêm giỏ</>}
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-800 p-5 text-center bg-gray-900/30">
                <div className="text-3xl mb-2">🔒</div>
                <p className="text-gray-400 font-medium">
                  {isSold ? 'Tài khoản này đã được bán' : 'Tài khoản đang được xử lý'}
                </p>
                <p className="text-gray-600 text-sm mt-1">Xem thêm tài khoản khác bên dưới</p>
              </div>
            )}

            {/* Contact hint */}
            <div className="rounded-xl border border-gray-800/60 bg-gray-900/30 px-4 py-3 flex items-center gap-3">
              <FiUser size={14} className="text-primary flex-shrink-0"/>
              <p className="text-xs text-gray-400">
                Cần hỗ trợ? Liên hệ <span className="text-primary font-semibold">Zalo 0852 603 710</span> — phản hồi trong 5 phút
              </p>
            </div>
          </div>
        </div>

        {/* ── DESCRIPTION ────────────────────────────────────────────────── */}
        {account.description && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/20 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
              <span className="text-xl">📜</span>
              <h2 className="text-lg font-bold text-white">Mô Tả Chi Tiết</h2>
            </div>
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{account.description}</div>
          </div>
        )}

        {/* ── RELATED ────────────────────────────────────────────────────── */}
        {account.related && account.related.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <NinjaVillageBadge label="Tài Khoản Cùng Game"/>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {account.related.map(r => <AccountCard key={r.id} account={r}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
