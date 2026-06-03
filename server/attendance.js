const db = require('./db');
const { msBetween, formatDuration, formatHoursDecimal, nowUTC } = require('./utils');

function getOpenBreak(sessionId) {
  return db
    .prepare(
      `SELECT * FROM break_logs WHERE session_id = ? AND break_end IS NULL ORDER BY id DESC LIMIT 1`
    )
    .get(sessionId);
}

function getSessionBreakMs(sessionId, until = nowUTC()) {
  const breaks = db
    .prepare(`SELECT break_start, break_end FROM break_logs WHERE session_id = ?`)
    .all(sessionId);
  return breaks.reduce((sum, b) => {
    const end = b.break_end || until;
    return sum + msBetween(b.break_start, end);
  }, 0);
}

function getSessionWorkMs(session, until = nowUTC()) {
  const end = session.check_out || until;
  const gross = msBetween(session.check_in, end);
  const breakMs = getSessionBreakMs(session.id, end);
  return Math.max(0, gross - breakMs);
}

function getEmployeeOpenSession(employeeId) {
  return db
    .prepare(
      `SELECT * FROM attendance_sessions WHERE employee_id = ? AND check_out IS NULL ORDER BY id DESC LIMIT 1`
    )
    .get(employeeId);
}

function deriveStatus(session) {
  if (!session) return 'offline';
  const openBreak = getOpenBreak(session.id);
  if (openBreak) return 'on_break';
  return session.status === 'working' ? 'working' : 'working';
}

function sessionToSummary(session, until = nowUTC()) {
  const workMs = getSessionWorkMs(session, until);
  const breakMs = getSessionBreakMs(session.id, session.check_out || until);
  return {
    ...session,
    work_ms: workMs,
    break_ms: breakMs,
    work_duration: formatDuration(workMs),
    work_hours: formatHoursDecimal(workMs),
    break_duration: formatDuration(breakMs),
    status: deriveStatus(session),
  };
}

function getEmployeeSessions(employeeId, { from, to, limit = 100 } = {}) {
  let sql = `SELECT * FROM attendance_sessions WHERE employee_id = ?`;
  const params = [employeeId];
  if (from) {
    sql += ` AND date(check_in) >= date(?)`;
    params.push(from);
  }
  if (to) {
    sql += ` AND date(check_in) <= date(?)`;
    params.push(to);
  }
  sql += ` ORDER BY check_in DESC LIMIT ?`;
  params.push(limit);
  return db.prepare(sql).all(...params);
}

function aggregateSessions(sessions, until = nowUTC()) {
  let totalWorkMs = 0;
  let totalBreakMs = 0;
  const days = new Set();

  for (const s of sessions) {
    const summary = sessionToSummary(s, until);
    totalWorkMs += summary.work_ms;
    totalBreakMs += summary.break_ms;
    days.add(s.check_in.slice(0, 10));
  }

  return {
    total_work_ms: totalWorkMs,
    total_break_ms: totalBreakMs,
    total_work_duration: formatDuration(totalWorkMs),
    total_work_hours: formatHoursDecimal(totalWorkMs),
    total_break_duration: formatDuration(totalBreakMs),
    days_worked: days.size,
    session_count: sessions.length,
  };
}

module.exports = {
  getOpenBreak,
  getSessionBreakMs,
  getSessionWorkMs,
  getEmployeeOpenSession,
  deriveStatus,
  sessionToSummary,
  getEmployeeSessions,
  aggregateSessions,
  nowUTC,
};
