import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register({ onAuthSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, phone, password });
      onAuthSuccess?.(res.data.user);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="card p-4 shadow-lg animate-pop" style={{ maxWidth: 420, width: '100%', borderRadius: '2rem' }}>
        <div className="text-center mb-3">
          <span style={{ fontSize: '2.5rem' }} role="img" aria-label="paw">🐾</span>
          <h2 className="fw-bold mt-2 animate-fadein">Create Your Account</h2>
          <p className="text-muted animate-fadein">Join the PetPaw family!</p>
        </div>
        {error && <div className="alert alert-danger animate-fadein" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="register-name" className="form-label">Name</label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              className="form-control"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label htmlFor="register-email" className="form-label">Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="register-phone" className="form-label">
              Phone <span className="text-muted fw-normal">(optional)</span>
            </label>
            <input
              id="register-phone"
              type="tel"
              autoComplete="tel"
              className="form-control"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+20 10 1234 5678"
            />
            <div className="form-text">So we can reach you about your booking.</div>
          </div>
          <div className="mb-3">
            <label htmlFor="register-password" className="form-label">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <div className="form-text">At least 8 characters.</div>
          </div>
          <button type="submit" className="btn btn-primary w-100 animate-rise" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : 'Register'}
            {loading ? ' Registering...' : ''}
          </button>
        </form>
        <div className="text-center mt-3 animate-fadein">
          <span className="text-muted">Already have an account? <Link to="/login">Login</Link></span>
        </div>
      </div>
    </div>
  );
}
