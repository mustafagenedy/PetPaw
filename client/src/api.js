import axios from 'axios';

// Central axios instance. Cookies (token + csrf) ride on every request.
// Mutating requests (non-GET/HEAD/OPTIONS) get the CSRF token echoed in
// an X-CSRF-Token header — server verifies it matches the csrf cookie.
// In dev: VITE_API_URL unset → `/api` is proxied to the server by Vite.
// In prod: set VITE_API_URL to the server origin (e.g. https://api.petpaw.com)
// at build time, and paths become absolute.
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

function getCookie(name) {
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.split('=')[1]) : null;
}

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (!['get', 'head', 'options'].includes(method)) {
    const csrf = getCookie('csrf');
    if (csrf) {
      config.headers = config.headers || {};
      config.headers['X-CSRF-Token'] = csrf;
    }
  }
  return config;
});

export default api;
