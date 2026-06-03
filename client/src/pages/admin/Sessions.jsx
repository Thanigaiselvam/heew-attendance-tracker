import { useState, useEffect } from 'react';
import { adminApi } from '../../api';

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    adminApi.sessions({ limit: 100 }).then((d) => setSessions(d.sessions));
  }, []);

  return (
    <>
      <h1 className="page-title">Session Logs</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Work Time</th>
              <th>Break</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.employee_name}</td>
                <td>{new Date(s.check_in).toLocaleString()}</td>
                <td>{s.check_out ? new Date(s.check_out).toLocaleString() : 'Active'}</td>
                <td>{s.work_duration}</td>
                <td>{s.break_duration}</td>
                <td>{s.work_hours}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
