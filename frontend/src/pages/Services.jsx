import { useEffect, useState } from 'react';
import { FiChevronRight, FiMessageSquare } from 'react-icons/fi';
import api from '../api/axios';

const CATEGORY_LABEL = { game: '🎮 Game', vps: '🖥️ VPS', proxy: '🌐 Proxy' };

const CATEGORY_COLORS = {
  game:  { border: 'border-primary/30',  badge: 'bg-primary/15 text-primary border-primary/30',         glow: 'rgba(249,115,22,0.08)' },
  vps:   { border: 'border-blue-700/30', badge: 'bg-blue-900/20 text-blue-400 border-blue-700/40',      glow: 'rgba(59,130,246,0.08)' },
  proxy: { border: 'border-green-700/30',badge: 'bg-green-900/20 text-green-400 border-green-700/40',   glow: 'rgba(34,197,94,0.08)' },
};

const ZALO = '0852603710';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data)).finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(services.map(s => s.category))];
  const filtered = activeCategory === 'all' ? services : services.filter(s => s.category === activeCategory);

  const handleContact = (service) => {
    const msg = encodeURIComponent(`Xin chào! Tôi muốn hỏi về dịch vụ "${service.name}"`);
    window.open(`https://zalo.me/${ZALO}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen pb-16">

      {/* Hero */}
      <div className="relative overflow-hidden" style={{background:'linear-gradient(135deg,#0a0f1a 0%,#0f172a 50%,#0a1a0a 100%)'}}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute right-8 top-4 text-[100px] sm:text-[220px] leading-none font-black opacity-[0.025] text-green-400 select-none" style={{fontFamily:'serif'}}>服</div>
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
          style={{background:'radial-gradient(ellipse at 30% 50%, rgba(34,197,94,0.08) 0%, transparent 60%)'}}/>
        <div className="relative max-w-5xl mx-auto px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-green-900/20 border border-green-800/40 text-green-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            ⚡ Dịch Vụ Chuyên Nghiệp
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-3 title-glow">
            Dịch Vụ <span className="text-green-400">ACCNINJA</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Đa dạng dịch vụ hỗ trợ — từ game đến hạ tầng kỹ thuật. Uy tín, nhanh chóng, giá tốt.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 24" fill="none" preserveAspectRatio="none" className="w-full">
            <path d="M0 24L0 12Q360 0 720 12Q1080 24 1440 12L1440 24Z" fill="#080c14"/>
          </svg>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                activeCategory === cat
                  ? 'bg-primary border-primary text-white shadow-[0_0_14px_rgba(249,115,22,0.35)]'
                  : 'border-gray-700/60 text-gray-400 hover:border-gray-600 hover:text-gray-200'
              }`}>
              {cat === 'all' ? '🌟 Tất cả' : CATEGORY_LABEL[cat] || cat}
            </button>
          ))}
        </div>

        {/* Service cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-dark-border animate-pulse" style={{background:'#0d1625',height:260}}/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Không có dịch vụ nào</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(service => {
              const colors = CATEGORY_COLORS[service.category] || CATEGORY_COLORS.game;
              return (
                <div key={service.id}
                  className={`rounded-2xl border ${colors.border} overflow-hidden flex flex-col`}
                  style={{background:`linear-gradient(135deg,#0d1625,#111827)`, boxShadow:`0 0 24px ${colors.glow}`}}>
                  {/* Header */}
                  <div className="px-6 pt-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl leading-none">{service.icon}</div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colors.badge}`}>
                        {CATEGORY_LABEL[service.category] || service.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">{service.name}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
                  </div>

                  {/* Price / Note */}
                  <div className="px-6 py-3 border-t border-gray-800/60 bg-gray-900/20">
                    {service.base_price ? (
                      <div className="flex items-center gap-1">
                        <span className="text-primary font-black text-lg">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.base_price)}
                        </span>
                        {!service.is_price_fixed && <span className="text-gray-500 text-xs">/ có thể thỏa thuận</span>}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 text-sm font-bold">💬 Liên hệ báo giá</span>
                      </div>
                    )}
                    {service.note && (
                      <p className="text-gray-600 text-xs mt-1 italic">{service.note}</p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="px-6 py-4 mt-auto">
                    <button
                      onClick={() => handleContact(service)}
                      className="w-full flex items-center justify-center gap-2 bg-green-900/30 hover:bg-green-800/40 border border-green-800/50 hover:border-green-700 text-green-400 font-bold py-2.5 rounded-xl transition-all text-sm group"
                    >
                      <FiMessageSquare size={15}/>
                      Liên hệ Zalo ngay
                      <FiChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform"/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA bottom */}
        <div className="mt-12 rounded-2xl border border-gray-800 p-5 sm:p-8 text-center" style={{background:'#0d1625'}}>
          <div className="text-4xl mb-3">📞</div>
          <h3 className="text-xl font-black text-white mb-2">Cần tư vấn thêm?</h3>
          <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
            Đội ngũ hỗ trợ 24/7 sẵn sàng giải đáp mọi thắc mắc và báo giá chi tiết theo nhu cầu của bạn.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={`https://zalo.me/${ZALO}`} target="_blank" rel="noreferrer"
              className="btn-primary flex items-center gap-2 px-6 py-3">
              <FiMessageSquare size={16}/> Chat Zalo: {ZALO}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}