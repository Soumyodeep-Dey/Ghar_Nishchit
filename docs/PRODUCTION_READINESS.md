# Production Readiness

Status definitions: **PASS** has repository/reproducible evidence; **PARTIAL** exists but is incomplete; **FAIL** is missing or unsuitable; **NOT TESTED** lacks executed evidence.

| Area | Status | Evidence / gap |
|---|---|---|
| Security | PARTIAL | bcrypt, RBAC, validation, rate limits, HMAC; see `SECURITY.md` gaps |
| Performance | NOT TESTED | Build passes; no load/Lighthouse results recorded |
| Scalability | FAIL | Single API/worker and process-local limiter; no load balancer |
| Reliability | PARTIAL | Global errors, contract retries, health probes, and bounded shutdown; mixed dual writes remain |
| Observability | PARTIAL | JSON request/lifecycle logs and request IDs; no centralized logs, metrics, traces, or alerts |
| Testing | PARTIAL | Five backend HTTP tests plus limited Playwright smoke coverage; business authorization/integration coverage remains weak |
| Deployment | FAIL | No production manifest or infrastructure code |
| Backups | NOT TESTED | No repository backup/restore evidence |
| Database migrations | PARTIAL | Manual Neon initializer/migration; no version/rollback system |
| Secrets management | PARTIAL | Ignored env files and example; no managed store/rotation |
| CI/CD | PARTIAL | GitHub Actions installs, tests/builds, and audits production dependencies; no deployment stage or observed run yet |
| Monitoring | FAIL | Not currently implemented |
| Logging | PARTIAL | Structured request/lifecycle logs with request IDs and sensitive-key redaction; legacy logs and shipping remain |
| Health checks | PARTIAL | `/health/live` is tested; `/health/ready` checks Mongo and reports optional Neon degradation but lacks deployed probe evidence |
| Graceful shutdown | PARTIAL | SIGINT/SIGTERM drain HTTP/outbox work and close Mongo/Neon with a timeout; active-traffic behavior is not integration-tested |
| Rate limiting | PARTIAL | In-memory limiter; not shared or durable |
| Disaster recovery | NOT TESTED | No RPO/RTO, runbook, or restore drill |

## Release Blockers
Add authorization/integration and shutdown tests, versioned migrations, metrics/alerts, deployment configuration, managed secrets, payment idempotency, backup/restore evidence, and measured performance baselines. Clean the existing frontend lint debt before making lint a required CI gate.

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

Last locally reproduced on 2026-10-09: backend tests passed (5/5), backend production dependency audit reported zero known vulnerabilities, and the frontend production build completed. Frontend lint still reports 29 errors and three warnings; it is not represented as passing.

No item should be promoted to PASS without a linked file, command output, or stored test result.
