import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';

export default function AdminSettings() {
  const [popup, setPopup] = useState({ enabled: true, title: '', content: '', news: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newNews, setNewNews] = useState({ icon: '🔥', text: '' });

  useEffect(() => {
    api.get('/admin/settings/popup').then(r => setPopup(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings/popup', popup);
      toast.success('Đã lưu cài đặt popup!');
    } catch { toast.error('Lỗi lưu!'); }
    finally { setSaving(false); }
  };

  const addNews = () => {
    if (!newNews.text.trim()) return;
    setPopup(p => ({ ...p, news: [...p.news, { ...newNews }] }));
    setNewNews({ icon: '📢', text: '' });
  };

  const removeNews = (idx) => setPopup(p => ({ ...p, news: p.news.filter((_, i) => i !== idx) }));

  const updateNewsText = (idx, text) => setPopup(p => ({
    ...p, news: p.news.map((n, i) => i === idx ? { ...n, text } : n)
  }));

  const updateNewsIcon = (idx, icon) => setPopup(p => ({
    ...p, news: p.news.map((n, i) => i === idx ? { ...n, icon } : n)
  }));

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải...</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Cài Đặt Popup Chào Mừng</h1>
          <p className="text-gray-400 text-sm mt-0.5">Popup hiện mỗi lần khách mở trình duyệt vào web</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <FiSave size={15}/> {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      <div className="card p-5 space-y-5">
        {/* Enable/disable */}
        <div className="flex items-center justify-between py-2 border-b border-dark-border">
          <div>
            <p className="text-white font-medium">Bật popup chào mừng</p>
            <p className="text-gray-500 text-xs mt-0.5">Hiện popup khi khách vào trang chủ</p>
          </div>
          <button onClick={() => setPopup(p => ({ ...p, enabled: !p.enabled }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${popup.enabled ? 'bg-primary' : 'bg-gray-700'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${popup.enabled ? 'left-7' : 'left-1'}`}/>
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Tiêu đề popup</label>
          <input className="input text-sm" value={popup.title}
            onChange={e => setPopup(p => ({ ...p, title: e.target.value }))}
            placeholder="🎉 Chào Mừng Đến Với ACCNINJA!"/>
        </div>

        {/* Content */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Nội dung giới thiệu</label>
          <textarea rows={3} className="input resize-none text-sm" value={popup.content}
            onChange={e => setPopup(p => ({ ...p, content: e.target.value }))}
            placeholder="Mô tả ngắn về shop..."/>
        </div>

        {/* News items */}
        <div>
          <label className="text-xs text-gray-400 mb-2 block font-bold uppercase tracking-wider">Tin tức mới nhất ({popup.news.length} mục)</label>
          <div className="space-y-2 mb-3">
            {popup.news.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-dark rounded-lg px-3 py-2 border border-dark-border">
                <input className="w-10 text-center bg-transparent border border-dark-border rounded text-sm py-1"
                  value={item.icon} onChange={e => updateNewsIcon(i, e.target.value)}/>
                <input className="flex-1 bg-transparent text-sm text-gray-300 outline-none"
                  value={item.text} onChange={e => updateNewsText(i, e.target.value)}/>
                <button onClick={() => removeNews(i)} className="text-red-400 hover:text-red-300 flex-shrink-0"><FiTrash2 size={13}/></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="w-12 text-center input text-sm" value={newNews.icon}
              onChange={e => setNewNews(n => ({ ...n, icon: e.target.value }))} placeholder="🔥"/>
            <input className="flex-1 input text-sm" value={newNews.text}
              onChange={e => setNewNews(n => ({ ...n, text: e.target.value }))}
              placeholder="Tin tức mới..." onKeyDown={e => e.key === 'Enter' && addNews()}/>
            <button onClick={addNews} className="btn-primary flex items-center gap-1 px-4 text-sm">
              <FiPlus size={14}/> Thêm
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      {popup.enabled && (
        <div className="mt-6">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">Preview</p>
          <div className="rounded-2xl border border-gray-700 overflow-hidden max-w-sm" style={{background:'#0d1625'}}>
            <div className="h-1.5 bg-gradient-to-r from-primary via-red-500 to-primary"/>
            <div className="px-5 pt-5 pb-4">
              <div className="text-3xl mb-2">🥷</div>
              <h2 className="text-base font-black text-white">{popup.title || '(tiêu đề)'}</h2>
              {popup.content && <p className="text-gray-400 text-xs mt-1">{popup.content}</p>}
            </div>
            {popup.news.length > 0 && (
              <div className="px-5 pb-4 space-y-1.5">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">📢 Tin tức</p>
                {popup.news.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 bg-gray-800/40 rounded-lg px-3 py-2 border border-gray-700/30">
                    <span className="text-sm flex-shrink-0">{item.icon}</span>
                    <p className="text-gray-300 text-xs">{item.text}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="px-5 pb-5 pt-2">
              <div className="w-full bg-primary/80 text-white text-sm font-bold py-2.5 rounded-xl text-center">Đã hiểu, vào xem! 🚀</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}