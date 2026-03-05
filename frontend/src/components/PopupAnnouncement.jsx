import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FiX } from 'react-icons/fi';

const SESSION_KEY = 'popup_shown';
let _handled = false; // module-level guard: prevents StrictMode double-effect

export default function PopupAnnouncement() {
  const [visible, setVisible] = useState(false);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    if (_handled) return;
    _handled = true;

    try { if (localStorage.getItem(SESSION_KEY)) return; } catch {}

    api.get('/settings/popup').then(r => {
      if (r.data.enabled) {
        setPopup(r.data);
        setVisible(true);
        try { localStorage.setItem(SESSION_KEY, '1'); } catch {}
      }
    }).catch(() => {});
  }, []);

  const close = () => setVisible(false);

  if (!visible || !popup) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && close()}>
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-gray-700"
        style={{background:'linear-gradient(135deg,#0d1625,#111827)'}}>

        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-red-500 to-primary"/>

        <div className="relative px-6 pt-6 pb-4">
          <button onClick={close}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
            <FiX size={16}/>
          </button>
          <div className="text-4xl mb-3">🥷</div>
          <h2 className="text-xl font-black text-white leading-snug">{popup.title}</h2>
          {popup.content && (
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">{popup.content}</p>
          )}
        </div>

        {popup.news && popup.news.length > 0 && (
          <div className="px-6 pb-5 space-y-2.5">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">📢 Tin tức</p>
            {popup.news.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-800/40 rounded-xl px-4 py-2.5 border border-gray-700/40">
                <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}