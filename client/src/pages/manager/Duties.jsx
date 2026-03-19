import { useState, useEffect } from 'react';
import { getDuties, createDuty, deleteDuty } from '../../api/duties';
import { getZones } from '../../api/zones';
import { getEmployees } from '../../api/users';

export default function Duties() {
  const [duties, setDuties] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({
    employee_id: '', zone_id: '', date: '', start_time: '', end_time: ''
  });
  const [message, setMessage] = useState('');

  function load() {
    getDuties().then(res => setDuties(res.data));
    getZones().then(res => setZones(res.data));
    getEmployees().then(res => setEmployees(res.data));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage('');
    try {
      await createDuty(form);
      setMessage('Duty created');
      setForm({ employee_id: '', zone_id: '', date: '', start_time: '', end_time: '' });
      load();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this duty?')) return;
    await deleteDuty(id);
    load();
  }

  return (
    <div>
      <h1>Manage Duties</h1>
      {message && <div className="message success">{message}</div>}

      <form onSubmit={handleCreate}>
        <label>Employee</label>
        <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} required>
          <option value="">Select employee</option>
          {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>)}
        </select>

        <label>Zone</label>
        <select value={form.zone_id} onChange={e => setForm({ ...form, zone_id: e.target.value })} required>
          <option value="">Select zone</option>
          {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>

        <label>Date</label>
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />

        <div className="form-row">
          <div>
            <label>Start Time</label>
            <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required />
          </div>
          <div>
            <label>End Time</label>
            <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: 15 }}>Create Duty</button>
      </form>

      <h2 style={{ marginTop: 20 }}>All Duties</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Time</th><th>Employee</th><th>Zone</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {duties.map(d => (
            <tr key={d.id}>
              <td>{d.date}</td>
              <td>{d.start_time} - {d.end_time}</td>
              <td>{d.employee_name}</td>
              <td>{d.zone_name}</td>
              <td><span className={`badge ${d.status}`}>{d.status}</span></td>
              <td>
                <button className="btn-danger" onClick={() => handleDelete(d.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
