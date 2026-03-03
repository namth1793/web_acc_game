const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/games — list all active games
router.get('/', (req, res) => {
  const games = db.prepare('SELECT * FROM games WHERE is_active = 1 ORDER BY name').all();
  res.json(games);
});

// GET /api/games/:id — single game with servers and classes
router.get('/:id', (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  if (!game) return res.status(404).json({ message: 'Không tìm thấy game.' });

  const servers = db.prepare('SELECT * FROM servers WHERE game_id = ? ORDER BY name').all(game.id);
  const classes = db.prepare('SELECT * FROM classes WHERE game_id = ? ORDER BY name').all(game.id);
  res.json({ ...game, servers, classes });
});

// GET /api/games/:id/servers
router.get('/:id/servers', (req, res) => {
  const servers = db.prepare('SELECT * FROM servers WHERE game_id = ? ORDER BY name').all(req.params.id);
  res.json(servers);
});

// GET /api/games/:id/classes
router.get('/:id/classes', (req, res) => {
  const classes = db.prepare('SELECT * FROM classes WHERE game_id = ? ORDER BY name').all(req.params.id);
  res.json(classes);
});

module.exports = router;
