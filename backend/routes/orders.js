const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

// POST /api/orders — create order
router.post('/', authMiddleware, (req, res) => {
  const { items, payment_method, notes } = req.body;
  // items: [{ account_id, price }]

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Giỏ hàng trống. Vui lòng chọn tài khoản game.' });
  }

  // Verify all accounts are still available
  for (const item of items) {
    const acc = db.prepare('SELECT id, status, price FROM accounts WHERE id = ?').get(item.account_id);
    if (!acc) return res.status(400).json({ message: `Tài khoản #${item.account_id} không tồn tại.` });
    if (acc.status !== 'available') return res.status(400).json({ message: `Tài khoản #${item.account_id} đã được bán. Vui lòng xóa khỏi giỏ hàng.` });
  }

  const total_price = items.reduce((sum, i) => sum + i.price, 0);

  const createOrder = db.transaction(() => {
    const orderResult = db.prepare(
      'INSERT INTO orders (user_id, total_price, status, payment_method, notes) VALUES (?,?,?,?,?)'
    ).run(req.user.id, total_price, 'pending', payment_method || null, notes || null);

    const orderId = orderResult.lastInsertRowid;
    const insertItem = db.prepare('INSERT INTO order_items (order_id, account_id, price) VALUES (?,?,?)');

    for (const item of items) {
      insertItem.run(orderId, item.account_id, item.price);
    }

    return orderId;
  });

  try {
    const orderId = createOrder();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    res.status(201).json({ message: 'Tạo đơn hàng thành công!', order });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.' });
  }
});

// GET /api/orders — user's orders
router.get('/', authMiddleware, (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = 'o.user_id = ?';
  let params = [req.user.id];
  if (status) { where += ' AND o.status = ?'; params.push(status); }

  const total = db.prepare(`SELECT COUNT(*) as count FROM orders o WHERE ${where}`).get(...params);
  const orders = db.prepare(`
    SELECT o.* FROM orders o
    WHERE ${where}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  // Attach items to each order
  const orderItems = orders.map(order => {
    const items = db.prepare(`
      SELECT oi.*, a.title, a.level, g.name as game_name
      FROM order_items oi
      LEFT JOIN accounts a ON oi.account_id = a.id
      LEFT JOIN games g ON a.game_id = g.id
      WHERE oi.order_id = ?
    `).all(order.id);
    return { ...order, items };
  });

  res.json({
    data: orderItems,
    pagination: { total: total.count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total.count / parseInt(limit)) }
  });
});

// GET /api/orders/:id — single order
router.get('/:id', authMiddleware, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

  const items = db.prepare(`
    SELECT oi.*, a.title, a.level, a.status as acc_status,
           g.name as game_name, s.name as server_name, c.name as class_name
    FROM order_items oi
    LEFT JOIN accounts a ON oi.account_id = a.id
    LEFT JOIN games g ON a.game_id = g.id
    LEFT JOIN servers s ON a.server_id = s.id
    LEFT JOIN classes c ON a.class_id = c.id
    WHERE oi.order_id = ?
  `).all(order.id);

  const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1').get(order.id);

  res.json({ ...order, items, payment });
});

// POST /api/orders/:id/cancel — cancel order
router.post('/:id/cancel', authMiddleware, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
  if (!['pending'].includes(order.status)) {
    return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý.' });
  }

  const cancelOrder = db.transaction(() => {
    db.prepare("UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(order.id);
    const items = db.prepare('SELECT account_id FROM order_items WHERE order_id = ?').all(order.id);
    items.forEach(i => db.prepare("UPDATE accounts SET status = 'available' WHERE id = ?").run(i.account_id));
  });

  cancelOrder();
  res.json({ message: 'Đã hủy đơn hàng thành công.' });
});

module.exports = router;
