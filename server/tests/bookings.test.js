const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { startTestEnv, stopTestEnv, wipeCollections, registerUser, makeAdmin } = require('./helpers');
const Service = require('../models/Service');

let app;

before(async () => { app = await startTestEnv(); });
after(async () => { await stopTestEnv(); });
beforeEach(async () => { await wipeCollections(); });

test('user cannot cancel another user\'s booking', async () => {
  const alice = await registerUser(app, { email: 'alice@t.local' });
  const bob = await registerUser(app, { email: 'bob@t.local' });
  const svc = await Service.create({ name: 'Bath', price: 25, duration: 30 });
  const create = await alice.agent
    .post('/api/bookings')
    .set('X-CSRF-Token', alice.csrf)
    .send({ serviceId: svc._id.toString(), date: new Date().toISOString() });
  assert.equal(create.status, 201);
  const bookingId = create.body._id;

  // Bob tries to delete Alice's booking → the query filter scopes by user, so 404
  const del = await bob.agent
    .delete(`/api/bookings/${bookingId}`)
    .set('X-CSRF-Token', bob.csrf);
  assert.equal(del.status, 404);
});

test('user cannot change status via PUT /:id (whitelist only allows date)', async () => {
  const { agent, csrf } = await registerUser(app);
  const svc = await Service.create({ name: 'Bath', price: 25, duration: 30 });
  const create = await agent
    .post('/api/bookings')
    .set('X-CSRF-Token', csrf)
    .send({ serviceId: svc._id.toString(), date: new Date().toISOString() });
  const id = create.body._id;

  const put = await agent
    .put(`/api/bookings/${id}`)
    .set('X-CSRF-Token', csrf)
    .send({ status: 'confirmed', user: 'attacker' });
  assert.equal(put.status, 200);
  assert.equal(put.body.status, 'pending', 'status must not be mutable via user PUT');
});

test('admin PUT /admin/:id rejects invalid status', async () => {
  const { user, agent, csrf } = await registerUser(app, { email: 'admin@t.local' });
  await makeAdmin(user.id);
  const svc = await Service.create({ name: 'Bath', price: 25, duration: 30 });

  const target = await registerUser(app, { email: 'target@t.local' });
  const create = await target.agent
    .post('/api/bookings')
    .set('X-CSRF-Token', target.csrf)
    .send({ serviceId: svc._id.toString(), date: new Date().toISOString() });
  const id = create.body._id;

  // admin cookie/csrf may be stale after role change — re-login
  // (role read from DB on every auth() call so existing agent still works)
  const bad = await agent
    .put(`/api/bookings/admin/${id}`)
    .set('X-CSRF-Token', csrf)
    .send({ status: 'pwned' });
  assert.equal(bad.status, 400);

  const good = await agent
    .put(`/api/bookings/admin/${id}`)
    .set('X-CSRF-Token', csrf)
    .send({ status: 'completed' });
  assert.equal(good.status, 200);
  assert.equal(good.body.status, 'completed');
});

test('admin list returns paginated shape { items, total, page, pages }', async () => {
  const { user, agent } = await registerUser(app, { email: 'admin@t.local' });
  await makeAdmin(user.id);
  const res = await agent.get('/api/bookings');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.items));
  assert.equal(typeof res.body.total, 'number');
  assert.equal(typeof res.body.page, 'number');
  assert.equal(typeof res.body.pages, 'number');
});
