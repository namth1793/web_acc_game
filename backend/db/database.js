const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'game_acc.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      server_id INTEGER,
      class_id INTEGER,
      title TEXT NOT NULL,
      level INTEGER DEFAULT NULL,
      price REAL NOT NULL,
      original_price REAL,
      status TEXT DEFAULT 'available',
      description TEXT,
      images TEXT DEFAULT '[]',
      view_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id),
      FOREIGN KEY (server_id) REFERENCES servers(id),
      FOREIGN KEY (class_id) REFERENCES classes(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      method TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      amount REAL NOT NULL,
      transaction_id TEXT,
      proof_image TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      base_price REAL,
      is_price_fixed INTEGER DEFAULT 0,
      category TEXT DEFAULT 'game',
      icon TEXT DEFAULT '🎮',
      note TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function seedDB() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (count.c > 0) return;

  console.log('Seeding database...');

  // Users
  const adminPw = bcrypt.hashSync('admin123', 10);
  const staffPw = bcrypt.hashSync('staff123', 10);
  const userPw  = bcrypt.hashSync('user123', 10);

  db.prepare(`INSERT INTO users (name, email, phone, password, role, balance) VALUES (?,?,?,?,?,?)`)
    .run('Quản Trị Viên', 'admin@tiengame.vn', '0901234567', adminPw, 'admin', 0);
  db.prepare(`INSERT INTO users (name, email, phone, password, role, balance) VALUES (?,?,?,?,?,?)`)
    .run('Nhân Viên A', 'nhanvien@tiengame.vn', '0912345678', staffPw, 'staff', 0);
  db.prepare(`INSERT INTO users (name, email, phone, password, role, balance) VALUES (?,?,?,?,?,?)`)
    .run('Nguyễn Văn An', 'user@tiengame.vn', '0923456789', userPw, 'user', 500000);

  // Game: Ninja School Online
  db.prepare(`INSERT INTO games (name, slug, description) VALUES (?,?,?)`)
    .run('Ninja School Online', 'ninja-school-online', 'Game nhập vai huyền thoại Ninja School - tuổi thơ của triệu game thủ Việt Nam');

  // Servers NSO (game_id = 1) — SV1 đến SV11
  const insertServer = db.prepare(`INSERT INTO servers (game_id, name) VALUES (?,?)`);
  ['SV1','SV2','SV3','SV4','SV5','SV6','SV7','SV8','SV9','SV10','SV11'].forEach(s => insertServer.run(1, s));
  // server_id: SV1=1, SV2=2, SV3=3, SV4=4, SV5=5, SV6=6, SV7=7, SV8=8, SV9=9, SV10=10, SV11=11

  // Classes NSO - 6 phái (game_id = 1)
  const insertClass = db.prepare(`INSERT INTO classes (game_id, name) VALUES (?,?)`);
  ['Kunai', 'Kiếm', 'Tiêu', 'Đao', 'Quạt', 'Cung'].forEach(c => insertClass.run(1, c));
  // class_id: Kunai=1, Kiếm=2, Tiêu=3, Đao=4, Quạt=5, Cung=6

  // Sample NSO accounts (no level field)
  const insertAcc = db.prepare(`
    INSERT INTO accounts (game_id, server_id, class_id, title, price, original_price, status, description, images)
    VALUES (?,?,?,?,?,?,?,?,?)
  `);
  const sampleAccs = [
    // SV1 (server_id=1)
    [1, 1, 2, 'Acc NSO SV1 Kiếm Full Đồ VIP', 2500000, 3200000, 'available', 'Kiếm đồ full set Thiên Mệnh, nhiều xu, thú cưỡi VIP, bảo vật đầy đủ. Tài khoản đang top server.', '[]'],
    [1, 1, 3, 'Acc NSO SV1 Tiêu Tấn Công Mạnh', 1800000, 2300000, 'available', 'Tiêu sát thương cao, kỹ năng max, trang bị xịn, nhiều tài nguyên tích lũy.', '[]'],
    // SV2 (server_id=2)
    [1, 2, 2, 'Acc NSO SV2 Kiếm Top 10 Server', 4500000, 5500000, 'available', 'Kiếm top 10 server SV2, đồ Thần Binh full set, mặt nạ hiếm, thú chiến lực mạnh nhất.', '[]'],
    [1, 2, 4, 'Acc NSO SV2 Đao Hàng Hiếm', 3200000, 4000000, 'available', 'Đao skill sát thương khủng, đồ set đầy đủ dị thảo.', '[]'],
    // SV3 (server_id=3)
    [1, 3, 6, 'Acc NSO SV3 Cung Giá Rẻ', 420000, 600000, 'available', 'Cung đồ decent, ít xu nhưng nhân vật mạnh. Giá rẻ nhất server.', '[]'],
    [1, 3, 1, 'Acc NSO SV3 Kunai Starter', 380000, 500000, 'available', 'Kunai phù hợp người mới chơi server 3.', '[]'],
    // SV4 (server_id=4)
    [1, 4, 2, 'Acc NSO SV4 Kiếm Newbie Farm', 550000, 750000, 'available', 'Kiếm phù hợp newbie muốn có acc ngon từ đầu, đồ khá.', '[]'],
    [1, 4, 5, 'Acc NSO SV4 Quạt Cực Mạnh', 2800000, 3500000, 'available', 'Quạt trang bị top, bộ kỹ năng PvP cực mạnh.', '[]'],
    // SV5 (server_id=5)
    [1, 5, 3, 'Acc NSO SV5 Tiêu Cao Cấp', 2100000, 2700000, 'available', 'Tiêu skill max, mặt nạ vip, thú cưỡi cấp cao.', '[]'],
    [1, 5, 2, 'Acc NSO SV5 Kiếm Đồ Full', 1700000, 2200000, 'available', 'Kiếm full set trang bị, chiến lực top 30 server.', '[]'],
    // SV6 (server_id=6)
    [1, 6, 1, 'Acc NSO SV6 Kunai PvP', 1200000, 1500000, 'available', 'Kunai tốc độ cao, né đòn tốt, phù hợp PvP.', '[]'],
    // SV7 (server_id=7)
    [1, 7, 6, 'Acc NSO SV7 Cung Khá', 980000, 1300000, 'available', 'Cung trang bị tốt, kỹ năng đầy đủ.', '[]'],
    // SV8 (server_id=8)
    [1, 8, 2, 'Acc NSO SV8 Kiếm MaxStat', 8500000, 10000000, 'available', 'Kiếm MAX stat trên server SV8, đồ FULL set hiếm nhất game, thú chiến lực +100, bảo vật legendary.', '[]'],
    [1, 8, 3, 'Acc NSO SV8 Tiêu Siêu VIP', 6800000, 8000000, 'available', 'Tiêu sát thương không ai địch nổi trên server SV8.', '[]'],
    // SV9 (server_id=9)
    [1, 9, 4, 'Acc NSO SV9 Đao Full Bảo Vật', 5500000, 7000000, 'available', 'Đao PvP hàng đầu server SV9.', '[]'],
    // SV10 (server_id=10)
    [1, 10, 5, 'Acc NSO SV10 Quạt Nhanh', 750000, 1000000, 'available', 'Quạt kỹ năng hỗ trợ tốt, phù hợp chơi nhóm.', '[]'],
    // SV11 (server_id=11)
    [1, 11, 4, 'Acc NSO SV11 Đao Mới', 650000, 900000, 'available', 'Đao server SV11 mới, còn nhiều tiềm năng phát triển.', '[]'],
    // Sold
    [1, 1, 3, 'Acc NSO SV1 Tiêu Đã Bán', 3000000, 3800000, 'sold', 'Đã bán.', '[]'],
    [1, 4, 1, 'Acc NSO SV4 Kunai Đã Bán', 600000, 800000, 'sold', 'Đã bán.', '[]'],
  ];
  sampleAccs.forEach(a => insertAcc.run(...a));

  console.log('Seed completed!');
}

