import { Link } from 'react-router-dom';

const NEWS = [
  {
    id: 1,
    title: 'ACCNINJA ra mắt: Mua bán tài khoản Ninja School Online uy tín',
    date: '01/03/2026',
    category: 'Thông báo',
    excerpt: 'Chào mừng bạn đến với ACCNINJA — nền tảng mua bán tài khoản Ninja School Online uy tín, an toàn, giá tốt nhất. Giao dịch tức thì sau khi xác nhận thanh toán.',
    img: '📢',
  },
  {
    id: 2,
    title: 'Khuyến mãi tháng 3: Nạp thẻ nhận bonus xu khủng lên đến +400K',
    date: '01/03/2026',
    category: 'Khuyến mãi',
    excerpt: 'Trong tháng 3/2026, khi nạp thẻ từ 500K trở lên sẽ nhận thêm bonus 150K xu. Nạp triệu đồng nhận thêm tới 400K xu. Chương trình áp dụng đến hết 31/03/2026.',
    img: '🎁',
  },
  {
    id: 3,
    title: 'Hướng dẫn mua tài khoản NSO an toàn tránh bị lừa đảo',
    date: '28/02/2026',
    category: 'Hướng dẫn',
    excerpt: 'Để tránh bị lừa khi mua tài khoản game, bạn nên chỉ mua tại các shop uy tín có xác nhận bảo hành, tránh giao dịch riêng qua mạng xã hội không có bảo đảm.',
    img: '🔐',
  },
  {
    id: 4,
    title: 'Server VIP Ninja School Online — Top các nhân vật mạnh nhất',
    date: '25/02/2026',
    category: 'Tin game',
    excerpt: 'Server VIP của NSO tập hợp những tay chơi lâu năm nhất với trang bị khủng nhất. Xem danh sách top nhân vật và các tài khoản đang được bán tại shop.',
    img: '⚔️',
  },
  {
    id: 5,
    title: 'Cập nhật: ACCNINJA hỗ trợ thanh toán ZaloPay và MoMo',
    date: '20/02/2026',
    category: 'Thông báo',
    excerpt: 'ACCNINJA đã tích hợp thêm phương thức thanh toán qua ví MoMo và ZaloPay, giúp giao dịch nhanh chóng và tiện lợi hơn cho người chơi.',
    img: '📱',
  },
  {
    id: 6,
    title: 'Lớp nhân vật nào mạnh nhất trong Ninja School Online 2026?',
    date: '15/02/2026',
    category: 'Tin game',
    excerpt: 'Phân tích chi tiết 4 lớp nhân vật: Kiếm Sĩ, Thuật Sĩ, Cung Thủ, Ninja — mỗi lớp có điểm mạnh riêng trong PvE, PvP và đội nhóm.',
    img: '🥷',
  },
];

const CATEGORY_COLORS = {
  'Thông báo': 'badge-blue',
  'Khuyến mãi': 'badge-yellow',
  'Hướng dẫn': 'badge-green',
  'Tin game': 'badge-gray',
};

export default function TinTuc() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Tin Tức & Thông Báo</h1>
        <p className="text-gray-400">Cập nhật tin tức mới nhất về ACCNINJA và Ninja School Online</p>
      </div>

      {/* Featured news */}
      <div className="card overflow-hidden mb-8 border-primary/30">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{NEWS[0].img}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={CATEGORY_COLORS[NEWS[0].category] + ' badge'}>{NEWS[0].category}</span>
                <span className="text-gray-500 text-xs">{NEWS[0].date}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 hover:text-primary cursor-pointer transition-colors">{NEWS[0].title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{NEWS[0].excerpt}</p>
              <button className="mt-3 text-primary text-sm font-medium hover:underline">Đọc thêm →</button>
            </div>
          </div>
        </div>
      </div>

      {/* News grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {NEWS.slice(1).map(news => (
          <div key={news.id} className="card p-5 game-card-hover cursor-pointer">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{news.img}</span>
              <div>
                <span className={CATEGORY_COLORS[news.category] + ' badge text-xs'}>{news.category}</span>
              </div>
            </div>
            <h3 className="font-bold text-white text-sm leading-snug mb-2 line-clamp-2 hover:text-primary transition-colors">{news.title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-3">{news.excerpt}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-xs">{news.date}</span>
              <button className="text-primary text-xs font-medium hover:underline">Đọc thêm →</button>
            </div>
          </div>
        ))}
      </div>

      {/* Banner quảng cáo */}
      <div className="mt-10 card p-6 bg-gradient-to-r from-primary/20 to-orange-900/10 border-primary/30 text-center">
        <h3 className="text-xl font-bold text-white mb-2">🎮 Mua Ngay Tài Khoản NSO Giá Tốt</h3>
        <p className="text-gray-400 mb-4">Hàng chục tài khoản Ninja School Online đang được bán với giá ưu đãi</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          Xem tất cả tài khoản →
        </Link>
      </div>
    </div>
  );
}
