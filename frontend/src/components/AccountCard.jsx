import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const classColor = CLASS_COLORS[account.class_name] || 'text-gray-400 bg-gray-800 border-gray-700';
  const isVIP  = account.server_name?.includes('VIP');
  const isNew  = account.server_name?.includes('Mới');
  const isHot  = (account.view_count > 5 || account.price >= 3000000) && !isVIP;
  const discount = account.original_price > account.price
    ? Math.round((1 - account.price / account.original_price) * 100) : 0;

  const classBg   = CLASS_BG[account.class_name]   || 'from-orange-950 via-slate-900 to-gray-950';
  const classGlow = CLASS_GLOW[account.class_name] || 'rgba(249,115,22,0.25)';

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (account.status !== 'available') return;
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (!cart.some(i => i.id === account.id)) {
        cart.push(account);
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));
      }
    } catch {}
    navigate('/thanh-toan');
  };

  return (
    <Link to={`/tai-khoan/${account.id}`}
      className="relative rounded-xl overflow-hidden flex flex-col group"
      style={{background:'#0d1625', border:'1px solid #1e2d40', boxShadow:'0 2px 12px rgba(0,0,0,0.4)', transition:'transform 0.18s,box-shadow 0.18s'}}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(249,115,22,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.4)'; }}>

      {/* Corner ribbon badge */}
      {(isVIP || isHot || isNew) && (
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10 pointer-events-none">
          <div className={`absolute -top-0.5 -right-5 rotate-45 text-white text-[10px] font-black px-6 py-1 shadow-lg ${
            isVIP ? 'bg-yellow-500' : isHot ? 'bg-red-500' : 'bg-green-500'}`}>
            {isVIP ? 'VIP' : isHot ? 'HOT' : 'NEW'}
          </div>
        </div>
      )}
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded shadow-lg">
          -{discount}%
        </div>
      )}

      {/* Image / Art area */}
      <div className="relative h-44 overflow-hidden flex-shrink-0">
        {account.images?.[0] ? (
          <img src={account.images[0]} alt={account.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${account.status === 'sold' ? 'grayscale opacity-50' : ''}`}/>
        ) : (
          <div className={`w-full h-full flex items-center justify-center relative bg-gradient-to-br ${classBg}`}>
            <div className="absolute inset-0" style={{background:`radial-gradient(circle at 50% 60%, ${classGlow}, transparent 65%)`}}/>
            <div className="absolute top-1 right-1 opacity-[0.08]"><Shuriken size={52} className="text-white spin-slow"/></div>
            <div className={`relative z-10 text-7xl group-hover:scale-110 transition-transform drop-shadow-2xl ${account.status === 'sold' ? 'opacity-30' : ''}`}>
              {classIcon(account.class_name)}
            </div>
            {account.status === 'sold' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-red-400 font-black text-lg border-2 border-red-600/80 px-5 py-1 rounded rotate-[-12deg] bg-black/40">ĐÃ BÁN</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1 border-t border-gray-800/60">
        <h3 className="text-primary font-black text-sm leading-snug mb-2 line-clamp-2 text-center group-hover:text-orange-300 transition-colors">
          {account.title}
        </h3>
        <div className="flex flex-wrap gap-1 justify-center mb-3">
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
        <div className="mt-auto">
          <div className="flex items-baseline justify-center gap-2 mb-3">
            <p className="text-primary font-black text-lg price-glow leading-none">{formatPrice(account.price)}</p>
            {account.original_price > account.price && (
              <p className="text-gray-600 text-xs line-through">{formatPrice(account.original_price)}</p>
            )}
          </div>
          {account.status === 'available' ? (
            <button onClick={handleBuyNow}
              className="w-full py-2.5 rounded-xl font-black text-sm text-black shadow-lg active:scale-95 transition-all"
              style={{background:'linear-gradient(to bottom, #fbbf24, #d97706)', border:'2px solid #f59e0b', letterSpacing:'0.05em'}}>
              ⚡ MUA NGAY
            </button>
          ) : (
            <div className="w-full py-2.5 rounded-xl text-center text-xs text-gray-600 font-bold border border-gray-800 bg-gray-900/40">
              Hết hàng
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}