function seedServices() {
  const count = db.prepare('SELECT COUNT(*) as c FROM services').get();
  if (count.c > 0) return;

  const insertService = db.prepare(`
    INSERT INTO services (name, slug, description, base_price, is_price_fixed, category, icon, note, sort_order)
    VALUES (?,?,?,?,?,?,?,?,?)
  `);
  [
    ['Bán Xu', 'ban-xu', 'Mua xu game với giá ưu đãi, giao ngay trong 5 phút. Nhiều mệnh giá linh hoạt, phù hợp mọi nhu cầu.', null, 0, 'game', '💰', 'Liên hệ để báo giá theo số lượng xu cần mua', 1],
    ['Up Thuê', 'up-thue', 'Dịch vụ up cấp nhân vật thuê. Đội ngũ chuyên nghiệp, tài khoản an toàn tuyệt đối, cam kết hoàn thành đúng tiến độ.', null, 0, 'game', '⚡', 'Giá điều chỉnh theo server, phái và yêu cầu cụ thể', 2],
    ['Làm Danh Vọng', 'lam-danh-vong', 'Dịch vụ tăng danh vọng, rank nhân vật. Uy tín, bảo mật, cam kết hoàn thành theo đúng mốc yêu cầu.', null, 0, 'game', '🏆', 'Giá điều chỉnh theo mốc danh vọng và thời gian', 3],
    ['Bán VPS', 'ban-vps', 'VPS cấu hình cao, ping thấp, uptime 99.9%. Phù hợp farm game, chạy bot, hosting nhỏ. Nhiều gói cấu hình.', null, 0, 'vps', '🖥️', 'Nhiều gói từ Basic đến Pro, thanh toán theo tháng', 4],
    ['Bán Proxy', 'ban-proxy', 'Proxy sạch, tốc độ cao, hỗ trợ nhiều quốc gia. Thay IP nhanh chóng, an toàn. Dùng được cho game, tool, trình duyệt.', null, 0, 'proxy', '🌐', 'Gói theo ngày, tuần, tháng — giá tốt nhất thị trường', 5],
  ].forEach(s => insertService.run(...s));
}

