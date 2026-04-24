import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import api from './api';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// AdminDashboard pulls in recharts (~130 KB gzip). Only admins need it, so
// defer the import until the route is hit.
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function RouteFallback() {
  return (
    <div className="text-center py-5">
      <span className="spinner-border" role="status" aria-label="Loading" />
    </div>
  );
}

function PrivateRoute({ children, adminOnly, user, authReady }) {
  if (!authReady) return null; // wait until /me resolves to avoid redirect flicker
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [pathname]);
  return null;
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 200);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return show ? (
    <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <span role="img" aria-label="Paw">🐾</span>
    </button>
  ) : null;
}

function App() {
  // Optimistic hydration from localStorage so the navbar doesn't flicker,
  // then verify with /api/auth/me.
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [authReady, setAuthReady] = useState(false);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Verify session on mount / app load
  useEffect(() => {
    let cancelled = false;
    api.get('/auth/me')
      .then(res => {
        if (cancelled) return;
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        localStorage.removeItem('user');
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* clear client state regardless */ }
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleAuthSuccess = (u) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const auth = !!user;

  return (
    <Router>
      <ScrollToTop />
      <nav className={`navbar navbar-expand-lg sticky-top shadow-sm modern-navbar ${theme}`}
        style={{ transition: 'background 0.3s', zIndex: 100 }}>
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">PetPaw</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/booking">Book</Link>
              </li>
              {!auth && <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>}
              {auth && user.role === 'user' && <li className="nav-item">
                <Link className="nav-link" to="/dashboard"><span role="img" aria-label="dashboard">📋</span> Dashboard</Link>
              </li>}
              {auth && user.role === 'admin' && <li className="nav-item">
                <Link className="nav-link" to="/admin"><span role="img" aria-label="admin">🛠️</span> Admin</Link>
              </li>}
              {auth && <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={handleLogout}><span role="img" aria-label="logout">🚪</span> Logout</button>
              </li>}
              <li className="nav-item ms-2">
                <button
                  className="btn btn-light mode-toggle"
                  aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                  title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                >
                  <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="page-transition container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Booking user={user} authReady={authReady} />} />
          <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/register" element={<Register onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/dashboard" element={<PrivateRoute user={user} authReady={authReady}><Dashboard /></PrivateRoute>} />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly user={user} authReady={authReady}>
                <Suspense fallback={<RouteFallback />}>
                  <AdminDashboard />
                </Suspense>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
      <BackToTop />
      <footer>
        <div>
          <span role="img" aria-label="paw">🐾</span> Made with <span style={{color:'#ff8c42'}}>❤️</span> for pets &amp; their people. &copy; {new Date().getFullYear()} <a href="mailto:mostafagenydy@gmail.com" style={{color: 'inherit', textDecoration: 'none'}} title="Mostafa Genidy">Mostafa Genidy</a>
        </div>
        <div style={{marginTop:'0.5rem'}}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="mx-2" title="Facebook">🐶</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="mx-2" title="Instagram">🐱</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="mx-2" title="Twitter">🐾</a>
        </div>
      </footer>
    </Router>
  );
}

export default App;
