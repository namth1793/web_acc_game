import { useState } from 'react';
import { Link } from 'react-router-dom';

const METHODS = [
  {
    id: 'momo',
    label: 'Ví MoMo',
    icon: '📱',
    color: 'border-pink-800 bg-pink-900/20',
    info: { phone: '0901 234 567', name: 'NGUYEN VAN A', content: 'NAPVI {username}' },
  },
  {
    id: 'zalopay',
    label: 'ZaloPay',
    icon: '💙',
    color: 'border-blue-800 bg-blue-900/20',
    info: { phone: '0901 234 567', name: 'NGUYEN VAN A', content: 'NAPVI {username}' },
  },
  {
    id: 'banking',
    label: 'Chuyển khoản ngân hàng',
    icon: '🏦',
    color: 'border-green-800 bg-green-900/20',
    info: { bank: 'Vietcombank', account: '1234 5678 90', name: 'NGUYEN VAN A', branch: 'CN Đà Nẵng', content: 'NAPTIEN {username}' },
  },
  {
    id: 'atm',
    label: 'Thẻ ATM / NAPAS',
    icon: '💳',
    color: 'border-yellow-800 bg-yellow-900/20',
    info: { note: 'Liên hệ admin qua Zalo 0901234567 để được hỗ trợ nạp thẻ ATM trực tiếp.' },
  },
];

const PACKAGES = [
  { amount: '50.000đ', xu: '55.000 xu', bonus: '' },
  { amount: '100.000đ', xu: '115.000 xu', bonus: '+15K xu' },
  { amount: '200.000đ', xu: '240.000 xu', bonus: '+40K xu' },
  { amount: '500.000đ', xu: '650.000 xu', bonus: '+150K xu' },
  { amount: '1.000.000đ', xu: '1.400.000 xu', bonus: '+400K xu 🔥' },
  { amount: '2.000.000đ', xu: '3.000.000 xu', bonus: '+1M xu 💎' },
];

export default function NapATMVi() {
  const [selected, setSelected] = useState('momo');
  const [username, setUsername] = useState('');
  const method = METHODS.find(m => m.id === selected);

  const getContent = (tmpl) => username ? tmpl.replace('{username}', username.toUpperCase()) : tmpl.replace('{username}', 'TÊN_NHÂN_VẬT');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          Nạp <span className="text-primary">ATM / Ví Điện Tử</span>
        </h1>
        <p className="text-gray-400">Tỷ lệ ưu đãi hơn nạp thẻ cào — Xử lý trong 5-15 phút</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chọn phương thức + username */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-white mb-4">Chọn Phương Thức</h3>
            <div className="space-y-2">
              {METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selected === m.id ? 'ring-2 ring-primary ' + m.color : 'border-dark-border hover:border-gray-600'}`}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className={`text-sm font-medium ${selected === m.id ? 'text-white' : 'text-gray-300'}`}>{m.label}</span>
                  {selected === m.id && <span className="ml-auto text-primary text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <label className="text-sm text-gray-400 mb-2 block">Tên nhân vật trong game</label>
            <input type="text" className="input" placeholder="Nhập tên nhân vật NSO..."
              value={username} onChange={e => setUsername(e.target.value)} />
            <p className="text-xs text-gray-500 mt-1.5">Dùng để ghi nội dung chuyển khoản đúng</p>
          </div>
        </div>

        {/* Right: Thông tin thanh toán */}
        <div className="lg:col-span-2 space-y-5">
          {/* Payment info */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">{method.icon}</span>
              <h3 className="font-bold text-white text-lg">{method.label}</h3>
            </div>

            <div className="bg-dark rounded-xl p-4 space-y-3">
              {method.id === 'banking' ? (
                <>
                  <InfoRow label="Ngân hàng" value={method.info.bank} />
                  <InfoRow label="Số tài khoản" value={method.info.account} highlight />
                  <InfoRow label="Tên chủ TK" value={method.info.name} />
                  <InfoRow label="Chi nhánh" value={method.info.branch} />
                  <InfoRow label="Nội dung CK" value={getContent(method.info.content)} highlight />
                </>
              ) : method.id === 'atm' ? (
                <p className="text-gray-300 text-sm leading-relaxed">{method.info.note}</p>
              ) : (
                <>
                  <InfoRow label="Số điện thoại" value={method.info.phone} highlight />
                  <InfoRow label="Tên" value={method.info.name} />
                  <InfoRow label="Nội dung" value={getContent(method.info.content)} highlight />
                </>
              )}
            </div>

            {method.id !== 'atm' && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg text-sm text-yellow-300/90">
                ⚠️ Ghi đúng nội dung <span className="font-bold text-yellow-300">{getContent(method.info.content)}</span> khi chuyển tiền để được xử lý tự động.
              </div>
            )}
          </div>

          {/* Gói nạp */}
          <div className="card p-5">
            <h3 className="font-bold text-white mb-4">Gói Nạp & Tỷ Lệ Quy Đổi</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PACKAGES.map(p => (
                <div key={p.amount} className={`p-3 rounded-xl border text-center ${p.bonus.includes('💎') ? 'border-purple-700 bg-purple-900/20' : p.bonus.includes('🔥') ? 'border-orange-700 bg-orange-900/20' : p.bonus ? 'border-primary/40 bg-primary/5' : 'border-dark-border'}`}>
                  <p className="font-bold text-white text-sm">{p.amount}</p>
                  <p className="text-primary text-xs mt-0.5">{p.xu}</p>
                  {p.bonus && <p className="text-yellow-400 text-xs mt-0.5">{p.bonus}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="card p-5">
            <h3 className="font-bold text-white mb-4">Quy Trình Nạp</h3>
            <ol className="space-y-3">
              {[
                'Chọn phương thức và nhập tên nhân vật',
                'Chuyển tiền theo thông tin trên với đúng nội dung',
                'Chụp ảnh màn hình biên lai gửi qua Zalo 0901234567',
                'Admin xác nhận và cộng xu trong 5-15 phút',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">Muốn nạp thẻ cào? <Link to="/nap-the" className="text-primary hover:underline">Nhấn vào đây →</Link></p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-400 text-sm flex-shrink-0">{label}:</span>
      <span className={`font-medium text-sm text-right ${highlight ? 'text-primary' : 'text-white'}`}>{value}</span>
    </div>
  );
}
