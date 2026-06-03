import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EmployeeLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const nav = [
    { to: '/employee', label: 'Dashboard' },
    { to: '/employee/history', label: 'History' },
    { to: '/employee/summary', label: 'Summary' },
  ];

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">HEEW</div>
        <nav>
          {nav.map(({ to, label }) => (
            <Link key={to} to={to} className={location.pathname === to ? 'active' : ''}>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {user?.employee?.name || user?.employee?.email}
        </div>
        <button type="button" className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={handleLogout}>
          Sign Out
        </button>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
