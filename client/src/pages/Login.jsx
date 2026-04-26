import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { setCsrfToken } from '../api';

export default function Login({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setCsrfToken(res.data.csrfToken);
      onAuthSuccess?.(res.data.user);
      setLoading(false);
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="card p-4 shadow-lg animate-pop" style={{ maxWidth: 400, width: '100%', borderRadius: '2rem' }}>
        <div className="text-center mb-3">
          <span style={{ fontSize: '2.5rem' }} role="img" aria-label="paw">🐾</span>
          <h2 className="fw-bold mt-2 animate-fadein">Welcome Back!</h2>
          <p className="text-muted animate-fadein">Login to your PetPaw account</p>
        </div>
        {error && <div className="alert alert-danger animate-fadein" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="login-email" className="form-label">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 animate-rise" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : 'Login'}
            {loading ? ' Logging in...' : ''}
          </button>
        </form>
        <div className="text-center mt-3 animate-fadein">
          <span className="text-muted">Don't have an account? <Link to="/register">Register</Link></span>
        </div>
      </div>
    </div>
  );
}
