# Production Readiness

Status definitions: **PASS** has repository/reproducible evidence; **PARTIAL** exists but is incomplete; **FAIL** is missing or unsuitable; **NOT TESTED** lacks executed evidence.

| Area | Status | Evidence / gap |
|---|---|---|
| Security | PARTIAL | bcrypt, RBAC, validation, rate limits, HMAC; see `SECURITY.md` gaps |
| Performance | NOT TESTED | Reproducible API runner and query improvements exist; no controlled load/Lighthouse results recorded |
| Scalability | PARTIAL | API/worker can run separately and workers use atomic leases; limiter remains process-local and no load balancer exists |
| Reliability | PARTIAL | Global errors, health probes, bounded shutdown, leased retries, dead-letter state, and admin retry; mixed direct dual writes remain |
| Observability | PARTIAL | JSON logs, request IDs, protected RED/process/outbox metrics; no centralized logs, database timings, traces, dashboards, or alerts |
| Testing | PARTIAL | Six backend HTTP tests, eight unit tests, and limited Playwright smoke coverage; business authorization and live lease integration remain weak |
| Deployment | PARTIAL | API/worker and SPA Dockerfiles plus validated Compose configuration; image build/live deployment not tested |
| Backups | NOT TESTED | No repository backup/restore evidence |
| Database migrations | PARTIAL | Manual Neon initializer/migration; no version/rollback system |
| Secrets management | PARTIAL | Ignored env files and example; no managed store/rotation |
| CI/CD | PARTIAL | GitHub Actions installs, tests/builds, and audits production dependencies; no deployment stage or observed run yet |
| Monitoring | PARTIAL | Authenticated Prometheus-format endpoint exists; scraper, dashboards, alert rules, and notification routing are not implemented |
| Logging | PARTIAL | Structured request/lifecycle logs with request IDs and sensitive-key redaction; legacy logs and shipping remain |
| Health checks | PARTIAL | `/health/live` is tested; `/health/ready` checks Mongo and reports optional Neon degradation but lacks deployed probe evidence |
| Graceful shutdown | PARTIAL | SIGINT/SIGTERM drain HTTP/outbox work and close Mongo/Neon with a timeout; active-traffic behavior is not integration-tested |
| Rate limiting | PARTIAL | In-memory limiter; not shared or durable |
| Disaster recovery | NOT TESTED | No RPO/RTO, runbook, or restore drill |

## Release Blockers
Add authorization/integration, lease-concurrency, and shutdown tests; versioned migrations; a deployed metrics/logging stack with alerts; managed secrets; payment idempotency; backup/restore evidence; and measured performance baselines. Clean the existing frontend lint debt before making lint a required CI gate.

## Reproducible Current Checks
```powershell
cd frontend/UI
npm audit
npm run build
npm run lint # known failure: 29 errors and 3 warnings as of 2026-10-09

cd ../../backend
Get-ChildItem src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
npm test
npm audit --omit=dev --audit-level=high
```

Last reliability-phase verification on 2026-10-17: backend tests passed (14/14), frontend production build passed, and `docker compose config --quiet` passed. Container image build was **NOT TESTED** because the Docker Desktop Linux engine was unavailable. No live deployment, metrics scrape, load test, or Lighthouse result is claimed.

No item should be promoted to PASS without a linked file, command output, or stored test result.
