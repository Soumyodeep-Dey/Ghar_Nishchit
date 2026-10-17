# Performance and Benchmarking

No benchmark numbers are currently claimed.

Every HTTP completion is currently logged with route, status, request ID, and duration. This is diagnostic timing, not a benchmark or percentile measurement.

When explicitly enabled, `/metrics` exposes bounded-cardinality HTTP counters/duration histograms plus API-process memory/uptime and authoritative Mongo-backed outbox gauges. It does not provide database query timing or frontend metrics.

## Metrics
- API latency: p50, p95, p99 by route.
- Throughput: successful requests/second.
- Error rate: non-2xx and transport failures.
- Concurrent-user capacity: maximum load meeting an agreed latency/error SLO.
- Database: query duration, calls/request, slow queries, connection-pool wait.
- Runtime: CPU, RSS/heap, event-loop delay, startup/readiness time.
- Frontend: Lighthouse LCP, INP, CLS, TBT, performance/accessibility scores and bundle sizes.

## Tools and Plan
Use k6 or autocannon for HTTP, MongoDB profiler/Atlas Performance Advisor for queries, `EXPLAIN (ANALYZE, BUFFERS)` for Neon, `node --cpu-prof`/heap snapshots for Node, and Lighthouse CLI for the built frontend. Use dedicated test accounts and a non-production dataset.

Suggested scenarios: public property browse/search; authenticated tenant dashboard; landlord tenants/payments; admin dashboard; mixed 70/20/10 read/write/admin load. Warm up for 1 minute, measure for at least 5 minutes, test 1/10/50/100 concurrent users, repeat three times, and preserve raw output.

## Reproducible Commands
```powershell
# Dependency-free repository runner. Writes JSON under benchmarks/results/YYYY-MM-DD/.
$env:BENCH_BASE_URL = 'http://localhost:5000'
$env:BENCH_DATASET_SIZE = 'properties=1000;users=500'
$env:BENCH_TOPOLOGY = 'local API; local MongoDB'
$env:BENCH_COMMIT = (git rev-parse HEAD)
node benchmarks/api-benchmark.mjs --path=/api/properties?page=1`&limit=24 --warmup=60 --duration=300 --concurrency=10

# Authenticated scenario; the token is not persisted in the result.
$env:BENCH_TOKEN = '<test-account-access-token>'
node benchmarks/api-benchmark.mjs --path=/api/admin/dashboard?section=overview --warmup=60 --duration=300 --concurrency=10

# Quick endpoint smoke load
npx autocannon -c 10 -d 30 'http://localhost:5000/api/properties?page=1&limit=24'

# Built frontend
npx lighthouse http://localhost:4173 --output=json --output-path=benchmarks/results/lighthouse.json
```

The repository runner records p50/p95/p99, throughput, status counts, transport failures, error rate, concurrency, duration, command, declared dataset/topology, and load-generator environment. Controlled benchmark results, server CPU/memory capture, automated test-data fixtures, Mongo slow-query exports, and Lighthouse results are **Not currently available**.

## Implemented Query Improvements

- Property browse and location search accept opt-in `page`/`limit` pagination with a maximum page size of 100; requests without pagination preserve the legacy array response.
- Admin overview metrics are computed with MongoDB aggregation/count queries rather than loading every document into Node.js.
- The frontend requests only the active admin section; the no-`section` compatibility API still returns the legacy full payload.
- Landlord payment attribution batches contract lookups into at most two queries per filtering pass rather than querying inside the payment loop.
- Tenant and landlord payment summaries use database aggregation instead of loading complete histories.
- Compound indexes were added for property ownership/status, contract landlord/tenant access, and payment owner/status/time access paths. Index effectiveness must still be verified with production-like `explain` output.

## Result Record Template
Store each run separately under `benchmarks/results/YYYY-MM-DD/` and record: commit SHA, date/timezone, OS/CPU/RAM, Node/tool versions, deployment topology, database tier/region, dataset counts, duration, warm-up, concurrency/arrival rate, exact command, p50/p95/p99, RPS, errors, CPU/memory, database timings, and raw result filename. Never invent missing values.

## Optimization Order
Run a controlled baseline → migrate remaining consumers to pagination → profile other query fan-out → validate indexes with explain plans → reduce payloads → tune pools → consider caching/replicas only when evidence remains.
