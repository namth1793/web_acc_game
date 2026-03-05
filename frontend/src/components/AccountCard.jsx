import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shuriken } from './NinjaArt';

export function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
}

const CLASS_COLORS = {
  'Kunai': 'text-orange-400 bg-orange-900/30 border-orange-800',
  'Kiếm':  'text-red-400 bg-red-900/30 border-red-800',
  'Tiêu':  'text-cyan-400 bg-cyan-900/30 border-cyan-800',
  'Đao':   'text-purple-400 bg-purple-900/30 border-purple-800',
  'Quạt':  'text-pink-400 bg-pink-900/30 border-pink-800',
  'Cung':  'text-green-400 bg-green-900/30 border-green-800',
};

const CLASS_BG = {
  'Kunai': 'from-orange-950 via-slate-900 to-gray-950',
  'Kiếm':  'from-red-950 via-slate-900 to-gray-950',
  'Tiêu':  'from-cyan-950 via-slate-900 to-gray-950',
  'Đao':   'from-purple-950 via-slate-900 to-gray-950',
  'Quạt':  'from-pink-950 via-slate-900 to-gray-950',
  'Cung':  'from-green-950 via-slate-900 to-gray-950',
};

const CLASS_GLOW = {
  'Kunai': 'rgba(249,115,22,0.25)',
  'Kiếm':  'rgba(239,68,68,0.25)',
  'Tiêu':  'rgba(6,182,212,0.25)',
  'Đao':   'rgba(168,85,247,0.25)',
  'Quạt':  'rgba(236,72,153,0.25)',
  'Cung':  'rgba(34,197,94,0.25)',
};

function serverColor(name) {
  if (name?.includes('VIP'))  return 'text-yellow-300 bg-yellow-900/40 border-yellow-700';
  if (name?.includes('Mới'))  return 'text-green-300 bg-green-900/40 border-green-700';
  return 'text-blue-300 bg-blue-900/40 border-blue-800';
}

function classIcon(name) {
  const icons = { 'Kunai':'🗡️', 'Kiếm':'⚔️', 'Tiêu':'🎯', 'Đao':'🔱', 'Quạt':'🪭', 'Cung':'🏹' };
  return icons[name] || '🥷';
}

export default function AccountCard({ account }) {
  const [inCart, setInCart] = useState(false);

  const classColor = CLASS_COLORS[account.class_name] || 'text-gray-400 bg-gray-800 border-gray-700';
  const isVIP  = account.server_name?.includes('VIP');
  const isNew  = account.server_name?.includes('Mới');
  const isHot  = (account.view_count > 5 || account.price >= 3000000) && !isVIP;
  const discount = account.original_price > account.price
    ? Math.round((1 - account.price / account.original_price) * 100) : 0;

  const classBg   = CLASS_BG[account.class_name]   || 'from-orange-950 via-slate-900 to-gray-950';
  const classGlow = CLASS_GLOW[account.class_name] || 'rgba(249,115,22,0.25)';

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setInCart(cart.some(i => i.id === account.id));
    } catch {}
    const onStorage = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setInCart(cart.some(i => i.id === account.id));
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [account.id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (account.status !== 'available') return;
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (cart.some(i => i.id === account.id)) return;
      cart.push(account);
      localStorage.setItem('cart', JSON.stringify(cart));
      setInCart(true);
      window.dispatchEvent(new Event('storage'));
      toast.success(`Đã thêm vào giỏ hàng!`);
    } catch {}
  };

  return (
    <Link to={`/tai-khoan/${account.id}`} className="acc-card rounded-xl overflow-hidden flex flex-col group relative shine-effect">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isVIP  && <span className="badge bg-yellow-900/90 border border-yellow-600 text-xs vip-text font-bold px-2 py-0.5">⭐ VIP</span>}
        {isHot  && <span className="badge bg-red-900/90 border border-red-600 text-red-300 hot-badge text-xs px-2 py-0.5">🔥 HOT</span>}
        {isNew  && <span className="badge bg-green-900/90 border border-green-600 text-green-300 text-xs px-2 py-0.5">✨ MỚI</span>}
        {account.status === 'sold' && <span className="badge bg-black/90 border border-gray-600 text-gray-400 text-xs px-2 py-0.5">Đã bán</span>}
      </div>
      {discount > 0 && (
        <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-md shadow-lg">
          -{discount}%
        </div>
      )}

      {/* Art area */}
      <div className="relative h-36 overflow-hidden flex-shrink-0">
        {account.images?.[0] ? (
          <img src={account.images[0]} alt={account.title}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${account.status === 'sold' ? 'grayscale opacity-50' : ''}`}/>
        ) : (
          <div className={`w-full h-full flex items-center justify-center relative bg-gradient-to-br ${classBg}`}>
            <div className="absolute inset-0" style={{background:`radial-gradient(circle at 50% 60%, ${classGlow}, transparent 65%)`}}/>
            <div className="absolute top-1 right-1 opacity-[0.08]">
              <Shuriken size={46} className="text-white spin-slow"/>
            </div>
            <div className={`relative z-10 text-center ${account.status === 'sold' ? 'opacity-40' : ''}`}>
              <div className="text-5xl mb-1.5 group-hover:scale-110 transition-transform drop-shadow-lg">
                {classIcon(account.class_name)}
              </div>
            </div>
            {account.status === 'sold' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-red-400 font-black text-base border-2 border-red-600/80 px-4 py-1 rounded rotate-[-12deg] bg-black/40">ĐÃ BÁN</span>
              </div>
            )}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none"/>
      </div>

      {/* Body */}
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="text-white font-bold text-sm leading-snug mb-2.5 line-clamp-2 group-hover:text-primary transition-colors">
          {account.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {account.server_name && (
            <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${serverColor(account.server_name)}`}>
              {account.server_name}
            </span>
          )}
          {account.class_name && (
            <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${classColor}`}>
              {classIcon(account.class_name)} {account.class_name}
            </span>
          )}
        </div>
        <div className="flex items-end justify-between mt-auto pt-2.5 border-t border-gray-800/50">
          <div>
            <p className="text-primary font-black text-xl price-glow leading-none">{formatPrice(account.price)}</p>
            {account.original_price > account.price && (
              <p className="text-gray-600 text-xs line-through mt-0.5">{formatPrice(account.original_price)}</p>
            )}
          </div>
          {account.status === 'available' ? (
            <button onClick={handleAddToCart}
              className={`text-xs font-bold px-3 py-2 rounded-lg border transition-all active:scale-95 ${
                inCart ? 'bg-green-900/40 text-green-400 border-green-800' : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary hover:text-white hover:border-primary'
              }`}>
              {inCart ? '✓ Giỏ' : '+ Giỏ'}
            </button>
          ) : (
            <span className="text-xs text-gray-600 italic">Hết hàng</span>
          )}
        </div>
      </div>
    </Link>
  );
}