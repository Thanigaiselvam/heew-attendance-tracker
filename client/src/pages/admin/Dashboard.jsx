import { useState, useEffect } from 'react';
import { adminApi } from '../../api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi.dashboard().then(setData);
  }, []);

  if (!data) return <p>Loading…</p>;

  const { stats, recentSessions } = data;

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <div className="grid-4">
        <div className="card stat-card">
          <h3>Active Employees</h3>
          <div className="value">{stats.totalEmployees}</div>
        </div>
        <div className="card stat-card">
          <h3>Checked In Today</h3>
          <div className="value">{stats.checkedInToday}</div>
        </div>
        <div className="card stat-card">
          <h3>Working Now</h3>
          <div className="value">{stats.activeNow - stats.onBreak}</div>
        </div>
        <div className="card stat-card">
          <h3>On Break</h3>
          <div className="value">{stats.onBreak}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent Sessions</h2>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Work Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentSessions.map((s) => (
              <tr key={s.id}>
                <td>{s.employee_name}</td>
                <td>{new Date(s.check_in).toLocaleString()}</td>
                <td>{s.check_out ? new Date(s.check_out).toLocaleString() : '—'}</td>
                <td>{s.work_duration}</td>
                <td>
                  <span className={`badge badge-${!s.check_out ? (s.status === 'on_break' ? 'break' : 'working') : 'completed'}`}>
                    {!s.check_out ? (s.status === 'on_break' ? 'Break' : 'Active') : 'Done'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
