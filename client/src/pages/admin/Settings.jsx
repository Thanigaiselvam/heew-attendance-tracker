import { useState, useEffect } from 'react';
import { adminApi } from '../../api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.settings().then((d) => setSettings(d.settings));
  }, []);

  async function saveSettings(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await adminApi.updateSettings(settings);
      setMsg('Settings saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await adminApi.changePassword(passwords.current_password, passwords.new_password);
      setMsg('Password updated.');
      setPasswords({ current_password: '', new_password: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1 className="page-title">System Settings</h1>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>General</h2>
          <form onSubmit={saveSettings}>
            <div className="form-group">
              <label>Company Name</label>
              <input value={settings.company_name || ''} onChange={(e) => setSettings({ ...settings, company_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Work Hours Per Day</label>
              <input value={settings.work_hours_per_day || ''} onChange={(e) => setSettings({ ...settings, work_hours_per_day: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <input value={settings.timezone || ''} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <input value={settings.currency || ''} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Save Settings</button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Change Admin Password</h2>
          <form onSubmit={changePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={passwords.current_password} onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" minLength={6} value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary">Update Password</button>
          </form>
        </div>
      </div>

      {msg && <p style={{ color: 'var(--success)', marginTop: '1rem' }}>{msg}</p>}
      {error && <p className="error-msg">{error}</p>}
    </>
  );
}
