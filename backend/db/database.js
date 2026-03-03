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
      level INTEGER DEFAULT 1,
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
  `);
}

function seedDB() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (count.c > 0) return;

  console.log('Seeding database...');

  // Admin account
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

  // Servers NSO (game_id = 1)
  const insertServer = db.prepare(`INSERT INTO servers (game_id, name) VALUES (?,?)`);
  ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10',
   'S11', 'S12', 'S13', 'S14', 'S15', 'Server VIP', 'Server Mới'].forEach(s => insertServer.run(1, s));

  // Classes NSO (game_id = 1)
  const insertClass = db.prepare(`INSERT INTO classes (game_id, name) VALUES (?,?)`);
  ['Kiếm Sĩ', 'Thuật Sĩ', 'Cung Thủ', 'Ninja'].forEach(c => insertClass.run(1, c));

  // Sample NSO accounts
  // server_id: S1=1, S2=2, S3=3, S4=4, S5=5 ... S10=10, S11=11, S12=12, S13=13, S14=14, S15=15, VIP=16, Mới=17
  // class_id: Kiếm Sĩ=1, Thuật Sĩ=2, Cung Thủ=3, Ninja=4
  const insertAcc = db.prepare(`
    INSERT INTO accounts (game_id, server_id, class_id, title, level, price, original_price, status, description, images)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `);
  const sampleAccs = [
    // S1 accounts
    [1, 1, 1, 'Acc NSO S1 Kiếm Sĩ Lv200 Full Đồ Vip', 200, 2500000, 3200000, 'available', 'Kiếm Sĩ level 200, đồ full set Thiên Mệnh, nhiều xu, thú cưỡi VIP, bảo vật đầy đủ. Tài khoản đang top server.', '[]'],
    [1, 1, 2, 'Acc NSO S1 Thuật Sĩ Lv180 Khủng', 180, 1800000, 2300000, 'available', 'Thuật Sĩ level 180, kỹ năng max, trang bị xịn, nhiều tài nguyên tích lũy.', '[]'],
    [1, 1, 3, 'Acc NSO S1 Cung Thủ Lv195 Săn Boss', 195, 1500000, 2000000, 'available', 'Cung Thủ chuyên săn boss, trang bị full, kỹ năng hỗ trợ đội nhóm tốt.', '[]'],
    [1, 1, 4, 'Acc NSO S1 Ninja Lv175 Tốc Độ', 175, 1200000, 1500000, 'available', 'Ninja tốc độ cao, né đòn tốt, phù hợp PvP và nhiệm vụ.', '[]'],
    // S2 accounts
    [1, 2, 1, 'Acc NSO S2 Kiếm Sĩ Top 10 Server', 220, 4500000, 5500000, 'available', 'Kiếm Sĩ top 10 server S2, đồ Thần Binh full set, mặt nạ hiếm, thú chiến lực mạnh nhất.', '[]'],
    [1, 2, 2, 'Acc NSO S2 Thuật Sĩ Lv210 Hàng Hiếm', 210, 3200000, 4000000, 'available', 'Thuật Sĩ level 210, skill sát thương khủng, đồ set đầy đủ dị thảo.', '[]'],
    [1, 2, 4, 'Acc NSO S2 Ninja Lv200 Cực Mạnh', 200, 2800000, 3500000, 'available', 'Ninja level 200, trang bị top, bộ kỹ năng PvP cực mạnh.', '[]'],
    // S3 accounts
    [1, 3, 1, 'Acc NSO S3 Kiếm Sĩ Lv150 Newbie Farm', 150, 550000, 750000, 'available', 'Kiếm Sĩ level 150, phù hợp newbie muốn có acc ngon từ đầu, đồ khá.', '[]'],
    [1, 3, 3, 'Acc NSO S3 Cung Thủ Lv165 Giá Rẻ', 165, 420000, 600000, 'available', 'Cung Thủ cấp 165, đồ decent, ít xu nhưng nhân vật mạnh. Giá rẻ nhất server.', '[]'],
    // S4 accounts
    [1, 4, 2, 'Acc NSO S4 Thuật Sĩ Lv190 Cao Cấp', 190, 2100000, 2700000, 'available', 'Thuật Sĩ level 190, skill max, mặt nạ vip, thú cưỡi cấp cao.', '[]'],
    [1, 4, 1, 'Acc NSO S4 Kiếm Sĩ Lv185 Đồ Full', 185, 1700000, 2200000, 'available', 'Kiếm Sĩ full set trang bị, level 185, chiến lực top 30 server.', '[]'],
    // S5 accounts
    [1, 5, 4, 'Acc NSO S5 Ninja Lv155 Starter', 155, 380000, 500000, 'available', 'Ninja level 155, phù hợp người mới chơi hoặc muốn thử server 5.', '[]'],
    [1, 5, 3, 'Acc NSO S5 Cung Thủ Lv178 Khá', 178, 980000, 1300000, 'available', 'Cung Thủ cấp 178, trang bị tốt, kỹ năng đầy đủ.', '[]'],
    // Server VIP accounts
    [1, 16, 1, 'Acc NSO Server VIP Kiếm Sĩ MaxLv', 250, 8500000, 10000000, 'available', 'Kiếm Sĩ MAX level 250 trên server VIP, đồ FULL set hiếm nhất game, thú chiến lực +100, bảo vật legendary.', '[]'],
    [1, 16, 2, 'Acc NSO VIP Thuật Sĩ Lv240 Siêu VIP', 240, 6800000, 8000000, 'available', 'Thuật Sĩ level 240, skill sát thương không ai địch nổi trên server VIP.', '[]'],
    [1, 16, 4, 'Acc NSO VIP Ninja Lv230 Full Bảo Vật', 230, 5500000, 7000000, 'available', 'Ninja level 230, đây là nhân vật PvP hàng đầu server VIP.', '[]'],
    // Sold accounts
    [1, 1, 2, 'Acc NSO S1 Thuật Sĩ Lv200 Đã Bán', 200, 3000000, 3800000, 'sold', 'Đã bán.', '[]'],
    [1, 3, 4, 'Acc NSO S3 Ninja Lv160 Đã Bán', 160, 600000, 800000, 'sold', 'Đã bán.', '[]'],
  ];
  sampleAccs.forEach(a => insertAcc.run(...a));

  console.log('Seed completed!');
}

initDB();
seedDB();

module.exports = db;
