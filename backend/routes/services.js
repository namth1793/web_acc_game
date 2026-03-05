const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/services
router.get('/', (req, res) => {
  const services = db.prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order, id').all();
  res.json(services);
});

// GET /api/services/:slug
router.get('/:slug', (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE slug = ? AND is_active = 1').get(req.params.slug);
  if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ.' });
  res.json(service);
});

module.exports = router;