const crypto = require('crypto');

// Double-submit cookie CSRF: client reads the non-HttpOnly `csrf` cookie
// and echoes it in the X-CSRF-Token header on mutating requests.
// Both values must be present AND equal (constant-time compare) for the
// request to proceed.
function csrfProtect(req, res, next) {
  const cookie = req.cookies?.csrf;
  const header = req.headers['x-csrf-token'];
  if (!cookie || !header) {
    return res.status(403).json({ message: 'CSRF token missing' });
  }
  if (cookie.length !== header.length) {
    return res.status(403).json({ message: 'CSRF token invalid' });
  }
  try {
    const ok = crypto.timingSafeEqual(Buffer.from(cookie), Buffer.from(header));
    if (!ok) return res.status(403).json({ message: 'CSRF token invalid' });
  } catch {
    return res.status(403).json({ message: 'CSRF token invalid' });
  }
  next();
}

module.exports = { csrfProtect };
