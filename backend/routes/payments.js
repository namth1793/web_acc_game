const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Multer for payment proof images
const uploadDir = path.join(__dirname, '../uploads/payments');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `pay_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Bank info for display
const BANK_INFO = {
  bank_transfer: {
    bank_name: 'Ngân hàng Vietcombank',
    account_number: '1234567890',
    account_name: 'NGUYEN VAN A',
    branch: 'Chi nhánh Đà Nẵng',
    content: 'THANHTOAN {order_id}'
  },
  momo: {
    phone: '0901234567',
    name: 'Tiền Game VN',
    content: 'DH {order_id}'
  },
  zalopay: {
    phone: '0901234567',
    name: 'Tiền Game VN',
    content: 'ZALOPAY {order_id}'
  }
};

// POST /api/payments — create payment for order
router.post('/', authMiddleware, (req, res) => {
  const { order_id, method, note } = req.body;

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(order_id, req.user.id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
  if (order.status !== 'pending') {
    return res.status(400).json({ message: 'Đơn hàng này không thể thanh toán.' });
  }

  const validMethods = ['bank_transfer', 'momo', 'zalopay', 'atm'];
  if (!validMethods.includes(method)) {
    return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ.' });
  }

  const transaction_id = `TXN${uuidv4().replace(/-/g,'').toUpperCase().slice(0,12)}`;
  const result = db.prepare(
    'INSERT INTO payments (order_id, method, status, amount, transaction_id, note) VALUES (?,?,?,?,?,?)'
  ).run(order_id, method, 'pending', order.total_price, transaction_id, note || null);

  // Update order payment method
  db.prepare("UPDATE orders SET payment_method = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(method, order_id);

  const info = BANK_INFO[method] || {};
  const content = info.content ? info.content.replace('{order_id}', order_id) : '';

  res.status(201).json({
    message: 'Tạo thanh toán thành công! Vui lòng chuyển khoản theo thông tin dưới đây.',
    payment: {
      id: result.lastInsertRowid,
      order_id,
      method,
      amount: order.total_price,
      transaction_id,
      status: 'pending'
    },
    payment_info: { ...info, content }
  });
});

// POST /api/payments/:id/upload-proof — upload payment proof
router.post('/:id/upload-proof', authMiddleware, upload.single('proof'), (req, res) => {
  const payment = db.prepare(`
    SELECT p.*, o.user_id FROM payments p
    JOIN orders o ON p.order_id = o.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!payment) return res.status(404).json({ message: 'Không tìm thấy thanh toán.' });
  if (payment.user_id !== req.user.id) return res.status(403).json({ message: 'Không có quyền.' });
  if (!req.file) return res.status(400).json({ message: 'Vui lòng upload ảnh chứng minh thanh toán.' });

  const proofUrl = `/uploads/payments/${req.file.filename}`;
  db.prepare('UPDATE payments SET proof_image = ? WHERE id = ?').run(proofUrl, payment.id);

  res.json({ message: 'Upload ảnh chứng minh thành công! Chúng tôi sẽ xác nhận sớm nhất.', proof_image: proofUrl });
});

// GET /api/payments/info/:method — get payment method info
router.get('/info/:method', (req, res) => {
  const info = BANK_INFO[req.params.method];
  if (!info) return res.status(404).json({ message: 'Phương thức không tồn tại.' });
  res.json(info);
});

module.exports = router;
