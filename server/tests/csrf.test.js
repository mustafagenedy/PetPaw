const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { startTestEnv, stopTestEnv, wipeCollections, registerUser } = require('./helpers');
const Service = require('../models/Service');

let app;

before(async () => { app = await startTestEnv(); });
after(async () => { await stopTestEnv(); });
beforeEach(async () => { await wipeCollections(); });

test('POST /bookings without X-CSRF-Token → 403', async () => {
  const { agent } = await registerUser(app);
  const svc = await Service.create({ name: 'Bath', price: 25, duration: 30 });
  const res = await agent.post('/api/bookings').send({
    serviceId: svc._id.toString(),
    date: new Date().toISOString(),
  });
  assert.equal(res.status, 403);
  assert.match(res.body.message, /CSRF/);
});

test('POST /bookings with matching X-CSRF-Token → 201', async () => {
  const { agent, csrf } = await registerUser(app);
  const svc = await Service.create({ name: 'Bath', price: 25, duration: 30 });
  const res = await agent
    .post('/api/bookings')
    .set('X-CSRF-Token', csrf)
    .send({ serviceId: svc._id.toString(), date: new Date().toISOString() });
  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'pending');
});

test('POST /bookings with mismatched X-CSRF-Token → 403', async () => {
  const { agent } = await registerUser(app);
  const svc = await Service.create({ name: 'Bath', price: 25, duration: 30 });
  const res = await agent
    .post('/api/bookings')
    .set('X-CSRF-Token', 'totally-wrong-token-value-that-will-never-match-aaaa')
    .send({ serviceId: svc._id.toString(), date: new Date().toISOString() });
  assert.equal(res.status, 403);
});
