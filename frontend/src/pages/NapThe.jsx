import { useState } from 'react';
import { Link } from 'react-router-dom';

const THE_MENH = [
  { menhgia: '10.000đ', nhan: '10.000 xu', img: '💳' },
  { menhgia: '20.000đ', nhan: '20.000 xu', img: '💳' },
  { menhgia: '50.000đ', nhan: '55.000 xu', img: '💳', bonus: '+5K' },
  { menhgia: '100.000đ', nhan: '115.000 xu', img: '💳', bonus: '+15K' },
  { menhgia: '200.000đ', nhan: '240.000 xu', img: '💳', bonus: '+40K' },
  { menhgia: '500.000đ', nhan: '620.000 xu', img: '💳', bonus: '+120K' },
];

const NHA_MANG = [
  { id: 'viettel', label: 'Viettel', color: 'from-red-900/40 to-red-800/20 border-red-800' },
  { id: 'mobifone', label: 'Mobifone', color: 'from-blue-900/40 to-blue-800/20 border-blue-800' },
  { id: 'vinaphone', label: 'Vinaphone', color: 'from-purple-900/40 to-purple-800/20 border-purple-800' },
  { id: 'gmobile', label: 'Gmobile', color: 'from-green-900/40 to-green-800/20 border-green-800' },
];

export default function NapThe() {
  const [nhaMang, setNhaMang] = useState('');
  const [serial, setSerial] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [menh, setMemh] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          Nạp Thẻ <span className="text-primary">Cào</span>
        </h1>
        <p className="text-gray-400">Nạp thẻ cào để mua tài khoản Ninja School Online nhanh chóng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form nạp thẻ */}
        <div className="card p-6">
          <h2 className="font-bold text-white text-lg mb-5">Nhập Thông Tin Thẻ</h2>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-white mb-2">Đã nhận thẻ!</h3>
              <p className="text-gray-400 mb-1">Thẻ đang được xử lý tự động.</p>
              <p className="text-gray-400 mb-5">Xu sẽ được cộng vào tài khoản trong 1-3 phút.</p>
              <button onClick={() => { setSubmitted(false); setSerial(''); setPinCode(''); setMemh(''); setNhaMang(''); }}
                className="btn-outline">Nạp thẻ khác</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nhà mạng */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Nhà mạng *</label>
                <div className="grid grid-cols-2 gap-2">
                  {NHA_MANG.map(nm => (
                    <button
                      key={nm.id} type="button"
                      onClick={() => setNhaMang(nm.id)}
                      className={`p-3 rounded-xl border bg-gradient-to-br text-sm font-medium transition-all ${nm.color} ${nhaMang === nm.id ? 'ring-2 ring-primary' : 'hover:opacity-80'}`}
                    >
                      {nm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mệnh giá */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Mệnh giá *</label>
                <div className="grid grid-cols-3 gap-2">
                  {THE_MENH.map(t => (
                    <button
                      key={t.menhgia} type="button"
                      onClick={() => setMemh(t.menhgia)}
                      className={`p-2.5 rounded-xl border text-sm font-medium transition-all relative ${menh === t.menhgia ? 'bg-primary border-primary text-white' : 'border-dark-border text-gray-300 hover:border-primary hover:text-primary'}`}
                    >
                      {t.menhgia}
                      {t.bonus && <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-xs px-1 rounded-full font-bold">{t.bonus}</span>}
                    </button>
                  ))}
                </div>
                {menh && (
                  <p className="text-xs text-green-400 mt-1.5">
                    Nhận: {THE_MENH.find(t => t.menhgia === menh)?.nhan}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Số serial *</label>
                <input type="text" className="input" required placeholder="VD: 12345678901234"
                  value={serial} onChange={e => setSerial(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Mã thẻ (Pin) *</label>
                <input type="text" className="input" required placeholder="VD: 123456789012"
                  value={pinCode} onChange={e => setPinCode(e.target.value)} />
              </div>

              <button type="submit" disabled={!nhaMang || !menh} className="btn-primary w-full py-3">
                Nạp Thẻ Ngay
              </button>
            </form>
          )}
        </div>

        {/* Hướng dẫn & bảng giá */}
        <div className="space-y-5">
          {/* Bảng quy đổi */}
          <div className="card p-5">
            <h3 className="font-bold text-white mb-3">Bảng Quy Đổi Xu</h3>
            <div className="space-y-2">
              {THE_MENH.map(t => (
                <div key={t.menhgia} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                  <span className="text-gray-300 text-sm">{t.img} {t.menhgia}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-medium text-sm">{t.nhan}</span>
                    {t.bonus && <span className="text-yellow-400 text-xs bg-yellow-900/30 px-1.5 py-0.5 rounded-full border border-yellow-800">Bonus {t.bonus}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lưu ý */}
          <div className="card p-5 border-yellow-900/50">
            <h3 className="font-bold text-yellow-400 mb-3">⚠️ Lưu Ý</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Chỉ chấp nhận thẻ cào chưa qua sử dụng</li>
              <li>• Nhập đúng mã PIN và serial, sai 3 lần bị khóa</li>
              <li>• Mỗi thẻ chỉ sử dụng 1 lần duy nhất</li>
              <li>• Xu được cộng tự động trong 1-3 phút</li>
              <li>• Cần hỗ trợ: liên hệ <span className="text-primary">Zalo 0901234567</span></li>
            </ul>
          </div>

          {/* Alt method */}
          <div className="card p-4 bg-primary/5 border-primary/20">
            <p className="text-sm text-gray-300">Cũng có thể nạp qua <Link to="/nap-atm-vi" className="text-primary font-medium hover:underline">ATM / Ví điện tử</Link> để nhận thêm ưu đãi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
