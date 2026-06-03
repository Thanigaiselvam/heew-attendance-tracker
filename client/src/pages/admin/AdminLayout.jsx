import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const nav = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/employees', label: 'Employees' },
    { to: '/admin/attendance', label: 'Attendance' },
    { to: '/admin/sessions', label: 'Session Logs' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/payroll', label: 'Payroll' },
    { to: '/admin/settings', label: 'Settings' },
  ];

  function handleLogout() {
    logout();
    navigate('/');
  }

  const isActive = (to, end) =>
    end ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">HEEW Admin</div>
        <nav>
          {nav.map(({ to, label, end }) => (
            <Link key={to} to={to} className={isActive(to, end) ? 'active' : ''}>
              {label}
            </Link>
          ))}
        </nav>
        <button type="button" className="btn btn-ghost" style={{ marginTop: 'auto' }} onClick={handleLogout}>
          Sign Out
        </button>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
