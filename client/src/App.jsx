import { useEffect, useState } from 'react';
import { Link, Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function PrivateRoute({ children, adminOnly }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
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
  const [auth, setAuth] = useState(!!localStorage.getItem('token'));
  const [theme, setTheme] = useState('light');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
    window.location.href = '/';
  };
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);
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
                <button className="btn btn-light mode-toggle" title="Toggle light/dark mode" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                  {theme === 'light' ? <span role="img" aria-label="moon">🌙</span> : <span role="img" aria-label="sun">☀️</span>}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="page-transition container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="/register" element={<Register setAuth={setAuth} />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>} />
        </Routes>
      </div>
      <BackToTop />
      <footer>
        <div>
          <span role="img" aria-label="paw">🐾</span> Made with <span style={{color:'#ff8c42'}}>❤️</span> for pets &amp; their people. &copy; {new Date().getFullYear()} <a href="mailto:codegenix.eg@gmail.com" style={{color: 'inherit', textDecoration: 'none'}} title="CodeGenix">CodeGenix</a>
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
