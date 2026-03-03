const express = require('express');
const router = express.Router();
const db = require('../db/database');
const bcrypt = require('bcryptjs');
const { authMiddleware, adminMiddleware, superAdminMiddleware } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// ================== DASHBOARD ==================
// GET /api/admin/dashboard
router.get('/dashboard', (req, res) => {
  const totalAccounts = db.prepare('SELECT COUNT(*) as c FROM accounts').get().c;
  const availableAccounts = db.prepare("SELECT COUNT(*) as c FROM accounts WHERE status = 'available'").get().c;
  const soldAccounts = db.prepare("SELECT COUNT(*) as c FROM accounts WHERE status = 'sold'").get().c;
  const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'user'").get().c;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_price),0) as s FROM orders WHERE status IN ('paid','completed')").get().s;

  const revenueToday = db.prepare(`
    SELECT COALESCE(SUM(total_price),0) as s FROM orders
    WHERE status IN ('paid','completed') AND date(created_at) = date('now')
  `).get().s;
  const revenueWeek = db.prepare(`
    SELECT COALESCE(SUM(total_price),0) as s FROM orders
    WHERE status IN ('paid','completed') AND created_at >= date('now','-7 days')
  `).get().s;
  const revenueMonth = db.prepare(`
    SELECT COALESCE(SUM(total_price),0) as s FROM orders
    WHERE status IN ('paid','completed') AND strftime('%Y-%m', created_at) = strftime('%Y-%m','now')
  `).get().s;

  const recentOrders = db.prepare(`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC LIMIT 10
  `).all();

  const pendingPayments = db.prepare(`
    SELECT p.*, o.total_price, u.name as user_name
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    JOIN users u ON o.user_id = u.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at DESC
  `).all();

  // Revenue by last 7 days
  const revenueByDay = db.prepare(`
    SELECT date(created_at) as day, COALESCE(SUM(total_price),0) as revenue, COUNT(*) as orders
    FROM orders WHERE status IN ('paid','completed') AND created_at >= date('now','-7 days')
    GROUP BY date(created_at) ORDER BY day
  `).all();

  res.json({
    stats: { totalAccounts, availableAccounts, soldAccounts, totalOrders, totalUsers, totalRevenue, revenueToday, revenueWeek, revenueMonth },
    recentOrders,
    pendingPayments,
    revenueByDay
  });
});

// ================== GAMES MANAGEMENT ==================
// GET /api/admin/games
router.get('/games', (req, res) => {
  const games = db.prepare(`
    SELECT g.*,
      (SELECT COUNT(*) FROM servers WHERE game_id = g.id) as server_count,
      (SELECT COUNT(*) FROM classes WHERE game_id = g.id) as class_count,
      (SELECT COUNT(*) FROM accounts WHERE game_id = g.id AND status = 'available') as acc_count
    FROM games g ORDER BY g.name
  `).all();
  res.json(games);
});

// POST /api/admin/games
router.post('/games', (req, res) => {
  const { name, slug, description } = req.body;
  if (!name || !slug) return res.status(400).json({ message: 'Tên game và slug là bắt buộc.' });
  const existing = db.prepare('SELECT id FROM games WHERE slug = ?').get(slug);
  if (existing) return res.status(409).json({ message: 'Slug này đã tồn tại.' });
  const r = db.prepare('INSERT INTO games (name, slug, description) VALUES (?,?,?)').run(name, slug, description || null);
  res.status(201).json({ message: 'Thêm game thành công!', id: r.lastInsertRowid });
});

// PUT /api/admin/games/:id
router.put('/games/:id', (req, res) => {
  const { name, slug, description, is_active } = req.body;
  db.prepare('UPDATE games SET name=?, slug=?, description=?, is_active=? WHERE id=?')
    .run(name, slug, description, is_active !== undefined ? is_active : 1, req.params.id);
  res.json({ message: 'Cập nhật game thành công!' });
});

// DELETE /api/admin/games/:id
router.delete('/games/:id', superAdminMiddleware, (req, res) => {
  db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id);
  res.json({ message: 'Đã xóa game.' });
});

// POST /api/admin/games/:id/servers
router.post('/games/:id/servers', (req, res) => {
  const { name } = req.body;
  const r = db.prepare('INSERT INTO servers (game_id, name) VALUES (?,?)').run(req.params.id, name);
  res.status(201).json({ message: 'Thêm server thành công!', id: r.lastInsertRowid });
});

