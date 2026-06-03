import { useState, useEffect } from 'react';
import { adminApi } from '../../api';

const today = new Date().toISOString().slice(0, 10);

export default function AdminAttendance() {
  const [date, setDate] = useState(today);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    adminApi.attendance({ date }).then((d) => setSessions(d.sessions));
  }, [date]);

  return (
    <>
      <h1 className="page-title">Attendance Monitoring</h1>
      <div className="form-group" style={{ maxWidth: 200, marginBottom: '1rem' }}>
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Work</th>
              <th>Break</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr><td colSpan={6} style={{ color: 'var(--text-muted)' }}>No records for this date.</td></tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id}>
                  <td>{s.employee_name}</td>
                  <td>{s.employee_email}</td>
                  <td>{new Date(s.check_in).toLocaleString()}</td>
                  <td>{s.check_out ? new Date(s.check_out).toLocaleString() : '—'}</td>
                  <td>{s.work_duration}</td>
                  <td>{s.break_duration}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
