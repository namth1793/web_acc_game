const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/settings/popup — public
router.get('/popup', (req, res) => {
  const rows = db.prepare('SELECT * FROM site_settings').all();
  const s = {};
  rows.forEach(r => { s[r.key] = r.value; });
  res.json({
    enabled: s.popup_enabled === '1',
    title: s.popup_title || '',
    content: s.popup_content || '',
    news: s.popup_news ? JSON.parse(s.popup_news) : [],
  });
});

module.exports = router;