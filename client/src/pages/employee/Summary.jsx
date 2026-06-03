import { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { employeeApi } from '../../api';

const today = new Date().toISOString().slice(0, 10);
const thisMonth = new Date().toISOString().slice(0, 7);

export default function EmployeeSummary() {
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(thisMonth);
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [days, setDays] = useState(null);

  useEffect(() => {
    employeeApi.dailySummary(date).then(setDaily);
  }, [date]);

  useEffect(() => {
    employeeApi.monthlySummary(month).then(setMonthly);
    employeeApi.daysWorked(month).then(setDays);
  }, [month]);

  return (
    <EmployeeLayout>
      <h1 className="page-title">Time Summary</h1>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Daily Summary</h2>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {daily && (
            <div className="grid-2">
              <div className="stat-card">
                <h3>Work Time</h3>
                <div className="value">{daily.total_work_duration}</div>
              </div>
              <div className="stat-card">
                <h3>Hours</h3>
                <div className="value">{daily.total_work_hours}h</div>
              </div>
              <div className="stat-card">
                <h3>Breaks</h3>
                <div className="value">{daily.total_break_duration}</div>
              </div>
              <div className="stat-card">
                <h3>Sessions</h3>
                <div className="value">{daily.session_count}</div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Monthly Summary</h2>
          <div className="form-group">
            <label>Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          {monthly && (
            <div className="grid-2">
              <div className="stat-card">
                <h3>Total Hours</h3>
                <div className="value">{monthly.total_work_hours}h</div>
              </div>
              <div className="stat-card">
                <h3>Days Worked</h3>
                <div className="value">{monthly.days_worked}</div>
              </div>
              <div className="stat-card">
                <h3>Total Work</h3>
                <div className="value">{monthly.total_work_duration}</div>
              </div>
              <div className="stat-card">
                <h3>Sessions</h3>
                <div className="value">{monthly.session_count}</div>
              </div>
            </div>
          )}
          {days?.days?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Days worked</h3>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>{days.days.join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}
