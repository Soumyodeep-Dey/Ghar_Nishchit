# Production Readiness

Status definitions: **PASS** has repository/reproducible evidence; **PARTIAL** exists but is incomplete; **FAIL** is missing or unsuitable; **NOT TESTED** lacks executed evidence.

| Area | Status | Evidence / gap |
|---|---|---|
| Security | PARTIAL | bcrypt, RBAC, validation, rate limits, HMAC; see `SECURITY.md` gaps |
| Performance | NOT TESTED | Reproducible API runner and query improvements exist; no controlled load/Lighthouse results recorded |
| Scalability | PARTIAL | API/worker can run separately and workers use atomic leases; limiter remains process-local and no load balancer exists |
| Reliability | PARTIAL | Global errors, health probes, bounded shutdown, transactional contract outbox, leased retries, dead-letter state, and idempotent payment callbacks; non-contract Neon writes remain best effort |
| Observability | PARTIAL | JSON logs, request IDs, protected RED/process/outbox metrics; no centralized logs, database timings, traces, dashboards, or alerts |
| Testing | PARTIAL | 23 backend tests and 7 deterministic Chrome flows pass; a guarded database integration suite now covers auth persistence, contract/outbox transactions, migrations, and lease concurrency, but its first hosted run is not yet observed. Provider and real-stack browser integration remain untested; see `TESTING_REPORT.md` |
| Deployment | PARTIAL | API/worker and SPA Dockerfiles plus validated Compose configuration; image build/live deployment not tested |
| Backups | NOT TESTED | No repository backup/restore evidence |
| Database migrations | PARTIAL | Ordered transactional Neon SQL migrations have checksums and an advisory lock; apply and idempotent re-run succeeded against the configured Neon database on 2026-10-18, but automatic deployment and down migrations are absent |
| Secrets management | PARTIAL | Ignored env files and example; no managed store/rotation |
| CI/CD | PARTIAL | GitHub Actions installs, unit-tests, lint/builds, runs mocked browser tests, provisions disposable integration databases, audits production dependencies, and builds images; no deployment stage or observed fully green run yet |
| Monitoring | PARTIAL | Authenticated Prometheus-format endpoint exists; scraper, dashboards, alert rules, and notification routing are not implemented |
| Logging | PARTIAL | Structured request/lifecycle logs with request IDs and sensitive-key redaction; legacy logs and shipping remain |
| Health checks | PARTIAL | `/health/live` is tested; `/health/ready` checks Mongo and reports optional Neon degradation but lacks deployed probe evidence |
| Graceful shutdown | PARTIAL | SIGINT/SIGTERM drain HTTP/outbox work and close Mongo/Neon with a timeout; active-traffic behavior is not integration-tested |
| Rate limiting | PARTIAL | In-memory limiter; not shared or durable |
| Disaster recovery | NOT TESTED | No RPO/RTO, runbook, or restore drill |

## Release Blockers
Add live authorization/integration, transaction/lease-concurrency, webhook, and shutdown tests; automate migration execution; add a server-owned landlord plan catalogue; deploy metrics/logging with alerts; adopt managed secrets; collect backup/restore evidence and measured performance baselines. Resolve the remaining development-tool audit findings without forced breaking upgrades.

## Reproducible Current Checks
```powershell
cd frontend/UI
npm audit
npm run build
npm run lint
npm run test:e2e

cd ../../backend
Get-ChildItem src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
npm test
npm run migrate:neon # requires a configured non-production Neon database
npm audit --omit=dev --audit-level=high
```

Verification on 2026-10-18: backend tests passed (23/23), all 72 backend source files passed syntax checks, frontend lint passed, the production build passed, and mocked browser flows passed (7/7). Production-only npm audits reported zero vulnerabilities; full audits still report development/build-tool findings. Both Neon migrations applied successfully and a second run skipped both versions, demonstrating idempotency against the configured database. Contract transactions, webhook-ledger persistence, and MongoDB unique-index creation remain **NOT TESTED against a live database**. No live deployment, payment-gateway test, metrics scrape, load test, or Lighthouse result is claimed. Full commands and limitations are recorded in `TESTING_REPORT.md`.

No item should be promoted to PASS without a linked file, command output, or stored test result.
