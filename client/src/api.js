const API = '/api';

function getToken() {
  return localStorage.getItem('heew_token');
}

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const auth = {
  adminLogin: (email, password) =>
    api('/auth/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  employeeLogin: (email) =>
    api('/auth/employee/login', { method: 'POST', body: JSON.stringify({ email }) }),
};

export const employeeApi = {
  me: () => api('/employee/me'),
  checkIn: () => api('/employee/check-in', { method: 'POST' }),
  break: () => api('/employee/break', { method: 'POST' }),
  resume: () => api('/employee/resume', { method: 'POST' }),
  logout: () => api('/employee/logout', { method: 'POST' }),
  history: (params) => api(`/employee/history?${new URLSearchParams(params)}`),
  dailySummary: (date) => api(`/employee/summary/daily?date=${date || ''}`),
  monthlySummary: (month) => api(`/employee/summary/monthly?month=${month || ''}`),
  daysWorked: (month) => api(`/employee/days-worked?month=${month || ''}`),
};

export const adminApi = {
  dashboard: () => api('/admin/dashboard'),
  employees: () => api('/admin/employees'),
  createEmployee: (body) => api('/admin/employees', { method: 'POST', body: JSON.stringify(body) }),
  updateEmployee: (id, body) =>
    api(`/admin/employees/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deactivateEmployee: (id) => api(`/admin/employees/${id}`, { method: 'DELETE' }),
  attendance: (params) => api(`/admin/attendance?${new URLSearchParams(params)}`),
  sessions: (params) => api(`/admin/sessions?${new URLSearchParams(params)}`),
  monthlyReport: (month) => api(`/admin/reports/monthly?month=${month || ''}`),
  payroll: (month) => api(`/admin/reports/payroll?month=${month || ''}`),
  employeeReport: (id, params) =>
    api(`/admin/reports/employee/${id}?${new URLSearchParams(params)}`),
  settings: () => api('/admin/settings'),
  updateSettings: (settings) =>
    api('/admin/settings', { method: 'PUT', body: JSON.stringify({ settings }) }),
  changePassword: (current_password, new_password) =>
    api('/admin/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, new_password }),
    }),
};
