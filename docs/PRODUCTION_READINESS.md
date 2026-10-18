# Production Readiness

Status definitions: **PASS** has repository/reproducible evidence; **PARTIAL** exists but is incomplete; **FAIL** is missing or unsuitable; **NOT TESTED** lacks executed evidence.

| Area | Status | Evidence / gap |
|---|---|---|
| Security | PARTIAL | bcrypt, RBAC, validation, rate limits, HMAC; see `SECURITY.md` gaps |
| Performance | NOT TESTED | Reproducible API runner and query improvements exist; no controlled load/Lighthouse results recorded |
| Scalability | PARTIAL | API/worker can run separately and workers use atomic leases; limiter remains process-local and no load balancer exists |
| Reliability | PARTIAL | Global errors, health probes, bounded shutdown, transactional contract outbox, leased retries, dead-letter state, and idempotent payment callbacks; non-contract Neon writes remain best effort |
| Observability | PARTIAL | JSON logs, request IDs, protected RED/process/outbox metrics; no centralized logs, database timings, traces, dashboards, or alerts |
| Testing | PARTIAL | Six backend HTTP tests, fourteen unit tests, and limited Playwright smoke coverage; live database/gateway, business authorization, and lease-concurrency integration remain weak |
| Deployment | PARTIAL | API/worker and SPA Dockerfiles plus validated Compose configuration; image build/live deployment not tested |
| Backups | NOT TESTED | No repository backup/restore evidence |
| Database migrations | PARTIAL | Ordered transactional Neon SQL migrations have checksums and an advisory lock; apply and idempotent re-run succeeded against the configured Neon database on 2026-10-18, but automatic deployment and down migrations are absent |
| Secrets management | PARTIAL | Ignored env files and example; no managed store/rotation |
| CI/CD | PARTIAL | GitHub Actions installs, tests/builds, and audits production dependencies; no deployment stage or observed run yet |
| Monitoring | PARTIAL | Authenticated Prometheus-format endpoint exists; scraper, dashboards, alert rules, and notification routing are not implemented |
| Logging | PARTIAL | Structured request/lifecycle logs with request IDs and sensitive-key redaction; legacy logs and shipping remain |
| Health checks | PARTIAL | `/health/live` is tested; `/health/ready` checks Mongo and reports optional Neon degradation but lacks deployed probe evidence |
| Graceful shutdown | PARTIAL | SIGINT/SIGTERM drain HTTP/outbox work and close Mongo/Neon with a timeout; active-traffic behavior is not integration-tested |
| Rate limiting | PARTIAL | In-memory limiter; not shared or durable |
| Disaster recovery | NOT TESTED | No RPO/RTO, runbook, or restore drill |

## Release Blockers
Add authorization/integration, transaction/lease-concurrency, webhook, and shutdown tests; automate migration execution; add a server-owned landlord plan catalogue; deploy metrics/logging with alerts; adopt managed secrets; collect backup/restore evidence and measured performance baselines. Clean the existing frontend lint debt before making lint a required CI gate.

## Reproducible Current Checks
```powershell
cd frontend/UI
npm audit
npm run build
npm run lint # known failure: 29 errors and 3 warnings as of 2026-10-09

cd ../../backend
Get-ChildItem src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
npm test
npm run migrate:neon # requires a configured non-production Neon database
npm audit --omit=dev --audit-level=high
```

Last data-integrity-phase verification: backend tests passed (20/20), backend syntax checks passed, and the frontend production build passed on 2026-10-17. On 2026-10-18, both Neon migrations applied successfully and a second run skipped both versions, demonstrating idempotency against the configured database. Contract transactions, webhook-ledger persistence, and MongoDB unique-index creation remain **NOT TESTED against a live database**. No live deployment, payment-gateway test, metrics scrape, load test, or Lighthouse result is claimed.

No item should be promoted to PASS without a linked file, command output, or stored test result.
