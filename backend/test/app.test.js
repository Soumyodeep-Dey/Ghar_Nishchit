import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import request from 'supertest';
import pool from '../src/db/neon.js';
import { app } from '../src/app.js';

after(async () => {
  await pool.end();
});

test('liveness endpoint responds without checking databases', async () => {
  const response = await request(app).get('/health/live');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('readiness fails closed when authoritative MongoDB is disconnected', async () => {
  const response = await request(app).get('/health/ready');
  assert.equal(response.status, 503);
  assert.equal(response.body.status, 'not_ready');
  assert.equal(response.body.checks.mongodb, 'unavailable');
});

test('responses include security headers and a request ID', async () => {
  const response = await request(app)
    .get('/health/live')
    .set('x-request-id', 'test-request-123');

  assert.equal(response.headers['x-request-id'], 'test-request-123');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['x-powered-by'], undefined);
});

test('invalid request IDs are replaced', async () => {
  const response = await request(app)
    .get('/health/live')
    .set('x-request-id', 'invalid request id');

  assert.match(response.headers['x-request-id'], /^[0-9a-f-]{36}$/);
});

test('unknown routes return a traceable JSON 404', async () => {
  const response = await request(app).get('/does-not-exist');

  assert.equal(response.status, 404);
  assert.equal(response.body.status, 'fail');
  assert.equal(response.body.message, 'Route not found');
  assert.equal(response.body.requestId, response.headers['x-request-id']);
});

test('metrics stay hidden unless explicitly enabled and authenticated', async () => {
  const previousEnabled = process.env.METRICS_ENABLED;
  const previousToken = process.env.METRICS_TOKEN;
  try {
    delete process.env.METRICS_ENABLED;
    let response = await request(app).get('/metrics');
    assert.equal(response.status, 404);

    process.env.METRICS_ENABLED = 'true';
    process.env.METRICS_TOKEN = 'test-metrics-token';
    response = await request(app).get('/metrics');
    assert.equal(response.status, 401);

    response = await request(app)
      .get('/metrics')
      .set('authorization', 'Bearer test-metrics-token');
    assert.equal(response.status, 200);
    assert.match(response.text, /ghar_nishchit_http_requests_total/);
    assert.match(response.text, /process_resident_memory_bytes/);
  } finally {
    if (previousEnabled === undefined) delete process.env.METRICS_ENABLED;
    else process.env.METRICS_ENABLED = previousEnabled;
    if (previousToken === undefined) delete process.env.METRICS_TOKEN;
    else process.env.METRICS_TOKEN = previousToken;
  }
});

