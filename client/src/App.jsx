import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeHistory from './pages/employee/History';
import EmployeeSummary from './pages/employee/Summary';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminEmployees from './pages/admin/Employees';
import AdminAttendance from './pages/admin/Attendance';
import AdminSessions from './pages/admin/Sessions';
import AdminReports from './pages/admin/Reports';
import AdminPayroll from './pages/admin/Payroll';
import AdminSettings from './pages/admin/Settings';

function Protected({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/employee"
        element={
          <Protected role="employee">
            <EmployeeDashboard />
          </Protected>
        }
      />
      <Route
        path="/employee/history"
        element={
          <Protected role="employee">
            <EmployeeHistory />
          </Protected>
        }
      />
      <Route
        path="/employee/summary"
        element={
          <Protected role="employee">
            <EmployeeSummary />
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <Protected role="admin">
            <AdminLayout />
          </Protected>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="sessions" element={<AdminSessions />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="payroll" element={<AdminPayroll />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
