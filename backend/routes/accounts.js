const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for image uploads
const uploadDir = path.join(process.env.UPLOAD_DIR || path.join(__dirname, '../uploads'), 'accounts');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `acc_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh.'));
  }
});

// GET /api/accounts — list with filters & pagination
router.get('/', (req, res) => {
  const { game_id, server_id, class_id, min_level, max_level, min_price, max_price,
          status, search, page = 1, limit = 12, sort = 'newest' } = req.query;

  let where = ['1=1'];
  let params = [];

  if (game_id) { where.push('a.game_id = ?'); params.push(game_id); }
  if (server_id) { where.push('a.server_id = ?'); params.push(server_id); }
  if (class_id) { where.push('a.class_id = ?'); params.push(class_id); }
  if (min_level) { where.push('a.level >= ?'); params.push(min_level); }
  if (max_level) { where.push('a.level <= ?'); params.push(max_level); }
  if (min_price) { where.push('a.price >= ?'); params.push(min_price); }
  if (max_price) { where.push('a.price <= ?'); params.push(max_price); }
  if (status) { where.push('a.status = ?'); params.push(status); }
  else { where.push("a.status = 'available'"); }
  if (search) { where.push('(a.title LIKE ? OR a.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const orderMap = {
    newest: 'a.created_at DESC',
    oldest: 'a.created_at ASC',
    price_asc: 'a.price ASC',
    price_desc: 'a.price DESC',
    level_desc: 'a.level DESC',
  };
  const orderBy = orderMap[sort] || orderMap.newest;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const total = db.prepare(`
    SELECT COUNT(*) as count FROM accounts a
    WHERE ${where.join(' AND ')}
  `).get(...params);

  const items = db.prepare(`
    SELECT a.*, g.name as game_name, g.slug as game_slug,
           s.name as server_name, c.name as class_name
    FROM accounts a
    LEFT JOIN games g ON a.game_id = g.id
    LEFT JOIN servers s ON a.server_id = s.id
    LEFT JOIN classes c ON a.class_id = c.id
    WHERE ${where.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  items.forEach(item => {
    try { item.images = JSON.parse(item.images || '[]'); } catch { item.images = []; }
  });

  res.json({
    data: items,
    pagination: {
      total: total.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total.count / parseInt(limit))
    }
  });
});

// GET /api/accounts/:id — single account detail
router.get('/:id', (req, res) => {
  const acc = db.prepare(`
    SELECT a.*, g.name as game_name, g.slug as game_slug,
           s.name as server_name, c.name as class_name
    FROM accounts a
    LEFT JOIN games g ON a.game_id = g.id
    LEFT JOIN servers s ON a.server_id = s.id
    LEFT JOIN classes c ON a.class_id = c.id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!acc) return res.status(404).json({ message: 'Không tìm thấy tài khoản game.' });

  // Increment view count
  db.prepare('UPDATE accounts SET view_count = view_count + 1 WHERE id = ?').run(acc.id);

  try { acc.images = JSON.parse(acc.images || '[]'); } catch { acc.images = []; }

  // Related accounts (same game, available)
  const related = db.prepare(`
    SELECT a.*, g.name as game_name, s.name as server_name, c.name as class_name
    FROM accounts a
    LEFT JOIN games g ON a.game_id = g.id
    LEFT JOIN servers s ON a.server_id = s.id
    LEFT JOIN classes c ON a.class_id = c.id
    WHERE a.game_id = ? AND a.id != ? AND a.status = 'available'
    ORDER BY RANDOM() LIMIT 4
  `).all(acc.game_id, acc.id);
  related.forEach(r => { try { r.images = JSON.parse(r.images || '[]'); } catch { r.images = []; } });

  res.json({ ...acc, related });
});

// POST /api/accounts/upload-image — upload account image
router.post('/upload-image', authMiddleware, adminMiddleware, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Không có file ảnh nào được upload.' });
  }
  const urls = req.files.map(f => `/uploads/accounts/${f.filename}`);
  res.json({ urls });
});

module.exports = router;
