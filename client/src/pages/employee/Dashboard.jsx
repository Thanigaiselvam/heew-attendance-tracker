import { useState, useEffect, useCallback } from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { employeeApi } from '../../api';

function StatusBadge({ status }) {
  const map = {
    working: { class: 'badge-working', label: 'Working' },
    on_break: { class: 'badge-break', label: 'On Break' },
    offline: { class: 'badge-offline', label: 'Offline' },
  };
  const s = map[status] || map.offline;
  return <span className={`badge ${s.class}`}>{s.label}</span>;
}

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [daysWorked, setDaysWorked] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [me, d, m, dw] = await Promise.all([
        employeeApi.me(),
        employeeApi.dailySummary(),
        employeeApi.monthlySummary(),
        employeeApi.daysWorked(),
      ]);
      setData(me);
      setDaily(d);
      setMonthly(m);
      setDaysWorked(dw);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  async function action(fn) {
    setActionLoading(true);
    setError('');
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  const status = data?.status || 'offline';

  return (
    <EmployeeLayout>
      <h1 className="page-title">Dashboard</h1>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className={`status-banner ${status === 'on_break' ? 'break' : status === 'working' ? 'working' : 'offline'}`}>
            <div>
              <strong>Work Status</strong>
              <div style={{ marginTop: '0.35rem' }}>
                <StatusBadge status={status} />
              </div>
              {data?.currentSession && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Checked in: {new Date(data.currentSession.check_in).toLocaleString()}
                  {data.currentSession.work_duration && ` · Session: ${data.currentSession.work_duration}`}
                </p>
              )}
            </div>
          </div>

          <div className="action-panel">
            {status === 'offline' && (
              <button type="button" className="btn btn-success" disabled={actionLoading} onClick={() => action(employeeApi.checkIn)}>
                Check In
              </button>
            )}
            {status === 'working' && (
              <>
                <button type="button" className="btn btn-warning" disabled={actionLoading} onClick={() => action(employeeApi.break)}>
                  Take Break
                </button>
                <button type="button" className="btn btn-danger" disabled={actionLoading} onClick={() => action(employeeApi.logout)}>
                  Final Logout
                </button>
              </>
            )}
            {status === 'on_break' && (
              <>
                <button type="button" className="btn btn-primary" disabled={actionLoading} onClick={() => action(employeeApi.resume)}>
                  Resume Work
                </button>
                <button type="button" className="btn btn-danger" disabled={actionLoading} onClick={() => action(employeeApi.logout)}>
                  Final Logout
                </button>
              </>
            )}
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div className="grid-4" style={{ marginTop: '1.5rem' }}>
            <div className="card stat-card">
              <h3>Today</h3>
              <div className="value">{daily?.total_work_duration || '0h 0m'}</div>
            </div>
            <div className="card stat-card">
              <h3>This Month</h3>
              <div className="value">{monthly?.total_work_hours ?? 0}h</div>
            </div>
            <div className="card stat-card">
              <h3>Days Worked</h3>
              <div className="value">{daysWorked?.count ?? 0}</div>
            </div>
            <div className="card stat-card">
              <h3>Month Sessions</h3>
              <div className="value">{monthly?.session_count ?? 0}</div>
            </div>
          </div>
        </>
      )}
    </EmployeeLayout>
  );
}