const POPUP_DEFAULTS = {
  popup_enabled: '1',
  popup_title: '⚠️ Thông Báo Quan Trọng - ACCNINJA',
  popup_content: '⚠️ DỊCH VỤ NẠP TIỀN TRÊN WEB ĐANG BẢO TRÌ. ANH EM CHÚ Ý KHÔNG NẠP TIỀN TRÊN WEB. MUA ACC VUI LÒNG LIÊN HỆ ZALO MÌNH NHÉ',
  popup_news: JSON.stringify([
    { icon: '⚡', text: 'Nhận Up thuê 20k/1 tháng kèm làm mắt + quạt buff' },
    { icon: '📱', text: 'Anh em cần dịch vụ gì thì vui lòng liên hệ zalo: 0852603710 or Fb: Tiến' },
    { icon: '❤️', text: 'Xin cảm ơn!' },
  ]),
};

function seedSettings() {
  // Use INSERT OR REPLACE to always apply latest defaults on fresh DB
  const upsert = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?,?)');
  Object.entries(POPUP_DEFAULTS).forEach(([k, v]) => upsert.run(k, v));
}

function migrateSettings() {
  // Force-update popup settings to latest values every startup
  const update = db.prepare('UPDATE site_settings SET value = ? WHERE key = ?');
  Object.entries(POPUP_DEFAULTS).forEach(([k, v]) => update.run(v, k));
}

// Migration: force correct servers and classes (runs every startup to fix stale data)
function migrateServersClasses() {
  const game = db.prepare('SELECT id FROM games WHERE slug = ?').get('ninja-school-online');
  if (!game) return;
  const gid = game.id;

  // Check if servers need updating
  const servers = db.prepare('SELECT name FROM servers WHERE game_id = ? ORDER BY id').all(gid).map(r => r.name);
  const expected = ['SV1','SV2','SV3','SV4','SV5','SV6','SV7','SV8','SV9','SV10','SV11'];
  const serverMatch = servers.length === expected.length && servers.every((s, i) => s === expected[i]);

  if (!serverMatch) {
    console.log('Migrating servers to SV1-SV11...');
    // Update account server_id references to null before deleting
    db.prepare('UPDATE accounts SET server_id = NULL WHERE game_id = ?').run(gid);
    db.prepare('DELETE FROM servers WHERE game_id = ?').run(gid);
    const ins = db.prepare('INSERT INTO servers (game_id, name) VALUES (?,?)');
    expected.forEach(s => ins.run(gid, s));
    console.log('Server migration done.');
  }

  // Check classes
  const classes = db.prepare('SELECT name FROM classes WHERE game_id = ? ORDER BY id').all(gid).map(r => r.name);
  const expectedClasses = ['Kunai', 'Kiếm', 'Tiêu', 'Đao', 'Quạt', 'Cung'];
  const classMatch = classes.length === expectedClasses.length && classes.every((c, i) => c === expectedClasses[i]);

  if (!classMatch) {
    console.log('Migrating classes...');
    db.prepare('UPDATE accounts SET class_id = NULL WHERE game_id = ?').run(gid);
    db.prepare('DELETE FROM classes WHERE game_id = ?').run(gid);
    const insC = db.prepare('INSERT INTO classes (game_id, name) VALUES (?,?)');
    expectedClasses.forEach(c => insC.run(gid, c));
    console.log('Class migration done.');
  }
}

initDB();
seedDB();
seedServices();
seedSettings();
migrateSettings();
migrateServersClasses();

module.exports = db;