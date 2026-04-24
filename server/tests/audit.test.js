const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { startTestEnv, stopTestEnv, wipeCollections, registerUser, makeAdmin } = require('./helpers');
const AuditLog = require('../models/AuditLog');

let app;

before(async () => { app = await startTestEnv(); });
after(async () => { await stopTestEnv(); });
beforeEach(async () => { await wipeCollections(); });

async function waitForAuditEntry(action, timeoutMs = 1000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const found = await AuditLog.findOne({ action });
    if (found) return found;
    await new Promise(r => setTimeout(r, 20));
  }
  return null;
}

test('service create → audit log entry recorded', async () => {
  const { user, agent, csrf } = await registerUser(app, { email: 'admin@t.local' });
  await makeAdmin(user.id);
  const res = await agent
    .post('/api/services')
    .set('X-CSRF-Token', csrf)
    .send({ name: 'Nail trim', description: 'quick', price: 15, duration: 20 });
  assert.equal(res.status, 201);
  const entry = await waitForAuditEntry('service.create');
  assert.ok(entry, 'expected an audit entry for service.create');
  assert.equal(entry.actorEmail, 'admin@t.local');
  assert.equal(entry.target.type, 'Service');
  assert.equal(entry.target.label, 'Nail trim');
});

test('non-admin cannot GET /api/audit → 403', async () => {
  const { agent } = await registerUser(app);
  const res = await agent.get('/api/audit');
  assert.equal(res.status, 403);
});

test('admin GET /api/audit returns paginated shape', async () => {
  const { user, agent } = await registerUser(app, { email: 'admin@t.local' });
  await makeAdmin(user.id);
  const res = await agent.get('/api/audit');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.items));
  assert.equal(typeof res.body.page, 'number');
});