// DELETE /api/admin/servers/:id
router.delete('/servers/:id', (req, res) => {
  db.prepare('DELETE FROM servers WHERE id = ?').run(req.params.id);
  res.json({ message: 'Đã xóa server.' });
});

// POST /api/admin/games/:id/classes
router.post('/games/:id/classes', (req, res) => {
  const { name } = req.body;
  const r = db.prepare('INSERT INTO classes (game_id, name) VALUES (?,?)').run(req.params.id, name);
  res.status(201).json({ message: 'Thêm class thành công!', id: r.lastInsertRowid });
});

// DELETE /api/admin/classes/:id
router.delete('/classes/:id', (req, res) => {
  db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Đã xóa class.' });
});

// ================== ACCOUNTS MANAGEMENT ==================
// GET /api/admin/accounts
router.get('/accounts', (req, res) => {
  const { game_id, status, search, page = 1, limit = 20 } = req.query;
  let where = ['1=1'];
  let params = [];
  if (game_id) { where.push('a.game_id = ?'); params.push(game_id); }
  if (status) { where.push('a.status = ?'); params.push(status); }
  if (search) { where.push('(a.title LIKE ? OR a.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const total = db.prepare(`SELECT COUNT(*) as c FROM accounts a WHERE ${where.join(' AND ')}`).get(...params);

  const items = db.prepare(`
    SELECT a.*, g.name as game_name, s.name as server_name, c.name as class_name
    FROM accounts a
    LEFT JOIN games g ON a.game_id = g.id
    LEFT JOIN servers s ON a.server_id = s.id
    LEFT JOIN classes c ON a.class_id = c.id
    WHERE ${where.join(' AND ')}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  items.forEach(i => { try { i.images = JSON.parse(i.images || '[]'); } catch { i.images = []; } });

  res.json({ data: items, pagination: { total: total.c, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total.c / parseInt(limit)) } });
});

// POST /api/admin/accounts
router.post('/accounts', (req, res) => {
  const { game_id, server_id, class_id, title, level, price, original_price, description, images, status } = req.body;
  if (!game_id || !title || !price) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
  const r = db.prepare(`
    INSERT INTO accounts (game_id, server_id, class_id, title, level, price, original_price, description, images, status)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(game_id, server_id || null, class_id || null, title, level || null, price, original_price || null,
         description || null, JSON.stringify(images || []), status || 'available');
  res.status(201).json({ message: 'Thêm tài khoản game thành công!', id: r.lastInsertRowid });
});

// PUT /api/admin/accounts/:id
router.put('/accounts/:id', (req, res) => {
  const { game_id, server_id, class_id, title, level, price, original_price, description, images, status } = req.body;
  db.prepare(`
    UPDATE accounts SET game_id=?, server_id=?, class_id=?, title=?, level=?, price=?,
    original_price=?, description=?, images=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
  `).run(game_id, server_id || null, class_id || null, title, level || null, price,
         original_price || null, description || null, JSON.stringify(images || []), status, req.params.id);
  res.json({ message: 'Cập nhật tài khoản game thành công!' });
});

// DELETE /api/admin/accounts/:id
router.delete('/accounts/:id', (req, res) => {
  db.prepare('DELETE FROM accounts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Đã xóa tài khoản game.' });
});

// PATCH /api/admin/accounts/:id/status
router.patch('/accounts/:id/status', (req, res) => {
  const { status } = req.body;
  const valid = ['available', 'sold', 'pending'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
  db.prepare('UPDATE accounts SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status, req.params.id);
  res.json({ message: 'Cập nhật trạng thái thành công!' });
});

// ================== ORDERS MANAGEMENT ==================
// GET /api/admin/orders
router.get('/orders', (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  let where = ['1=1'];
  let params = [];
  if (status) { where.push('o.status = ?'); params.push(status); }
  if (search) { where.push('(u.name LIKE ? OR u.email LIKE ? OR o.id = ?)'); params.push(`%${search}%`, `%${search}%`, parseInt(search) || 0); }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const total = db.prepare(`SELECT COUNT(*) as c FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE ${where.join(' AND ')}`).get(...params);

  const orders = db.prepare(`
    SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
    FROM orders o LEFT JOIN users u ON o.user_id = u.id
    WHERE ${where.join(' AND ')}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  // Attach items
  const result = orders.map(order => {
    const items = db.prepare(`
      SELECT oi.*, a.title, a.level, g.name as game_name
      FROM order_items oi
      LEFT JOIN accounts a ON oi.account_id = a.id
      LEFT JOIN games g ON a.game_id = g.id
      WHERE oi.order_id = ?
    `).all(order.id);
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1').get(order.id);
    return { ...order, items, payment };
  });

  res.json({ data: result, pagination: { total: total.c, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total.c / parseInt(limit)) } });
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'paid', 'completed', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

  const updateOrder = db.transaction(() => {
    db.prepare("UPDATE orders SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").run(status, order.id);

    // If completed, mark accounts as sold
    if (status === 'completed') {
      const items = db.prepare('SELECT account_id FROM order_items WHERE order_id = ?').all(order.id);
      items.forEach(i => db.prepare("UPDATE accounts SET status='sold', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(i.account_id));
    }
    // If cancelled, release accounts back to available
    if (status === 'cancelled') {
      const items = db.prepare('SELECT account_id FROM order_items WHERE order_id = ?').all(order.id);
      items.forEach(i => db.prepare("UPDATE accounts SET status='available', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(i.account_id));
    }
  });
  updateOrder();
  res.json({ message: 'Cập nhật trạng thái đơn hàng thành công!' });
});

// ================== PAYMENTS MANAGEMENT ==================
// GET /api/admin/payments
router.get('/payments', (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  let where = ['1=1'];
  let params = [];
  if (status) { where.push('p.status = ?'); params.push(status); }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const total = db.prepare(`SELECT COUNT(*) as c FROM payments p WHERE ${where.join(' AND ')}`).get(...params);

  const payments = db.prepare(`
    SELECT p.*, o.total_price, o.status as order_status, u.name as user_name, u.email as user_email
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    JOIN users u ON o.user_id = u.id
    WHERE ${where.join(' AND ')}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json({ data: payments, pagination: { total: total.c, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total.c / parseInt(limit)) } });
});

// PATCH /api/admin/payments/:id/status
router.patch('/payments/:id/status', (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'success', 'failed'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Không tìm thấy thanh toán.' });

  const updatePayment = db.transaction(() => {
    db.prepare('UPDATE payments SET status = ? WHERE id = ?').run(status, payment.id);
    // If payment success, update order to paid
    if (status === 'success') {
      db.prepare("UPDATE orders SET status='paid', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(payment.order_id);
    }
    if (status === 'failed') {
      db.prepare("UPDATE orders SET status='cancelled', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(payment.order_id);
      const items = db.prepare('SELECT account_id FROM order_items WHERE order_id=?').all(payment.order_id);
      items.forEach(i => db.prepare("UPDATE accounts SET status='available', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(i.account_id));
    }
  });
  updatePayment();
  res.json({ message: 'Cập nhật trạng thái thanh toán thành công!' });
});

// ================== USERS MANAGEMENT ==================
// GET /api/admin/users
router.get('/users', (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  let where = ['1=1'];
  let params = [];
  if (role) { where.push('role = ?'); params.push(role); }
  if (search) { where.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const total = db.prepare(`SELECT COUNT(*) as c FROM users WHERE ${where.join(' AND ')}`).get(...params);

  const users = db.prepare(`
    SELECT id, name, email, phone, role, balance, created_at FROM users WHERE ${where.join(' AND ')}
    ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  // Order count per user
  const result = users.map(u => {
    const orderCount = db.prepare('SELECT COUNT(*) as c FROM orders WHERE user_id = ?').get(u.id).c;
    return { ...u, orderCount };
  });

  res.json({ data: result, pagination: { total: total.c, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total.c / parseInt(limit)) } });
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', superAdminMiddleware, (req, res) => {
  const { role } = req.body;
  const valid = ['user', 'staff', 'admin'];
  if (!valid.includes(role)) return res.status(400).json({ message: 'Quyền không hợp lệ.' });
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ message: 'Không thể thay đổi quyền của chính mình.' });
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ message: 'Cập nhật quyền thành công!' });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', superAdminMiddleware, (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình.' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'Đã xóa người dùng.' });
});

// PUT /api/admin/users/:id/reset-password
router.put('/users/:id/reset-password', superAdminMiddleware, (req, res) => {
  const { new_password } = req.body;
  if (!new_password || new_password.length < 6) return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
  const hashed = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.params.id);
  res.json({ message: 'Đặt lại mật khẩu thành công!' });
});

module.exports = router;
