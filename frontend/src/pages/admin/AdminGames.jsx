import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [gameModal, setGameModal] = useState(false);
  const [editGame, setEditGame] = useState(null);
  const [gameForm, setGameForm] = useState({ name: '', slug: '', description: '', is_active: 1 });
  const [newServer, setNewServer] = useState('');
  const [newClass, setNewClass] = useState('');
  const [saving, setSaving] = useState(false);
  const [gameDetails, setGameDetails] = useState({});

  const fetchGames = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/games'); setGames(r.data); } finally { setLoading(false); }
  };

  useEffect(() => { fetchGames(); }, []);

  const toggleExpand = async (gameId) => {
    if (expanded === gameId) { setExpanded(null); return; }
    setExpanded(gameId);
    if (!gameDetails[gameId]) {
      const r = await api.get(`/games/${gameId}`);
      setGameDetails(d => ({ ...d, [gameId]: r.data }));
    }
  };

  const openAddGame = () => { setEditGame(null); setGameForm({ name: '', slug: '', description: '', is_active: 1 }); setGameModal(true); };
  const openEditGame = (g) => {
    setEditGame(g);
    setGameForm({ name: g.name, slug: g.slug, description: g.description || '', is_active: g.is_active });
    setGameModal(true);
  };

  const handleSaveGame = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editGame) await api.put(`/admin/games/${editGame.id}`, gameForm);
      else await api.post('/admin/games', gameForm);
      toast.success(editGame ? 'Cập nhật game thành công!' : 'Thêm game thành công!');
      setGameModal(false); fetchGames();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi!'); }
    finally { setSaving(false); }
  };

  const handleDeleteGame = async (id) => {
    if (!confirm('Xóa game này sẽ xóa tất cả server, class liên quan. Xác nhận?')) return;
    try { await api.delete(`/admin/games/${id}`); toast.success('Đã xóa game!'); fetchGames(); }
    catch { toast.error('Lỗi xóa game!'); }
  };

  const handleAddServer = async (gameId) => {
    if (!newServer.trim()) return;
    try {
      await api.post(`/admin/games/${gameId}/servers`, { name: newServer.trim() });
      toast.success('Thêm server thành công!');
      setNewServer('');
      const r = await api.get(`/games/${gameId}`);
      setGameDetails(d => ({ ...d, [gameId]: r.data }));
    } catch { toast.error('Lỗi!'); }
  };

  const handleDeleteServer = async (serverId, gameId) => {
    try {
      await api.delete(`/admin/servers/${serverId}`);
      const r = await api.get(`/games/${gameId}`);
      setGameDetails(d => ({ ...d, [gameId]: r.data }));
      toast.success('Đã xóa server!');
    } catch { toast.error('Lỗi!'); }
  };

  const handleAddClass = async (gameId) => {
    if (!newClass.trim()) return;
    try {
      await api.post(`/admin/games/${gameId}/classes`, { name: newClass.trim() });
      toast.success('Thêm class thành công!');
      setNewClass('');
      const r = await api.get(`/games/${gameId}`);
      setGameDetails(d => ({ ...d, [gameId]: r.data }));
    } catch { toast.error('Lỗi!'); }
  };

  const handleDeleteClass = async (classId, gameId) => {
    try {
      await api.delete(`/admin/classes/${classId}`);
      const r = await api.get(`/games/${gameId}`);
      setGameDetails(d => ({ ...d, [gameId]: r.data }));
      toast.success('Đã xóa class!');
    } catch { toast.error('Lỗi!'); }
  };

  const slugify = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Quản Lý Danh Mục Game</h1>
        <button onClick={openAddGame} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> Thêm Game</button>
      </div>

      <div className="space-y-3">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)
          : games.map(game => {
            const isExpanded = expanded === game.id;
            const details = gameDetails[game.id];
            return (
              <div key={game.id} className="card overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleExpand(game.id)}>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">🎮</div>
                    <div>
                      <p className="font-bold text-white">{game.name}</p>
                      <p className="text-gray-500 text-xs">/{game.slug} · {game.server_count} server · {game.class_count} class · {game.acc_count} tài khoản</p>
                    </div>
                    {isExpanded ? <FiChevronUp className="ml-auto text-gray-400" /> : <FiChevronDown className="ml-auto text-gray-400" />}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={game.is_active ? 'badge-green' : 'badge-gray'}>{game.is_active ? 'Hoạt động' : 'Ẩn'}</span>
                    <button onClick={() => openEditGame(game)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDeleteGame(game.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg"><FiTrash2 size={14} /></button>
                  </div>
                </div>

                {isExpanded && details && (
                  <div className="border-t border-dark-border p-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Servers */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-3">Server</h4>
                      <div className="space-y-1.5 mb-3">
                        {details.servers?.map(s => (
                          <div key={s.id} className="flex items-center justify-between bg-dark rounded-lg px-3 py-2">
                            <span className="text-white text-sm">{s.name}</span>
                            <button onClick={() => handleDeleteServer(s.id, game.id)} className="text-gray-600 hover:text-red-400 transition-colors"><FiTrash2 size={13} /></button>
                          </div>
                        ))}
                        {details.servers?.length === 0 && <p className="text-gray-600 text-xs">Chưa có server nào</p>}
                      </div>
                      <div className="flex gap-2">
                        <input className="input text-sm flex-1 py-2" placeholder="Tên server mới..." value={newServer} onChange={e => setNewServer(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddServer(game.id)} />
                        <button onClick={() => handleAddServer(game.id)} className="btn-primary py-2 px-3 text-sm"><FiPlus size={14} /></button>
                      </div>
                    </div>

                    {/* Classes */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-3">Class / Nhân Vật</h4>
                      <div className="space-y-1.5 mb-3">
                        {details.classes?.map(c => (
                          <div key={c.id} className="flex items-center justify-between bg-dark rounded-lg px-3 py-2">
                            <span className="text-white text-sm">{c.name}</span>
                            <button onClick={() => handleDeleteClass(c.id, game.id)} className="text-gray-600 hover:text-red-400 transition-colors"><FiTrash2 size={13} /></button>
                          </div>
                        ))}
                        {details.classes?.length === 0 && <p className="text-gray-600 text-xs">Chưa có class nào</p>}
                      </div>
                      <div className="flex gap-2">
                        <input className="input text-sm flex-1 py-2" placeholder="Tên class mới..." value={newClass} onChange={e => setNewClass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddClass(game.id)} />
                        <button onClick={() => handleAddClass(game.id)} className="btn-primary py-2 px-3 text-sm"><FiPlus size={14} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Game modal */}
      {gameModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setGameModal(false)}>
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-md">
            <div className="p-5 border-b border-dark-border flex items-center justify-between">
              <h2 className="font-bold text-white">{editGame ? 'Sửa Game' : 'Thêm Game Mới'}</h2>
              <button onClick={() => setGameModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveGame} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tên game *</label>
                <input type="text" className="input" required value={gameForm.name} onChange={e => {
                  const name = e.target.value;
                  setGameForm(f => ({ ...f, name, slug: editGame ? f.slug : slugify(name) }));
                }} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Slug (URL) *</label>
                <input type="text" className="input" required value={gameForm.slug} onChange={e => setGameForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Mô tả</label>
                <textarea rows={2} className="input resize-none" value={gameForm.description} onChange={e => setGameForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Trạng thái</label>
                <select className="input" value={gameForm.is_active} onChange={e => setGameForm(f => ({ ...f, is_active: Number(e.target.value) }))}>
                  <option value={1}>Hoạt động</option>
                  <option value={0}>Ẩn</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setGameModal(false)} className="btn-outline py-2 px-5">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary py-2 px-5">{saving ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
