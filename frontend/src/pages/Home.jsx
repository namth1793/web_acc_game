import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import { Shuriken, NinjaVillageBadge } from '../components/NinjaArt';
import bannerImg from '../assets/banner.jpg';
import { FiSearch, FiFilter, FiX, FiZap, FiShield, FiTrendingUp } from 'react-icons/fi';

// ── Ticker ──
const TICKER_ITEMS = [
  '🔥 Vừa bán: Acc NSO S1 Kiếm Sĩ Lv200 Full VIP',
  '⚡ Flash sale: Server VIP giảm 20%',
  '🎁 Nạp thẻ từ 200K tặng thêm 40K xu',
  '✅ Hỗ trợ 24/7 qua Zalo: 0901 234 567',
  '🥷 Mới về: 5 acc Ninja School Server Mới cực hot',
  '💎 Tài khoản VIP MAX level 250 đang chờ bạn',
];

const STATS = [
  { icon: '🥷', value: '500+', label: 'Tài khoản đã bán' },
  { icon: '⚡', value: '< 5 phút', label: 'Giao ngay sau TT' },
  { icon: '⭐', value: '4.9/5', label: 'Đánh giá' },
  { icon: '🛡️', value: '100%', label: 'Bảo đảm hoàn tiền' },
];

const CLASS_COLORS = {
  'Kunai': 'text-orange-400 bg-orange-900/30 border-orange-800',
  'Kiếm':  'text-red-400 bg-red-900/30 border-red-800',
  'Tiêu':  'text-cyan-400 bg-cyan-900/30 border-cyan-800',
  'Đao':   'text-purple-400 bg-purple-900/30 border-purple-800',
  'Quạt':  'text-pink-400 bg-pink-900/30 border-pink-800',
  'Cung':  'text-green-400 bg-green-900/30 border-green-800',
};

function serverColor(name) {
  if (name?.includes('VIP'))  return 'text-yellow-300 bg-yellow-900/40 border-yellow-700';
  if (name?.includes('Mới'))  return 'text-green-300 bg-green-900/40 border-green-700';
  return 'text-blue-300 bg-blue-900/40 border-blue-800';
}

export function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
}

function classIcon(name) {
  const icons = { 'Kunai':'🗡️', 'Kiếm':'⚔️', 'Tiêu':'🎯', 'Đao':'🔱', 'Quạt':'🪭', 'Cung':'🏹' };
  return icons[name] || '🥷';
}

// ── NSO Card ──
function NSOCard({ account }) {
  const navigate = useNavigate();
  const classColor = CLASS_COLORS[account.class_name] || 'text-gray-400 bg-gray-800 border-gray-700';
  const isVIP = account.server_name?.includes('VIP');
  const isNew = account.server_name?.includes('Mới');
  const isHot = (account.view_count > 5 || account.price >= 3000000) && !isVIP;
  const discount = account.original_price > account.price
    ? Math.round((1 - account.price / account.original_price) * 100) : 0;

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

  const CLASS_BG_MAP = { 'Kunai':'from-orange-950 via-slate-900 to-gray-950', 'Kiếm':'from-red-950 via-slate-900 to-gray-950', 'Tiêu':'from-cyan-950 via-slate-900 to-gray-950', 'Đao':'from-purple-950 via-slate-900 to-gray-950', 'Quạt':'from-pink-950 via-slate-900 to-gray-950', 'Cung':'from-green-950 via-slate-900 to-gray-950' };
  const CLASS_GLOW_MAP = { 'Kunai':'rgba(249,115,22,0.25)', 'Kiếm':'rgba(239,68,68,0.25)', 'Tiêu':'rgba(6,182,212,0.25)', 'Đao':'rgba(168,85,247,0.25)', 'Quạt':'rgba(236,72,153,0.25)', 'Cung':'rgba(34,197,94,0.25)' };
  const classBg   = CLASS_BG_MAP[account.class_name]   || 'from-orange-950 via-slate-900 to-gray-950';
  const classGlow = CLASS_GLOW_MAP[account.class_name] || 'rgba(249,115,22,0.25)';

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

// ── Live tables helpers ───────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h/24)} ngày trước`;
}

