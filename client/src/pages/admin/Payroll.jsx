import { useState, useEffect } from 'react';
import { adminApi } from '../../api';

const thisMonth = new Date().toISOString().slice(0, 7);

export default function AdminPayroll() {
  const [month, setMonth] = useState(thisMonth);
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi.payroll(month).then(setData);
  }, [month]);

  return (
    <>
      <h1 className="page-title">Payroll Summary</h1>
      <div className="form-group" style={{ maxWidth: 200, marginBottom: '1rem' }}>
        <label>Month</label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      {data && (
        <>
          <div className="card stat-card" style={{ marginBottom: '1.5rem', maxWidth: 280 }}>
            <h3>Total Gross Payroll</h3>
            <div className="value">${data.total_gross?.toFixed(2)}</div>
          </div>
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Hours</th>
                  <th>Days</th>
                  <th>Rate/hr</th>
                  <th>Gross Pay</th>
                </tr>
              </thead>
              <tbody>
                {data.payroll.map((p) => (
                  <tr key={p.employee_id}>
                    <td>{p.name}</td>
                    <td>{p.hours_worked}h</td>
                    <td>{p.days_worked}</td>
                    <td>${p.hourly_rate}</td>
                    <td><strong>${p.gross_pay?.toFixed(2)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
