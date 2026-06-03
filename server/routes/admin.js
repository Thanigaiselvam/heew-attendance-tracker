const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../auth');
const {
  sessionToSummary,
  getEmployeeSessions,
  aggregateSessions,
  getEmployeeOpenSession,
  deriveStatus,
} = require('../attendance');
const { monthKey, toISODate } = require('../utils');

const router = express.Router();
router.use(authMiddleware, adminOnly);

router.get('/dashboard', (req, res) => {
  const today = toISODate();
  const totalEmployees = db.prepare('SELECT COUNT(*) as c FROM employees WHERE is_active = 1').get().c;
  const checkedInToday = db
    .prepare(
      `SELECT COUNT(DISTINCT employee_id) as c FROM attendance_sessions WHERE date(check_in) = date(?)`
    )
    .get(today).c;
  const activeNow = db
    .prepare(`SELECT COUNT(*) as c FROM attendance_sessions WHERE check_out IS NULL`)
    .get().c;
  const onBreak = db
    .prepare(
      `SELECT COUNT(*) as c FROM break_logs bl
       JOIN attendance_sessions s ON s.id = bl.session_id
       WHERE bl.break_end IS NULL AND s.check_out IS NULL`
    )
    .get().c;

  const recent = db
    .prepare(
      `SELECT s.*, e.name, e.email FROM attendance_sessions s
       JOIN employees e ON e.id = s.employee_id
       ORDER BY s.check_in DESC LIMIT 10`
    )
    .all();

  res.json({
    stats: {
      totalEmployees,
      checkedInToday,
      activeNow,
      onBreak,
      offline: totalEmployees - activeNow,
    },
    recentSessions: recent.map((s) => ({
      ...sessionToSummary(s),
      employee_name: s.name,
      employee_email: s.email,
    })),
  });
});

router.get('/employees', (req, res) => {
  const employees = db
    .prepare('SELECT id, name, email, hourly_rate, is_active, created_at FROM employees ORDER BY name')
    .all();
  const withStatus = employees.map((e) => {
    const session = getEmployeeOpenSession(e.id);
    return { ...e, is_active: !!e.is_active, status: deriveStatus(session) };
  });
  res.json({ employees: withStatus });
});

router.post('/employees', (req, res) => {
  const { name, email, hourly_rate } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  try {
    const result = db
      .prepare(
        `INSERT INTO employees (name, email, hourly_rate) VALUES (?, ?, ?)`
      )
      .run(name.trim(), email.toLowerCase().trim(), hourly_rate ?? 0);
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ employee });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    throw e;
  }
});

router.put('/employees/:id', (req, res) => {
  const { name, email, hourly_rate, is_active } = req.body;
  const id = parseInt(req.params.id, 10);
  const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  db.prepare(
    `UPDATE employees SET name = ?, email = ?, hourly_rate = ?, is_active = ? WHERE id = ?`
  ).run(
    name ?? existing.name,
    (email ?? existing.email).toLowerCase().trim(),
    hourly_rate ?? existing.hourly_rate,
    is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
    id
  );
  const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  res.json({ employee });
});

router.delete('/employees/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.prepare('UPDATE employees SET is_active = 0 WHERE id = ?').run(id);
  res.json({ message: 'Employee deactivated' });
});

router.get('/attendance', (req, res) => {
  const { date, employee_id } = req.query;
  const targetDate = date || toISODate();
  let sql = `
    SELECT s.*, e.name, e.email FROM attendance_sessions s
    JOIN employees e ON e.id = s.employee_id
    WHERE date(s.check_in) = date(?)
  `;
  const params = [targetDate];
  if (employee_id) {
    sql += ' AND s.employee_id = ?';
    params.push(employee_id);
  }
  sql += ' ORDER BY s.check_in DESC';
  const sessions = db.prepare(sql).all(...params);
  res.json({
    date: targetDate,
    sessions: sessions.map((s) => ({
      ...sessionToSummary(s),
      employee_name: s.name,
      employee_email: s.email,
    })),
  });
});

router.get('/sessions', (req, res) => {
  const { limit = 100, employee_id } = req.query;
  let sql = `
    SELECT s.*, e.name, e.email FROM attendance_sessions s
    JOIN employees e ON e.id = s.employee_id
  `;
  const params = [];
  if (employee_id) {
    sql += ' WHERE s.employee_id = ?';
    params.push(employee_id);
  }
  sql += ' ORDER BY s.check_in DESC LIMIT ?';
  params.push(parseInt(limit, 10));
  const sessions = db.prepare(sql).all(...params);
  res.json({
    sessions: sessions.map((s) => ({
      ...sessionToSummary(s),
      employee_name: s.name,
      employee_email: s.email,
    })),
  });
});

router.get('/reports/monthly', (req, res) => {
  const month = req.query.month || monthKey();
  const from = `${month}-01`;
  const to = `${month}-31`;
  const employees = db.prepare('SELECT * FROM employees WHERE is_active = 1').all();
  const report = employees.map((emp) => {
    const sessions = getEmployeeSessions(emp.id, { from, to, limit: 500 });
    const agg = aggregateSessions(sessions);
    return {
      employee_id: emp.id,
      name: emp.name,
      email: emp.email,
      hourly_rate: emp.hourly_rate,
      ...agg,
      estimated_pay: Math.round(agg.total_work_hours * emp.hourly_rate * 100) / 100,
    };
  });
  res.json({ month, report });
});

router.get('/reports/payroll', (req, res) => {
  const month = req.query.month || monthKey();
  const from = `${month}-01`;
  const to = `${month}-31`;
  const employees = db.prepare('SELECT * FROM employees').all();
  const payroll = employees
    .filter((e) => e.is_active)
    .map((emp) => {
      const sessions = getEmployeeSessions(emp.id, { from, to, limit: 500 });
      const agg = aggregateSessions(sessions);
      const gross = Math.round(agg.total_work_hours * emp.hourly_rate * 100) / 100;
      return {
        employee_id: emp.id,
        name: emp.name,
        email: emp.email,
        hourly_rate: emp.hourly_rate,
        hours_worked: agg.total_work_hours,
        days_worked: agg.days_worked,
        gross_pay: gross,
      };
    });
  const total = payroll.reduce((s, p) => s + p.gross_pay, 0);
  res.json({ month, payroll, total_gross: Math.round(total * 100) / 100 });
});

router.get('/reports/employee/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { from, to } = req.query;
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  if (!emp) return res.status(404).json({ error: 'Not found' });
  const sessions = getEmployeeSessions(id, { from, to, limit: 500 });
  const agg = aggregateSessions(sessions);
  res.json({
    employee: emp,
    ...agg,
    sessions: sessions.map((s) => sessionToSummary(s)),
  });
});

router.get('/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  res.json({ settings });
});

router.put('/settings', (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Settings object required' });
  }
  const upsert = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  for (const [key, value] of Object.entries(settings)) {
    upsert.run(key, String(value));
  }
  res.json({ message: 'Settings updated' });
});

router.put('/settings/password', (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Valid current and new password (min 6 chars) required' });
  }
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.user.adminId);
  if (!bcrypt.compareSync(current_password, admin.password_hash)) {
    return res.status(401).json({ error: 'Current password incorrect' });
  }
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hash, admin.id);
  res.json({ message: 'Password updated' });
});

module.exports = router;
