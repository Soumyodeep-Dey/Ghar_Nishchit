# Benchmarks

Benchmark output is evidence, not a product claim. Run against an isolated environment with representative, non-sensitive test data. Do not load-test production without explicit authorization.

## API runner

From the repository root:

```powershell
$env:BENCH_BASE_URL = 'http://localhost:5000'
$env:BENCH_DATASET_SIZE = 'properties=1000;users=500'
$env:BENCH_TOPOLOGY = 'local API; local MongoDB'
$env:BENCH_COMMIT = (git rev-parse HEAD)
node benchmarks/api-benchmark.mjs --path=/api/properties?page=1`&limit=24 --warmup=60 --duration=300 --concurrency=10
```

For an authenticated route, set `BENCH_TOKEN` in the shell. The token is used in the Authorization header and is never written into the report.

The runner records the date, commit supplied by the caller, machine environment, declared dataset/topology, duration, concurrency, command, response counts, error rate, requests/second, and p50/p95/p99 latency. It does not measure server CPU, server memory, or database query latency; collect those from the API host and database dashboards for the same time window.

Run each scenario at least three times. Keep result JSON under `results/YYYY-MM-DD/` only when it is safe and useful to commit. No baseline results are included because no controlled benchmark environment has been run yet.

## Frontend

Build and serve the production bundle, then run Lighthouse separately:

```powershell
cd frontend/UI
npm run build
npm run preview
npx lighthouse http://localhost:4173 --output=json --output-path=../../benchmarks/results/lighthouse.json
```

Record browser/Lighthouse versions and run mobile and desktop profiles independently.

