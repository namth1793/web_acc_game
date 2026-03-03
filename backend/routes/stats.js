const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Mock data used as seed when real transactions are still empty
const MOCK_TRANSACTIONS = [
  { buyer_name: 'Ng***Hùng', title: 'Acc NSO S2 Kiếm Sĩ Top 10 Server', server_name: 'S2', class_name: 'Kiếm Sĩ', level: 220, price: 4500000, created_at: new Date(Date.now() - 1*60*1000).toISOString() },
  { buyer_name: 'Tr***Minh', title: 'Acc NSO VIP Thuật Sĩ Lv240 Siêu VIP', server_name: 'Server VIP', class_name: 'Thuật Sĩ', level: 240, price: 6800000, created_at: new Date(Date.now() - 8*60*1000).toISOString() },
  { buyer_name: 'Lê***An',   title: 'Acc NSO S1 Cung Thủ Lv195 Săn Boss', server_name: 'S1', class_name: 'Cung Thủ', level: 195, price: 1500000, created_at: new Date(Date.now() - 15*60*1000).toISOString() },
  { buyer_name: 'Ph***Long', title: 'Acc NSO VIP Ninja Lv230 Full Bảo Vật', server_name: 'Server VIP', class_name: 'Ninja', level: 230, price: 5500000, created_at: new Date(Date.now() - 42*60*1000).toISOString() },
  { buyer_name: 'Vũ***Khoa', title: 'Acc NSO S4 Thuật Sĩ Lv190 Cao Cấp', server_name: 'S4', class_name: 'Thuật Sĩ', level: 190, price: 2100000, created_at: new Date(Date.now() - 1.2*3600*1000).toISOString() },
  { buyer_name: 'Đỗ***Tuấn', title: 'Acc NSO S1 Kiếm Sĩ Lv200 Full Đồ', server_name: 'S1', class_name: 'Kiếm Sĩ', level: 200, price: 2500000, created_at: new Date(Date.now() - 2*3600*1000).toISOString() },
  { buyer_name: 'Ma***Đức',  title: 'Acc NSO S3 Kiếm Sĩ Lv150 Newbie', server_name: 'S3', class_name: 'Kiếm Sĩ', level: 150, price: 550000, created_at: new Date(Date.now() - 3.5*3600*1000).toISOString() },
  { buyer_name: 'Ho***Thi',  title: 'Acc NSO S5 Cung Thủ Lv178', server_name: 'S5', class_name: 'Cung Thủ', level: 178, price: 980000, created_at: new Date(Date.now() - 5*3600*1000).toISOString() },
  { buyer_name: 'Bù***Hải',  title: 'Acc NSO S2 Thuật Sĩ Lv210 Hàng Hiếm', server_name: 'S2', class_name: 'Thuật Sĩ', level: 210, price: 3200000, created_at: new Date(Date.now() - 7*3600*1000).toISOString() },
  { buyer_name: 'Ng***Quân', title: 'Acc NSO S4 Kiếm Sĩ Lv185 Đồ Full', server_name: 'S4', class_name: 'Kiếm Sĩ', level: 185, price: 1700000, created_at: new Date(Date.now() - 10*3600*1000).toISOString() },
  { buyer_name: 'Ki***Nam',  title: 'Acc NSO Server VIP Kiếm Sĩ MaxLv', server_name: 'Server VIP', class_name: 'Kiếm Sĩ', level: 250, price: 8500000, created_at: new Date(Date.now() - 14*3600*1000).toISOString() },
  { buyer_name: 'Tr***Lộc',  title: 'Acc NSO S2 Ninja Lv200 Cực Mạnh', server_name: 'S2', class_name: 'Ninja', level: 200, price: 2800000, created_at: new Date(Date.now() - 18*3600*1000).toISOString() },
];

const MOCK_TOP_DEPOSITORS = [
  { rank: 1, name: 'Ki***Nam',  total: 18500000, orders: 4, badge: '👑' },
  { rank: 2, name: 'Tr***Minh', total: 14300000, orders: 3, badge: '🥈' },
  { rank: 3, name: 'Ng***Hùng', total: 11200000, orders: 5, badge: '🥉' },
  { rank: 4, name: 'Ph***Long', total: 8900000,  orders: 2, badge: '' },
  { rank: 5, name: 'Vũ***Khoa', total: 7600000,  orders: 3, badge: '' },
  { rank: 6, name: 'Bù***Hải',  total: 6400000,  orders: 2, badge: '' },
  { rank: 7, name: 'Đỗ***Tuấn', total: 5200000,  orders: 2, badge: '' },
  { rank: 8, name: 'Ma***Đức',  total: 3800000,  orders: 3, badge: '' },
  { rank: 9, name: 'Ho***Thi',  total: 2900000,  orders: 2, badge: '' },
  { rank: 10, name: 'Ng***Quân',total: 1700000,  orders: 1, badge: '' },
];

function maskName(name) {
  if (!name) return '***';
  const parts = name.split(' ');
  const last = parts[parts.length - 1];
  return last.charAt(0) + '***' + (last.length > 2 ? last.charAt(last.length - 1) : '');
}

// GET /api/stats/recent-transactions
// Public — returns last 20 completed order items
router.get('/recent-transactions', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        a.title, a.level, oi.price,
        srv.name  AS server_name,
        cls.name  AS class_name,
        u.name    AS buyer_name,
        o.created_at
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN accounts    a  ON a.id = oi.account_id
      JOIN users       u  ON o.user_id = u.id
      LEFT JOIN servers srv ON a.server_id = srv.id
      LEFT JOIN classes cls ON a.class_id  = cls.id
      WHERE o.status IN ('paid','completed')
      ORDER BY o.created_at DESC
      LIMIT 20
    `).all();

    if (rows.length >= 3) {
      return res.json(rows.map(r => ({ ...r, buyer_name: maskName(r.buyer_name) })));
    }
    res.json(MOCK_TRANSACTIONS);
  } catch (e) {
    res.json(MOCK_TRANSACTIONS);
  }
});

// GET /api/stats/top-depositors
// Public — returns top 10 users by total successful payment amount
router.get('/top-depositors', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        u.name,
        SUM(p.amount)  AS total,
        COUNT(DISTINCT o.id) AS orders
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users  u ON o.user_id  = u.id
      WHERE p.status = 'success' AND u.role = 'user'
      GROUP BY o.user_id
      ORDER BY total DESC
      LIMIT 10
    `).all();

    if (rows.length >= 3) {
      const BADGES = ['👑','🥈','🥉'];
      return res.json(rows.map((r, i) => ({
        rank: i + 1,
        name: maskName(r.name),
        total: r.total,
        orders: r.orders,
        badge: BADGES[i] || '',
      })));
    }
    res.json(MOCK_TOP_DEPOSITORS);
  } catch (e) {
    res.json(MOCK_TOP_DEPOSITORS);
  }
});

module.exports = router;
