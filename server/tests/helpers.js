// Shared setup/teardown for tests:
//   - spin up an in-memory MongoDB
//   - set required env vars BEFORE requiring app
//   - wipe collections between tests
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

let memServer;

async function startTestEnv() {
  process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long-aaaaaa';
  process.env.CORS_ORIGIN = 'http://localhost:5173';
  process.env.NODE_ENV = 'test';

  memServer = await MongoMemoryServer.create();
  await mongoose.connect(memServer.getUri());

  // `app` depends on env + models, so require AFTER env is set.
  const { createApp } = require('../app');
  return createApp();
}

async function stopTestEnv() {
  await mongoose.disconnect();
  if (memServer) await memServer.stop();
}

async function wipeCollections() {
  const { collections } = mongoose.connection;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
}

// Register a fresh user and return the agent (keeps cookies), user body,
// and the csrf value from the cookie (so callers can send X-CSRF-Token).
async function registerUser(app, overrides = {}) {
  const agent = request.agent(app);
  const email = overrides.email || `u${Date.now()}${Math.random().toString(36).slice(2, 7)}@t.local`;
  const body = {
    name: overrides.name || 'Test User',
    email,
    password: overrides.password || 'longenoughpass1',
    ...overrides,
  };
  const res = await agent.post('/api/auth/register').send(body);
  if (res.status !== 201) {
    throw new Error(`register failed ${res.status}: ${JSON.stringify(res.body)}`);
  }
  const csrf = readCookie(res.headers['set-cookie'], 'csrf');
  return { agent, user: res.body.user, csrf, email, password: body.password };
}

// Promote the given user to admin (direct DB write — no endpoint exposes this)
async function makeAdmin(userId) {
  const User = require('../models/User');
  await User.findByIdAndUpdate(userId, { role: 'admin' });
}

function readCookie(setCookieHeader, name) {
  if (!setCookieHeader) return null;
  const arr = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  for (const c of arr) {
    const m = c.match(new RegExp(`${name}=([^;]+)`));
    if (m) return m[1];
  }
  return null;
}

module.exports = { startTestEnv, stopTestEnv, wipeCollections, registerUser, makeAdmin, readCookie };
