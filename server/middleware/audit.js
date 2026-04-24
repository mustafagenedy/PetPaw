const AuditLog = require('../models/AuditLog');

// Fire-and-forget. Never blocks the response and never throws to the caller —
// if audit writes start failing we still serve the user, and we log the error
// so ops can alert on it.
function logAudit(req, { action, target = null, meta = undefined } = {}) {
  if (!req?.user || !action) return;
  const payload = {
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action,
    target: target || undefined,
    meta,
    ip: req.ip,
  };
  AuditLog.create(payload).catch(err => {
    console.error('[audit] failed to write entry:', err.message);
  });
}

module.exports = { logAudit };
