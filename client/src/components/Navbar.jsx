import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Home</Link>

      {!user && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}

      {user?.role === 'manager' && (
        <>
          <Link to="/manager/users">Users</Link>
          <Link to="/manager/zones">Zones</Link>
          <Link to="/manager/duties">Duties</Link>
          <Link to="/manager/reports">Reports</Link>
        </>
      )}

      {user?.role === 'employee' && (
        <Link to="/employee/duties">My Duties</Link>
      )}

      <span className="spacer" />

      {user && (
        <>
          <span style={{ color: '#ecf0f1' }}>{user.name} ({user.role})</span>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </nav>
  );
}
