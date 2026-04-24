const mongoose = require('mongoose');

// Append-only record of admin (and security-sensitive) mutations.
// `meta` is free-form and intended for small context (e.g. { status: 'cancelled' }),
// not for dumping the full diff.
const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorName: { type: String },
  actorEmail: { type: String },
  action: { type: String, required: true, index: true },
  target: {
    type: { type: String },
    id: { type: mongoose.Schema.Types.ObjectId },
    label: { type: String },
  },
  meta: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  // TTL: auto-delete entries older than 2 years. MongoDB's TTL monitor runs
  // once a minute; entries are evicted lazily after createdAt + expireAfterSeconds.
  createdAt: { type: Date, default: Date.now, index: true, expires: '730d' },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
