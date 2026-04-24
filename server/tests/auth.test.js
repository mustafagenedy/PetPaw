const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { startTestEnv, stopTestEnv, wipeCollections, registerUser, readCookie } = require('./helpers');

let app;

before(async () => { app = await startTestEnv(); });
after(async () => { await stopTestEnv(); });
beforeEach(async () => { await wipeCollections(); });

test('register → sets token (HttpOnly) + csrf cookies and returns user (no token in body)', async () => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'A', email: 'a@t.local', password: 'longenoughpass1',
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.user.email, 'a@t.local');
  assert.equal(res.body.token, undefined, 'token must not be in the body');
  const setCookie = res.headers['set-cookie'].join(';');
  assert.match(setCookie, /token=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /csrf=/);
});

test('register with bad email → 400 with field errors', async () => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'A', email: 'not-email', password: 'longenoughpass1',
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.message, 'Validation failed');
  assert.ok(res.body.errors.some(e => e.field === 'email'));
});

test('/me without cookie → 401', async () => {
  const res = await request(app).get('/api/auth/me');
  assert.equal(res.status, 401);
});

test('/me with cookies → 200 returns current user', async () => {
  const { agent, user } = await registerUser(app);
  const res = await agent.get('/api/auth/me');
  assert.equal(res.status, 200);
  assert.equal(res.body.user.id, user.id);
});

test('login with bad credentials → 400', async () => {
  await registerUser(app, { email: 'bob@t.local', password: 'longenoughpass1' });
  const res = await request(app).post('/api/auth/login').send({ email: 'bob@t.local', password: 'wrongpassword' });
  assert.equal(res.status, 400);
});

test('logout clears cookies AND bumps tokenVersion → replayed cookie is dead', async () => {
  // 1. register and grab cookies from the response
  const registerRes = await request(app).post('/api/auth/register').send({
    name: 'Replay', email: 'replay@t.local', password: 'longenoughpass1',
  });
  const tokenCookie = readCookie(registerRes.headers['set-cookie'], 'token');
  const csrfCookie = readCookie(registerRes.headers['set-cookie'], 'csrf');
  assert.ok(tokenCookie);

  // 2. logout using those cookies
  const logoutRes = await request(app)
    .post('/api/auth/logout')
    .set('Cookie', [`token=${tokenCookie}`, `csrf=${csrfCookie}`]);
  assert.equal(logoutRes.status, 200);

  // 3. replay the *original* token cookie — tokenVersion bumped, so /me must 401
  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Cookie', [`token=${tokenCookie}`]);
  assert.equal(meRes.status, 401, 'replayed token after logout must be rejected');
});
