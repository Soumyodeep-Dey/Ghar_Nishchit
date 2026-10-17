const HTTP_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
const httpRequests = new Map();
const httpDurations = new Map();
const outboxCounts = new Map();
let oldestPendingSeconds = 0;
let outboxMetricsAvailable = 0;

const escapeLabel = (value) => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n')
  .replace(/"/g, '\\"');

const labels = (values) => `{${Object.entries(values)
  .map(([key, value]) => `${key}="${escapeLabel(value)}"`)
  .join(',')}}`;

const mapKey = (...parts) => JSON.stringify(parts);

export const normalizeMetricPath = (routeTemplate) => {
  if (!routeTemplate) return 'unmatched';
  const normalized = String(routeTemplate).replace(/\/{2,}/g, '/');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

export const recordHttpMetrics = ({ method, route, statusCode, durationSeconds }) => {
  const requestKey = mapKey(method, route, statusCode);
  httpRequests.set(requestKey, (httpRequests.get(requestKey) || 0) + 1);

  const durationKey = mapKey(method, route);
  const duration = httpDurations.get(durationKey) || {
    count: 0,
    sum: 0,
    buckets: HTTP_BUCKETS.map(() => 0),
  };
  duration.count += 1;
  duration.sum += durationSeconds;
  HTTP_BUCKETS.forEach((bucket, index) => {
    if (durationSeconds <= bucket) duration.buckets[index] += 1;
  });
  httpDurations.set(durationKey, duration);
};

export const setOutboxMetrics = ({ counts = {}, oldestPendingAgeSeconds = 0, available = true } = {}) => {
  outboxCounts.clear();
  for (const [status, count] of Object.entries(counts)) outboxCounts.set(status, count);
  oldestPendingSeconds = Math.max(0, Number(oldestPendingAgeSeconds) || 0);
  outboxMetricsAvailable = available ? 1 : 0;
};

export const renderMetrics = () => {
  const cpuUsage = process.cpuUsage();
  const lines = [
    '# HELP ghar_nishchit_http_requests_total Completed HTTP requests.',
    '# TYPE ghar_nishchit_http_requests_total counter',
  ];

  for (const [key, count] of httpRequests) {
    const [method, route, statusCode] = JSON.parse(key);
    lines.push(`ghar_nishchit_http_requests_total${labels({ method, route, status_code: statusCode })} ${count}`);
  }

  lines.push(
    '# HELP ghar_nishchit_http_request_duration_seconds HTTP request duration.',
    '# TYPE ghar_nishchit_http_request_duration_seconds histogram'
  );
  for (const [key, duration] of httpDurations) {
    const [method, route] = JSON.parse(key);
    HTTP_BUCKETS.forEach((bucket, index) => {
      lines.push(`ghar_nishchit_http_request_duration_seconds_bucket${labels({ method, route, le: bucket })} ${duration.buckets[index]}`);
    });
    lines.push(`ghar_nishchit_http_request_duration_seconds_bucket${labels({ method, route, le: '+Inf' })} ${duration.count}`);
    lines.push(`ghar_nishchit_http_request_duration_seconds_sum${labels({ method, route })} ${duration.sum}`);
    lines.push(`ghar_nishchit_http_request_duration_seconds_count${labels({ method, route })} ${duration.count}`);
  }

  lines.push(
    '# HELP ghar_nishchit_outbox_jobs Current outbox jobs by status.',
    '# TYPE ghar_nishchit_outbox_jobs gauge'
  );
  for (const [status, count] of outboxCounts) {
    lines.push(`ghar_nishchit_outbox_jobs${labels({ status })} ${count}`);
  }
  lines.push(
    '# HELP ghar_nishchit_outbox_oldest_pending_age_seconds Age of the oldest pending outbox job.',
    '# TYPE ghar_nishchit_outbox_oldest_pending_age_seconds gauge',
    `ghar_nishchit_outbox_oldest_pending_age_seconds ${oldestPendingSeconds}`,
    '# HELP ghar_nishchit_outbox_metrics_available Whether outbox metrics were collected successfully.',
    '# TYPE ghar_nishchit_outbox_metrics_available gauge',
    `ghar_nishchit_outbox_metrics_available ${outboxMetricsAvailable}`,
    '# HELP process_resident_memory_bytes Resident memory used by the Node.js process.',
    '# TYPE process_resident_memory_bytes gauge',
    `process_resident_memory_bytes ${process.memoryUsage().rss}`,
    '# HELP process_heap_used_bytes V8 heap currently used by the Node.js process.',
    '# TYPE process_heap_used_bytes gauge',
    `process_heap_used_bytes ${process.memoryUsage().heapUsed}`,
    '# HELP process_uptime_seconds Node.js process uptime.',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds ${process.uptime()}`,
    '# HELP process_cpu_user_seconds_total Total user CPU time used by the Node.js process.',
    '# TYPE process_cpu_user_seconds_total counter',
    `process_cpu_user_seconds_total ${cpuUsage.user / 1_000_000}`,
    '# HELP process_cpu_system_seconds_total Total system CPU time used by the Node.js process.',
    '# TYPE process_cpu_system_seconds_total counter',
    `process_cpu_system_seconds_total ${cpuUsage.system / 1_000_000}`
  );

  return `${lines.join('\n')}\n`;
};

