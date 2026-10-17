import assert from 'node:assert/strict';
import test from 'node:test';
import { failureState, retryDelayMs } from '../src/utils/outboxWorker.js';

test('outbox retry delay grows exponentially', () => {
  assert.equal(retryDelayMs(1, 1000), 1000);
  assert.equal(retryDelayMs(2, 1000), 2000);
  assert.equal(retryDelayMs(4, 1000), 8000);
});

test('outbox failures become terminal after five attempts', () => {
  const now = Date.parse('2026-10-17T00:00:00.000Z');
  const retryable = failureState(4, now);
  assert.equal(retryable.status, 'failed');
  assert.ok(retryable.nextAttemptAt > new Date(now));

  assert.deepEqual(failureState(5, now), {
    status: 'dead_letter',
    nextAttemptAt: null,
  });
});

