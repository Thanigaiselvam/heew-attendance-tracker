function parseDate(d) {
  return d ? new Date(d.replace(' ', 'T') + (d.includes('Z') ? '' : 'Z')) : null;
}

function msBetween(start, end) {
  if (!start || !end) return 0;
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e || e < s) return 0;
  return e - s;
}

function formatDuration(ms) {
  if (!ms || ms < 0) return '0h 0m';
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m}m`;
}

function formatHoursDecimal(ms) {
  return Math.round((ms / 3600000) * 100) / 100;
}

function toISODate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function monthKey(d = new Date()) {
  return d.toISOString().slice(0, 7);
}

function nowUTC() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

module.exports = {
  parseDate,
  msBetween,
  formatDuration,
  formatHoursDecimal,
  toISODate,
  monthKey,
  nowUTC,
};
