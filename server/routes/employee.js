const express = require('express');
const db = require('../db');
const { authMiddleware, employeeOnly } = require('../auth');
const {
  getEmployeeOpenSession,
  deriveStatus,
  sessionToSummary,
  getEmployeeSessions,
  aggregateSessions,
  getOpenBreak,
  nowUTC,
} = require('../attendance');
const { toISODate, monthKey } = require('../utils');

const router = express.Router();
router.use(authMiddleware, employeeOnly);

router.get('/me', (req, res) => {
  const employee = db
    .prepare('SELECT id, name, email, hourly_rate FROM employees WHERE id = ?')
    .get(req.user.employeeId);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const session = getEmployeeOpenSession(employee.id);
  const status = deriveStatus(session);
  const currentSession = session ? sessionToSummary(session) : null;

  res.json({ employee, status, currentSession });
});

router.post('/check-in', (req, res) => {
  const employeeId = req.user.employeeId;
  const existing = getEmployeeOpenSession(employeeId);
  if (existing) {
    return res.status(400).json({ error: 'Already checked in. Log out first or continue session.' });
  }
  const ts = nowUTC();
  const result = db
    .prepare(
      `INSERT INTO attendance_sessions (employee_id, check_in, status) VALUES (?, ?, 'working')`
    )
    .run(employeeId, ts);
  const session = db
    .prepare('SELECT * FROM attendance_sessions WHERE id = ?')
    .get(result.lastInsertRowid);
  res.json({ message: 'Checked in', session: sessionToSummary(session) });
});

router.post('/break', (req, res) => {
  const session = getEmployeeOpenSession(req.user.employeeId);
  if (!session) return res.status(400).json({ error: 'Not checked in' });
  if (getOpenBreak(session.id)) {
    return res.status(400).json({ error: 'Already on break' });
  }
  const ts = nowUTC();
  db.prepare(
    `INSERT INTO break_logs (session_id, break_start) VALUES (?, ?)`
  ).run(session.id, ts);
  db.prepare(`UPDATE attendance_sessions SET status = 'on_break' WHERE id = ?`).run(session.id);
  res.json({ message: 'Break started', session: sessionToSummary(session) });
});

router.post('/resume', (req, res) => {
  const session = getEmployeeOpenSession(req.user.employeeId);
  if (!session) return res.status(400).json({ error: 'Not checked in' });
  const openBreak = getOpenBreak(session.id);
  if (!openBreak) return res.status(400).json({ error: 'Not on break' });
  const ts = nowUTC();
  db.prepare(`UPDATE break_logs SET break_end = ? WHERE id = ?`).run(ts, openBreak.id);
  db.prepare(`UPDATE attendance_sessions SET status = 'working' WHERE id = ?`).run(session.id);
  const updated = db.prepare('SELECT * FROM attendance_sessions WHERE id = ?').get(session.id);
  res.json({ message: 'Work resumed', session: sessionToSummary(updated) });
});

router.post('/logout', (req, res) => {
  const session = getEmployeeOpenSession(req.user.employeeId);
  if (!session) return res.status(400).json({ error: 'Not checked in' });
  const ts = nowUTC();
  const openBreak = getOpenBreak(session.id);
  if (openBreak) {
    db.prepare(`UPDATE break_logs SET break_end = ? WHERE id = ?`).run(ts, openBreak.id);
  }
  db.prepare(`UPDATE attendance_sessions SET check_out = ?, status = 'completed' WHERE id = ?`).run(
    ts,
    session.id
  );
  const updated = db.prepare('SELECT * FROM attendance_sessions WHERE id = ?').get(session.id);
  res.json({ message: 'Logged out', session: sessionToSummary(updated) });
});

router.get('/history', (req, res) => {
  const { from, to, limit } = req.query;
  const sessions = getEmployeeSessions(req.user.employeeId, {
    from,
    to,
    limit: limit ? parseInt(limit, 10) : 50,
  });
  res.json({
    sessions: sessions.map((s) => sessionToSummary(s)),
  });
});

router.get('/summary/daily', (req, res) => {
  const date = req.query.date || toISODate();
  const sessions = getEmployeeSessions(req.user.employeeId, { from: date, to: date });
  const agg = aggregateSessions(sessions);
  res.json({ date, ...agg, sessions: sessions.map((s) => sessionToSummary(s)) });
});

router.get('/summary/monthly', (req, res) => {
  const month = req.query.month || monthKey();
  const from = `${month}-01`;
  const to = `${month}-31`;
  const sessions = getEmployeeSessions(req.user.employeeId, { from, to, limit: 500 });
  const agg = aggregateSessions(sessions);
  res.json({ month, ...agg });
});

router.get('/days-worked', (req, res) => {
  const month = req.query.month || monthKey();
  const rows = db
    .prepare(
      `SELECT DISTINCT date(check_in) as day FROM attendance_sessions
       WHERE employee_id = ? AND strftime('%Y-%m', check_in) = ?
       ORDER BY day DESC`
    )
    .all(req.user.employeeId, month);
  res.json({ month, days: rows.map((r) => r.day), count: rows.length });
});

module.exports = router;
