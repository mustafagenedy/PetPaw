import axios from 'axios';

// In dev: VITE_API_URL unset → `/api` is proxied to the server by Vite.
// In prod: set VITE_API_URL to the server origin (e.g. https://api.petpaw.com)
// at build time, and paths become absolute.
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// CSRF: the server returns a csrfToken in the response body of /auth/login,
// /auth/register, and /auth/me. We stash it in localStorage and echo it on
// every mutating request as X-CSRF-Token.
//
// Why not read it from `document.cookie`? In a cross-site deployment
// (Vercel frontend → Render API) the browser sends the csrf cookie as a
// credential thanks to SameSite=None+Secure, but it will NOT expose that
// cookie to JS on the frontend's origin — different eTLD+1. Storing the
// token in localStorage is fine: XSS that reads it can't do anything an
// attacker with XSS couldn't already do (they're already in the page),
// and the actual session JWT stays in an HttpOnly cookie out of XSS reach.
const CSRF_KEY = 'csrfToken';

export function setCsrfToken(token) {
  if (token) localStorage.setItem(CSRF_KEY, token);
  else localStorage.removeItem(CSRF_KEY);
}

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (!['get', 'head', 'options'].includes(method)) {
    const csrf = localStorage.getItem(CSRF_KEY);
    if (csrf) {
      config.headers = config.headers || {};
      config.headers['X-CSRF-Token'] = csrf;
    }
  }
  return config;
});

export default api;
