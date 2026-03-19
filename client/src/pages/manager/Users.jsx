import { useState, useEffect } from 'react';
import { getPendingUsers, approveUser, rejectUser } from '../../api/users';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  function load() {
    getPendingUsers().then(res => setUsers(res.data));
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(id) {
    await approveUser(id);
    setMessage('User approved');
    load();
  }

  async function handleReject(id) {
    if (!confirm('Reject this user?')) return;
    await rejectUser(id);
    setMessage('User rejected');
    load();
  }

  return (
    <div>
      <h1>Pending Users</h1>
      {message && <div className="message success">{message}</div>}
      {users.length === 0 ? (
        <p>No pending users.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Registered</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.created_at}</td>
                <td>
                  <button className="btn-success" onClick={() => handleApprove(u.id)}>Approve</button>
                  <button className="btn-danger" onClick={() => handleReject(u.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
