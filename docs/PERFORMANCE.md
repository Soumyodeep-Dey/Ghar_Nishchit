# Performance and Benchmarking

No benchmark numbers are currently claimed.

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
# Example only; install k6 separately and provide a script before running.
k6 run -e BASE_URL=http://localhost:5000 -e ACCESS_TOKEN=... benchmarks/api.js

# Quick endpoint smoke load
npx autocannon -c 10 -d 30 http://localhost:5000/api/properties

# Built frontend
npx lighthouse http://localhost:4173 --output=json --output-path=benchmarks/results/lighthouse.json
```

Benchmark automation scripts are **Not currently implemented** because authenticated fixtures and isolated test data are not yet available.

## Result Record Template
Store each run separately under `benchmarks/results/YYYY-MM-DD/` and record: commit SHA, date/timezone, OS/CPU/RAM, Node/tool versions, deployment topology, database tier/region, dataset counts, duration, warm-up, concurrency/arrival rate, exact command, p50/p95/p99, RPS, errors, CPU/memory, database timings, and raw result filename. Never invent missing values.

## Optimization Order
Measure → paginate → remove N+1 queries → move analytics into database aggregation → validate indexes with explain plans → reduce payloads → tune pools → consider caching/replicas only when evidence remains.
