import { useState, useEffect } from 'react';
import { adminApi } from '../../api';

const thisMonth = new Date().toISOString().slice(0, 7);

export default function AdminReports() {
  const [month, setMonth] = useState(thisMonth);
  const [report, setReport] = useState([]);

  useEffect(() => {
    adminApi.monthlyReport(month).then((d) => setReport(d.report));
  }, [month]);

  return (
    <>
      <h1 className="page-title">Monthly Attendance Reports</h1>
      <div className="form-group" style={{ maxWidth: 200, marginBottom: '1rem' }}>
        <label>Month</label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Days Worked</th>
              <th>Total Hours</th>
              <th>Sessions</th>
              <th>Rate</th>
              <th>Est. Pay</th>
            </tr>
          </thead>
          <tbody>
            {report.map((r) => (
              <tr key={r.employee_id}>
                <td>{r.name}</td>
                <td>{r.days_worked}</td>
                <td>{r.total_work_hours}h</td>
                <td>{r.session_count}</td>
                <td>${r.hourly_rate}</td>
                <td>${r.estimated_pay?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
