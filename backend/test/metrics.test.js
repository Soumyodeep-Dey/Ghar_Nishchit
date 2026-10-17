import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeMetricPath,
  recordHttpMetrics,
  renderMetrics,
  setOutboxMetrics,
} from '../src/utils/metrics.js';

test('metric paths replace identifiers and suppress unmatched cardinality', () => {
  assert.equal(normalizeMetricPath('/api/users/:id'), '/api/users/:id');
  assert.equal(normalizeMetricPath(null), 'unmatched');
});

test('metrics render RED, process, and outbox series', () => {
  recordHttpMetrics({ method: 'GET', route: '/health/live', statusCode: 200, durationSeconds: 0.01 });
  setOutboxMetrics({ counts: { pending: 2, dead_letter: 1 }, oldestPendingAgeSeconds: 42 });
  const output = renderMetrics();
  assert.match(output, /ghar_nishchit_http_request_duration_seconds_bucket/);
  assert.match(output, /ghar_nishchit_outbox_jobs\{status="dead_letter"\} 1/);
  assert.match(output, /ghar_nishchit_outbox_oldest_pending_age_seconds 42/);
  assert.match(output, /process_uptime_seconds/);
});

