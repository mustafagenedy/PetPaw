const crypto = require('crypto');

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const isProd = () => process.env.NODE_ENV === 'production';

// SameSite:
//   - 'lax' (default) works when client + API are same-site (e.g. petpaw.com + api.petpaw.com)
//   - 'none' required when client + API are cross-site (e.g. vercel.app + onrender.com)
//     — browsers require Secure=true when SameSite=None
const sameSite = () => {
  const v = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();
  return ['lax', 'strict', 'none'].includes(v) ? v : 'lax';
};
const secure = () => isProd() || sameSite() === 'none';

const tokenCookieOptions = () => ({
  httpOnly: true,
  secure: secure(),
  sameSite: sameSite(),
  maxAge: SEVEN_DAYS_MS,
  path: '/',
});

// CSRF cookie must be readable by client JS (double-submit pattern).
const csrfCookieOptions = () => ({
  httpOnly: false,
  secure: secure(),
  sameSite: sameSite(),
  maxAge: SEVEN_DAYS_MS,
  path: '/',
});

function issueSession(res, token) {
  res.cookie('token', token, tokenCookieOptions());
  const csrf = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf', csrf, csrfCookieOptions());
  return csrf;
}

function clearSession(res) {
  res.clearCookie('token', { path: '/' });
  res.clearCookie('csrf', { path: '/' });
}

module.exports = { issueSession, clearSession };
