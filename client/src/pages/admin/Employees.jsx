import { useState, useEffect } from 'react';
import { adminApi } from '../../api';

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', hourly_rate: 0 });
  const [error, setError] = useState('');

  const load = () => adminApi.employees().then((d) => setEmployees(d.employees));

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    try {
      if (modal === 'new') {
        await adminApi.createEmployee(form);
      } else {
        await adminApi.updateEmployee(modal.id, form);
      }
      setModal(null);
      setForm({ name: '', email: '', hourly_rate: 0 });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function openEdit(emp) {
    setForm({ name: emp.name, email: emp.email, hourly_rate: emp.hourly_rate });
    setModal(emp);
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Employees</h1>
        <button type="button" className="btn btn-primary" onClick={() => { setModal('new'); setForm({ name: '', email: '', hourly_rate: 0 }); }}>
          Add Employee
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Rate/hr</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.email}</td>
                <td>${e.hourly_rate}</td>
                <td>
                  <span className={`badge badge-${e.status === 'working' ? 'working' : e.status === 'on_break' ? 'break' : 'offline'}`}>
                    {e.status}
                  </span>
                </td>
                <td>
                  <button type="button" className="btn btn-secondary btn" style={{ marginRight: '0.5rem' }} onClick={() => openEdit(e)}>
                    Edit
                  </button>
                  {e.is_active && (
                    <button
                      type="button"
                      className="btn btn-ghost btn"
                      onClick={() => adminApi.deactivateEmployee(e.id).then(load)}
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(ev) => ev.stopPropagation()}>
            <h2>{modal === 'new' ? 'Add Employee' : 'Edit Employee'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(ev) => setForm({ ...form, name: ev.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(ev) => setForm({ ...form, email: ev.target.value })} required />
              </div>
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input type="number" step="0.01" min="0" value={form.hourly_rate} onChange={(ev) => setForm({ ...form, hourly_rate: parseFloat(ev.target.value) || 0 })} />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
