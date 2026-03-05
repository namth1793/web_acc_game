require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware — allow all origins so admin can upload from any device/network
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files (uploaded images)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/games', require('./routes/games'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/services', require('./routes/services'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'API endpoint không tồn tại.' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi server nội bộ. Vui lòng thử lại.' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📦 Admin panel API: http://localhost:${PORT}/api/admin`);
  console.log(`📖 Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} đang bị chiếm bởi process khác.`);
    console.error(`   Chạy lệnh sau để giải phóng:\n`);
    console.error(`   Windows:  netstat -ano | findstr :${PORT}  rồi  taskkill /PID <số> /F`);
    console.error(`   Hoặc đổi PORT trong file .env\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
