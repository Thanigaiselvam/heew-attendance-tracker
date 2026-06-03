import { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { employeeApi } from '../../api';

export default function EmployeeHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeApi.history({ limit: 50 }).then((d) => setSessions(d.sessions)).finally(() => setLoading(false));
  }, []);

  return (
    <EmployeeLayout>
      <h1 className="page-title">Attendance History</h1>
      <div className="card">
        {loading ? (
          <p>Loading…</p>
        ) : sessions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No attendance records yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Time</th>
                <th>Break</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.check_in).toLocaleString()}</td>
                  <td>{s.check_out ? new Date(s.check_out).toLocaleString() : '—'}</td>
                  <td>{s.work_duration}</td>
                  <td>{s.break_duration}</td>
                  <td>
                    <span className={`badge badge-${s.check_out ? 'completed' : s.status === 'on_break' ? 'break' : 'working'}`}>
                      {s.check_out ? 'Completed' : s.status === 'on_break' ? 'On Break' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </EmployeeLayout>
  );
}