// Transactions table — static list
function RecentTransactions({ items }) {
  if (items.length === 0) return (
    <div className="flex items-center justify-center h-32 text-gray-600 text-sm">Chưa có giao dịch</div>
  );

  return (
    <div className="overflow-y-auto" style={{maxHeight: 44*8}}>
      {items.map((t, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/60 hover:bg-gray-800/20 transition-colors">
          <span className="text-lg flex-shrink-0">{classIcon(t.class_name)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{t.buyer_name} vừa mua</p>
            <p className="text-gray-500 text-xs truncate">{t.title}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-primary text-xs font-bold">{formatPrice(t.price)}</p>
            <p className="text-gray-600 text-xs">{timeAgo(t.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main ──
export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [servers, setServers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ server_id: '', class_id: '', min_price: '', max_price: '', search: '', sort: 'newest' });
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [topDepositors, setTopDepositors] = useState([]);

  useEffect(() => {
    api.get('/games/1/servers').then(r => setServers(r.data));
    api.get('/games/1/classes').then(r => setClasses(r.data));
    // Live tables — refresh every 30s
    const fetchLive = () => {
      api.get('/stats/recent-transactions').then(r => setTransactions(r.data)).catch(() => {});
      api.get('/stats/top-depositors').then(r => setTopDepositors(r.data)).catch(() => {});
    };
    fetchLive();
    const liveTimer = setInterval(fetchLive, 30000);
    return () => clearInterval(liveTimer);
  }, []);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, game_id: 1, page, limit: 12 };
      Object.keys(params).forEach(k => (params[k] === '' || params[k] === null) && delete params[k]);
      const res = await api.get('/accounts', { params });
      setAccounts(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };
  const clearFilters = () => { setFilters({ server_id: '', class_id: '', min_price: '', max_price: '', search: '', sort: 'newest' }); setPage(1); };
  const activeCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;

  return (
    <div className="min-h-screen">

      {/* ── TICKER ── */}
      <div className="bg-red-950/60 border-b border-red-900/40 py-2 overflow-hidden">
        <div className="ticker-wrap">
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="text-sm text-red-200/90 flex-shrink-0 px-8">
                {item}<span className="mx-6 text-red-800">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden hero-noise" style={{background:'linear-gradient(135deg,#0a0f1a 0%,#0f172a 40%,#1a0a0a 100%)'}}>
        {/* BG deco */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="absolute -right-6 top-2 text-[120px] sm:text-[260px] leading-none font-black opacity-[0.025] text-orange-400 select-none" style={{fontFamily:'serif'}}>忍</div>
          <div className="absolute top-10 left-10 text-primary/10 float"><Shuriken size={55} className="spin-slow"/></div>
          <div className="absolute bottom-8 left-1/4 text-primary/8 float" style={{animationDelay:'1.5s'}}><Shuriken size={30} className="spin-slow-rev"/></div>
          <div className="absolute top-14 right-1/3 text-red-500/8 float" style={{animationDelay:'3s'}}><Shuriken size={42} className="spin-slow"/></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] rounded-full opacity-15 pointer-events-none"
            style={{background:'radial-gradient(ellipse,rgba(249,115,22,0.4) 0%,transparent 70%)'}}/>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-18">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <NinjaVillageBadge label="Ninja School Online Shop" className="mb-4 fade-in-up"/>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 fade-in-up-2 title-glow">
                MUA BÁN TÀI KHOẢN<br/>
                <span className="text-primary">NINJA SCHOOL</span><br/>
                <span className="text-2xl sm:text-3xl text-gray-400 font-bold">Uy Tín · Nhanh · Giá Tốt</span>
              </h1>
              <p className="text-gray-400 text-lg mb-7 max-w-lg fade-in-up-3">
                Shop NSO hàng đầu Việt Nam — Hàng trăm tài khoản chất lượng, giao dịch tức thì sau thanh toán.
              </p>
              <div className="flex gap-3 max-w-lg fade-in-up-3">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                  <input type="text" placeholder="Tìm acc, server, class..."
                    className="input pl-11 py-3 text-base rounded-xl"
                    value={filters.search} onChange={e => setFilter('search', e.target.value)}/>
                </div>
                <button className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2">
                  <FiZap size={16}/> Tìm
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-5 fade-in-up-3">
                {classes.map(c => (
                  <button key={c.id} onClick={() => setFilter('class_id', filters.class_id === String(c.id) ? '' : String(c.id))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      filters.class_id === String(c.id) ? 'bg-primary border-primary text-white' : 'border-gray-700 text-gray-400 hover:border-primary hover:text-primary'
                    }`}>
                    {classIcon(c.name)} {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero art */}
            <div className="flex items-center justify-center mt-6 lg:mt-0">
              <img src={bannerImg} alt="ACCNINJA Banner" className="rounded-2xl shadow-2xl max-h-64 sm:max-h-80 w-full object-cover"/>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 28" fill="none" preserveAspectRatio="none" className="w-full">
            <path d="M0 28L0 14Q360 0 720 14Q1080 28 1440 14L1440 28Z" fill="#080c14"/>
          </svg>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="border-b border-gray-800/50" style={{background:'linear-gradient(90deg,#0a0f1a,#111827,#0a0f1a)'}}>
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s,i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-primary/20 transition-colors">{s.icon}</div>
                <div>
                  <p className="font-black text-white text-base leading-none">{s.value}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SERVER TABS ── */}
      <div className="max-w-7xl mx-auto px-4 mt-7 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <FiShield size={14} className="text-primary"/>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Server:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('server_id', '')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${!filters.server_id ? 'bg-primary border-primary text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]' : 'border-gray-700/60 text-gray-500 hover:border-gray-600 hover:text-gray-300'}`}>
            Tất cả
          </button>
          {servers.map(s => (
            <button key={s.id} onClick={() => setFilter('server_id', filters.server_id === String(s.id) ? '' : String(s.id))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filters.server_id === String(s.id)
                  ? s.name.includes('VIP') ? 'bg-yellow-600 border-yellow-500 text-white shadow-[0_0_12px_rgba(234,179,8,0.4)]'
                    : 'bg-primary border-primary text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                  : s.name.includes('VIP') ? 'border-yellow-900/60 text-yellow-600 hover:border-yellow-700 hover:text-yellow-400'
                  : s.name.includes('Mới') ? 'border-green-900/60 text-green-600 hover:border-green-700 hover:text-green-400'
                  : 'border-gray-700/60 text-gray-500 hover:border-gray-600 hover:text-gray-300'
              }`}>
              {s.name.includes('VIP') ? '⭐ ' : s.name.includes('Mới') ? '✨ ' : ''}{s.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID + SIDEBAR ── */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={`${filterOpen ? 'block' : 'hidden'} md:block w-full md:w-52 flex-shrink-0`}>
            <div className="sticky top-20 rounded-xl border border-gray-800 overflow-hidden" style={{background:'#0d1625'}}>
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <FiFilter size={13} className="text-primary"/> Bộ Lọc
                </h3>
                {activeCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                    <FiX size={11}/> Xóa ({activeCount})
                  </button>
                )}
              </div>
              <div className="p-4 space-y-5">
                {/* Class */}
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Class</p>
                  <div className="space-y-1">
                    <button onClick={() => setFilter('class_id', '')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${!filters.class_id ? 'bg-primary/15 text-primary' : 'text-gray-400 hover:bg-gray-800/60'}`}>
                      Tất cả
                    </button>
                    {classes.map(c => (
                      <button key={c.id} onClick={() => setFilter('class_id', filters.class_id === String(c.id) ? '' : String(c.id))}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${filters.class_id === String(c.id) ? 'bg-primary/15 text-primary' : 'text-gray-400 hover:bg-gray-800/60'}`}>
                        {classIcon(c.name)} {c.name}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Price */}
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Giá</p>
                  <div className="space-y-2">
                    <input type="number" placeholder="Từ (VNĐ)" className="input text-xs py-2" value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)}/>
                    <input type="number" placeholder="Đến (VNĐ)" className="input text-xs py-2" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)}/>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {[['<500K','','500000'],['500K-1M','500000','1000000'],['1M-3M','1000000','3000000'],['>3M','3000000','']].map(([l,mn,mx])=>(
                      <button key={l} onClick={()=>{setFilter('min_price',mn);setFilter('max_price',mx);}}
                        className="text-xs text-gray-500 hover:text-primary border border-gray-800 hover:border-primary/40 rounded px-2 py-1 transition-all">
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setFilterOpen(p=>!p)} className="md:hidden flex items-center gap-1.5 border border-gray-700 text-gray-400 hover:border-primary hover:text-primary rounded-lg py-1.5 px-3 text-xs font-medium transition-all">
                  <FiFilter size={12}/> Lọc {activeCount > 0 && `(${activeCount})`}
                </button>
                <p className="text-gray-500 text-sm">
                  {loading ? '...' : <><span className="text-white font-bold">{pagination.total}</span> tài khoản</>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <FiTrendingUp size={13} className="text-gray-600 hidden sm:block"/>
                <select className="input text-xs py-2 w-auto" value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá thấp → cao</option>
                  <option value="price_desc">Giá cao → thấp</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_,i) => (
                  <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{background:'#111827',border:'1px solid #1e293b'}}>
                    <div className="h-36 bg-gray-800/60"/>
                    <div className="p-3.5 space-y-2.5">
                      <div className="h-4 bg-gray-800 rounded w-4/5"/>
                      <div className="h-3 bg-gray-800 rounded w-1/2"/>
                      <div className="h-5 bg-gray-800 rounded w-1/3"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <div className="rounded-xl border border-gray-800 p-16 text-center" style={{background:'#0d1625'}}>
                <div className="text-6xl mb-4">🥷</div>
                <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy tài khoản</h3>
                <p className="text-gray-500 mb-5">Thử đổi bộ lọc hoặc từ khóa</p>
                <button onClick={clearFilters} className="btn-primary">Xóa bộ lọc</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {accounts.map(acc => <NSOCard key={acc.id} account={acc}/>)}
              </div>
            )}
            <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage}/>
          </div>
        </div>

        {/* ── TRUST ── */}
        <div className="mt-14 gradient-border p-6 sm:p-8">
          <div className="text-center mb-7">
            <NinjaVillageBadge label="Tại sao chọn ACCNINJA?" className="mb-3"/>
            <h2 className="text-2xl font-black text-white">Giao Dịch Uy Tín · Bảo Đảm <span className="text-primary">100%</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon:'⚡', title:'Giao ngay', desc:'Nhận tài khoản tức thì sau khi xác nhận TT' },
              { icon:'🔒', title:'Bảo mật', desc:'Thông tin & tài khoản được bảo vệ tuyệt đối' },
              { icon:'🔄', title:'Hoàn tiền', desc:'Đảm bảo hoàn 100% nếu không giao được' },
              { icon:'💬', title:'Hỗ trợ 24/7', desc:'Zalo / FB sẵn sàng hỗ trợ mọi lúc' },
            ].map((f,i) => (
              <div key={i}>
                <div className="text-4xl mb-3">{f.icon}</div>
                <h4 className="font-bold text-white mb-1.5">{f.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── LIVE TABLES ── */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Lịch sử giao dịch */}
          <div className="rounded-2xl border border-gray-800 overflow-hidden" style={{background:'#0d1625'}}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.7)]"/>
                <h3 className="font-bold text-white text-sm">Lịch Sử Giao Dịch</h3>
              </div>
              <span className="text-xs text-gray-600 italic">Cập nhật tự động</span>
            </div>
            <RecentTransactions items={transactions} />
          </div>

          {/* Top nạp thẻ */}
          <div className="rounded-2xl border border-gray-800 overflow-hidden" style={{background:'#0d1625'}}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-base">🏆</span>
                <h3 className="font-bold text-white text-sm">Top Nạp Thẻ Tháng Này</h3>
              </div>
              <span className="text-xs text-gray-600 italic">Top 10</span>
            </div>
            <div className="divide-y divide-gray-800/60">
              {topDepositors.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-600 text-sm">Chưa có dữ liệu</div>
              ) : topDepositors.map((d, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-800/20 transition-colors ${i < 3 ? 'bg-yellow-900/5' : ''}`}>
                  {/* Rank */}
                  <div className="w-7 text-center flex-shrink-0">
                    {d.badge ? (
                      <span className="text-lg">{d.badge}</span>
                    ) : (
                      <span className="text-gray-600 font-bold text-sm">{d.rank}</span>
                    )}
                  </div>
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${i === 0 ? 'text-yellow-300' : i === 1 ? 'text-gray-200' : i === 2 ? 'text-orange-300' : 'text-gray-300'}`}>
                      {d.name}
                    </p>
                    <p className="text-gray-600 text-xs">{d.orders} đơn hàng</p>
                  </div>
                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className={`font-black text-sm ${i === 0 ? 'text-yellow-400 neon-gold' : 'text-primary'}`}>
                      {formatPrice(d.total)}
                    </p>
                    {i === 0 && (
                      <p className="text-yellow-700 text-xs">Top 1 🔥</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
