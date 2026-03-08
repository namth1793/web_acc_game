import { FiFacebook, FiMessageSquare, FiYoutube } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-black text-lg">A</div>
              <span className="text-xl font-black"><span className="text-primary">ACC</span><span className="text-white">NINJA</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Chuyên mua bán tài khoản Ninja School Online uy tín số 1 Việt Nam. Giao dịch an toàn, nhanh chóng.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-9 h-9 bg-dark border border-dark-border rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors">
                <FiFacebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-dark border border-dark-border rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors">
                <FiYoutube size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-dark border border-dark-border rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors">
                <FiMessageSquare size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Ninja School Online</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-primary transition-colors">🥷 Tài Khoản NSO</Link></li>
              <li><Link to="/nap-the" className="hover:text-primary transition-colors">💳 Nạp Thẻ Cào</Link></li>
              <li><Link to="/nap-atm-vi" className="hover:text-primary transition-colors">🏦 Nạp ATM / Ví</Link></li>
              <li><Link to="/tin-tuc" className="hover:text-primary transition-colors">📰 Tin Tức</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Hỗ Trợ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">Hướng dẫn mua</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Liên hệ hỗ trợ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Liên Hệ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📞 0852.603.710</li>
              <li>🕐 Hỗ trợ 24/7</li>
              <li>💬 Zalo: 0852603710</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-sm">© 2026 ACCNINJA. Tất cả quyền được bảo lưu.</p>
          <p className="text-gray-600 text-xs">Mua bán tài khoản game uy tín, an toàn.</p>
        </div>
      </div>
    </footer>
  );
}
