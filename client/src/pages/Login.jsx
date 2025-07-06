import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setAuth }) {
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
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setAuth && setAuth(true);
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
        {error && <div className="alert alert-danger animate-fadein">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-100 animate-bounce" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : 'Login'}
            {loading ? ' Logging in...' : ''}
          </button>
        </form>
        <div className="text-center mt-3 animate-fadein">
          <span className="text-muted">Don't have an account? <a href="/register">Register</a></span>
        </div>
      </div>
    </div>
  );
} 