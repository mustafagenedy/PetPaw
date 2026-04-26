// Sentry must be initialized BEFORE any other modules that should be
// auto-instrumented (express, mongoose, etc). server.js requires this file
// as its first line.
//
// Tests import app.js directly and bypass this file, so Sentry stays a no-op
// during local test runs even if a developer accidentally has SENTRY_DSN set.
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    // Don't ship PII to Sentry breadcrumbs.
    sendDefaultPii: false,
  });
}
