import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Duty Scheduling System</h1>
      <p>Parking monitoring and duty management system.</p>

      {!user && (
        <div style={{ marginTop: 20 }}>
          <Link to="/login"><button className="btn-primary">Login</button></Link>
          <Link to="/register"><button className="btn-secondary">Register</button></Link>
        </div>
      )}

      {user?.role === 'manager' && (
        <div style={{ marginTop: 20 }}>
          <p>Welcome, manager. Use the navigation to manage users, zones, duties, and reports.</p>
        </div>
      )}

      {user?.role === 'employee' && (
        <div style={{ marginTop: 20 }}>
          <p>Welcome, {user.name}. Check your <Link to="/employee/duties">assigned duties</Link>.</p>
        </div>
      )}
    </div>
  );
}
