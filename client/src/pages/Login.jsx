import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      loginWithToken(token).then(() => navigate('/')).catch(() => setError('Google login failed'));
    }
    const pending = searchParams.get('pending');
    if (pending) setError('Account pending manager approval.');
    const errParam = searchParams.get('error');
    if (errParam) setError('Google authentication failed.');
  }, []);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'manager' ? '/manager/users' : '/employee/duties');
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await loginApi({ email, password });
      await loginWithToken(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div>
      <h1>Login</h1>
      {error && <div className="message error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <div style={{ marginTop: 15 }}>
          <button type="submit" className="btn-primary">Login</button>
        </div>
      </form>
      <a href="/api/auth/google" className="google-btn">Sign in with Google</a>
    </div>
  );
}
