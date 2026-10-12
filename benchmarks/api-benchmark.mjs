import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const [key, ...value] = argument.replace(/^--/, '').split('=');
    return [key, value.join('=') || true];
  })
);

if (args.help) {
  console.log('Usage: node benchmarks/api-benchmark.mjs --path=/api/properties?page=1&limit=24 --duration=30 --concurrency=10 --warmup=5');
  process.exit(0);
}

const positiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const baseUrl = String(process.env.BENCH_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
const requestPath = String(args.path || '/api/properties?page=1&limit=24');
const durationSeconds = positiveNumber(args.duration, 30);
const warmupSeconds = positiveNumber(args.warmup, 5);
const concurrency = Math.floor(positiveNumber(args.concurrency, 10));
const timeoutMs = positiveNumber(args.timeout, 10000);
const method = String(args.method || 'GET').toUpperCase();
const url = new URL(requestPath, `${baseUrl}/`).toString();
const headers = process.env.BENCH_TOKEN
  ? { Authorization: `Bearer ${process.env.BENCH_TOKEN}` }
  : {};

const runWorkers = async (seconds, collect) => {
  const stopAt = performance.now() + seconds * 1000;
  const samples = [];
  const statuses = {};
  let transportErrors = 0;

  const worker = async () => {
    while (performance.now() < stopAt) {
      const startedAt = performance.now();
      try {
        const response = await fetch(url, {
          method,
          headers,
          signal: AbortSignal.timeout(timeoutMs),
        });
        await response.arrayBuffer();
        if (collect) {
          samples.push(performance.now() - startedAt);
          statuses[response.status] = (statuses[response.status] || 0) + 1;
        }
      } catch {
        if (collect) transportErrors += 1;
      }
    }
  };

  const startedAt = performance.now();
  await Promise.all(Array.from({ length: concurrency }, worker));
  return {
    elapsedSeconds: (performance.now() - startedAt) / 1000,
    samples,
    statuses,
    transportErrors,
  };
};

const percentile = (sorted, quantile) => {
  if (!sorted.length) return null;
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * quantile) - 1);
  return Number(sorted[index].toFixed(2));
};

console.log(`Warming up ${url} for ${warmupSeconds}s with ${concurrency} workers...`);
await runWorkers(warmupSeconds, false);
console.log(`Measuring for ${durationSeconds}s...`);
const result = await runWorkers(durationSeconds, true);

const sorted = result.samples.sort((a, b) => a - b);
const requests = sorted.length + result.transportErrors;
const non2xx = Object.entries(result.statuses)
  .filter(([status]) => Number(status) < 200 || Number(status) >= 300)
  .reduce((sum, [, count]) => sum + count, 0);
const failures = non2xx + result.transportErrors;
const generatedAt = new Date();
const cpu = os.cpus()[0];
const report = {
  schemaVersion: 1,
  generatedAt: generatedAt.toISOString(),
  gitCommit: process.env.BENCH_COMMIT || null,
  environment: {
    os: `${os.platform()} ${os.release()}`,
    architecture: os.arch(),
    cpu: cpu?.model || null,
    logicalCpuCount: os.cpus().length,
    totalMemoryBytes: os.totalmem(),
    nodeVersion: process.version,
    datasetSize: process.env.BENCH_DATASET_SIZE || null,
    deploymentTopology: process.env.BENCH_TOPOLOGY || 'local-unspecified',
  },
  scenario: {
    url,
    method,
    authenticated: Boolean(process.env.BENCH_TOKEN),
    warmupSeconds,
    requestedDurationSeconds: durationSeconds,
    measuredDurationSeconds: Number(result.elapsedSeconds.toFixed(3)),
    concurrency,
    timeoutMs,
    command: `node benchmarks/api-benchmark.mjs ${process.argv.slice(2).join(' ')}`,
  },
  result: {
    requests,
    successfulResponses: requests - failures,
    statusCounts: result.statuses,
    transportErrors: result.transportErrors,
    errorRate: requests ? Number((failures / requests).toFixed(6)) : null,
    requestsPerSecond: Number((requests / result.elapsedSeconds).toFixed(2)),
    latencyMs: {
      p50: percentile(sorted, 0.50),
      p95: percentile(sorted, 0.95),
      p99: percentile(sorted, 0.99),
      min: sorted.length ? Number(sorted[0].toFixed(2)) : null,
      max: sorted.length ? Number(sorted.at(-1).toFixed(2)) : null,
    },
  },
};

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const day = generatedAt.toISOString().slice(0, 10);
const resultDirectory = path.join(scriptDirectory, 'results', day);
await mkdir(resultDirectory, { recursive: true });
const safeScenario = requestPath.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'root';
const outputPath = path.join(resultDirectory, `${generatedAt.toISOString().replace(/[:.]/g, '-')}-${safeScenario}.json`);
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(JSON.stringify(report.result, null, 2));
console.log(`Saved reproducible result: ${outputPath}`);

