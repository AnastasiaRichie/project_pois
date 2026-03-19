import db from './db.js';
import bcrypt from 'bcrypt';

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT,
    google_id TEXT,
    google_refresh_token TEXT,
    role TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    polygon TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS duties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER REFERENCES users(id),
    zone_id INTEGER REFERENCES zones(id),
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    calendar_event_id TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vehicle_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    duty_id INTEGER REFERENCES duties(id),
    license_plate TEXT NOT NULL,
    car_brand TEXT NOT NULL,
    parked_at TEXT NOT NULL,
    departed_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const existing = db.prepare('SELECT id FROM users WHERE name = ?').get('manager');
if (!existing) {
  const hash = await bcrypt.hash('12345', 10);
  db.prepare(
    'INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)'
  ).run('manager@system.local', 'manager', hash, 'manager');
  console.log('Default manager created (login: manager@system.local / 12345)');
}

console.log('Migration complete.');
process.exit(0);
