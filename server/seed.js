require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const adminEmail = (process.env.ADMIN_EMAIL || 'admin@heew.com').toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(adminEmail);
if (!existing) {
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)').run(adminEmail, hash);
  console.log(`Admin created: ${adminEmail}`);
} else {
  console.log(`Admin already exists: ${adminEmail}`);
}

const sampleEmployees = [
  { name: 'Alice Johnson', email: 'alice@heew.com', hourly_rate: 25 },
  { name: 'Bob Smith', email: 'bob@heew.com', hourly_rate: 22 },
  { name: 'Carol Williams', email: 'carol@heew.com', hourly_rate: 28 },
];

const insertEmp = db.prepare(
  'INSERT OR IGNORE INTO employees (name, email, hourly_rate) VALUES (?, ?, ?)'
);
for (const e of sampleEmployees) {
  insertEmp.run(e.name, e.email, e.hourly_rate);
}
console.log('Sample employees seeded (if not already present).');
console.log('\nDefault credentials:');
console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
console.log('  Employees: alice@heew.com, bob@heew.com, carol@heew.com');
