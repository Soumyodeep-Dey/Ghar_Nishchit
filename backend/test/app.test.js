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

