# Testing and Product Assessment

This document records what was executed, how it was executed, and what the evidence does and does not prove. A passing mocked or unit test is not presented as proof that a live provider or database integration works.

## Status Definitions

- **PASS**: the command completed successfully and its evidence is described below.
- **FAIL**: the command ran and found a defect or unresolved vulnerability.
- **NOT TESTED**: the check could not be run safely or reproducibly in the available environment.

## Test Environment

| Item | Value |
|---|---|
| Date | 2026-10-18 |
| Baseline commit | `b5b8b99` plus the test/report changes in this working tree |
| Operating system | 64-bit Windows (`Microsoft Windows NT 10.0.26220.0`) |
| Processor | Intel64 Family 6 Model 154, 20 logical processors |
| Node.js | `v22.23.2` |
| npm | `11.10.0` |
| Browser | Google Chrome `151.0.7922.76` |
| Databases used by automated suite | None; unit/HTTP tests isolate database-dependent behavior |
| Browser test data | Deterministic mocked API responses; no user or production data is changed |

The earlier migration verification used the configured Neon instance. A guarded database integration suite and disposable GitHub Actions topology were added on 2026-10-23. Local execution remains **NOT TESTED** because Docker Desktop's Linux engine was unavailable; a successful hosted integration run has not yet been observed.

## How We Test

### Backend

`npm run check` performs syntax checks for the API entry point, worker, and migration runner, then runs Node's built-in test runner. A separate recursive syntax command checks all 72 JavaScript files under `backend/src`.

The 23 automated backend tests cover:

- liveness, fail-closed readiness, security headers, request IDs, JSON 404s, and metrics access;
- role-gate allow/deny behavior for authenticated, unauthorized, and unauthenticated requests;
- metric path normalization and metric rendering;
- outbox retry backoff and dead-letter transition rules;
- opt-in pagination parsing and metadata;
- payment signature validation, webhook signature validation, event ID generation, replay idempotency, and payment-ID rebinding protection;
- batched landlord payment attribution.

Most of these are unit or in-process HTTP tests. They do not connect to a live MongoDB, Neon, Razorpay, or Gemini service.

### Frontend

The frontend is checked in three layers:

1. ESLint statically checks React source and hook usage.
2. Vite creates an optimized production build.
3. Playwright starts Vite automatically and runs seven Chrome scenarios against deterministic API mocks.

The browser scenarios cover the landing page, tenant/landlord/admin login redirects, invalid login feedback, unauthenticated admin-route protection, and prevention of tenant access to the admin route. Mocking makes the suite repeatable and prevents writes to real accounts, but does not prove that the live API and database authenticate correctly together.

### Configuration, Migrations, and Dependencies

- Docker Compose is parsed and validated without starting containers.
- Neon migrations were previously applied to the configured database and rerun to verify idempotent skipping.
- npm audits are run separately for production dependencies and the complete dependency tree. This distinction matters because build/development packages are not deployed with the runtime image but still affect developer and CI environments.

## Results

| Area | Command | Result | Evidence / interpretation |
|---|---|---:|---|
| Backend syntax + automated tests | `cd backend; npm run check` | **PASS** | 23/23 tests passed; 0 failed; completed in about 1.3 seconds. |
| All backend source syntax | `cd backend; Get-ChildItem src -Recurse -Filter *.js \| ForEach-Object { node --check $_.FullName }` | **PASS** | 72/72 source files parsed successfully. |
| Frontend lint | `cd frontend/UI; npm run lint` | **PASS** | 0 errors and 0 warnings. |
| Frontend production build | `cd frontend/UI; npm run build` | **PASS** | 3,365 modules transformed; build completed in 1.80 seconds. This is build time, not application startup or page-load latency. |
| Browser flows | `cd frontend/UI; npm run test:e2e` | **PASS** | 7/7 Chrome tests passed in 12.1 seconds using mocked API responses. |
| Compose validation | `docker compose config --quiet` | **PASS** | Compose file resolved without a configuration error. |
| Container image build | `docker info` followed by the documented builds | **NOT TESTED** | Docker Desktop's Linux engine was unavailable, so images were not built or started locally. Compose parsing alone does not prove runnable images. |
| Backend production dependency audit | `cd backend; npm audit --omit=dev --audit-level=high` | **PASS** | npm reported 0 known vulnerabilities. |
| Frontend production dependency audit | `cd frontend/UI; npm audit --omit=dev --audit-level=high` | **PASS** | npm reported 0 known vulnerabilities. |
| Backend full dependency audit | `cd backend; npm audit --audit-level=high` | **FAIL** | 3 high-severity development-tool findings through `nodemon`/`chokidar`/`braces`. npm's proposed forced fix is a breaking downgrade and was not applied automatically. |
| Frontend full dependency audit | `cd frontend/UI; npm audit --audit-level=high` | **FAIL** | 8 development/build-tool findings: 2 moderate and 6 high, through Tailwind's dependency chain and `source-map-js`. Forced Tailwind 4 migration was not applied automatically. |
| Neon migration application | `cd backend; npm run migrate:neon` | **PASS** | On 2026-10-18 migrations `001` and `002` applied successfully; an immediate second run skipped both, proving version/checksum-based idempotency for that database. |
| Live MongoDB/PostgreSQL integration | `cd backend; npm run test:integration` | **NOT TESTED** | A guarded suite and disposable CI databases are configured, but no database-backed run has yet been observed. The runner rejects database names without the `_test` suffix. See `INTEGRATION_TESTING.md`. |
| Code coverage | Coverage-instrumented test run | **NOT TESTED** | No coverage provider or enforceable line/branch threshold is configured. Passing test counts must not be interpreted as percentage coverage. |
| Razorpay checkout/webhook integration | Provider sandbox suite | **NOT TESTED** | Signature logic is tested, but no provider sandbox credentials/test workflow were executed. |
| Gemini integration | Provider integration suite | **NOT TESTED** | No deterministic provider test was run; availability, quota, timeout, and response quality remain unverified. |
| API load/capacity | `npm run benchmark:api` with an isolated dataset | **NOT TESTED** | A repeatable runner exists, but no isolated running stack, representative dataset, or test credentials were available. No p50/p95/p99 latency, RPS, error-rate, or concurrent-user claim is made. |
| Database performance | Query timing/slow-query capture on a seeded test database | **NOT TESTED** | No disposable representative dataset or database telemetry was available. |
| Runtime resources/startup | CPU, memory, and timed application startup under controlled load | **NOT TESTED** | No production-like container or repeatable monitoring setup was available. |
| Lighthouse | Lighthouse against a production-like deployment | **NOT TESTED** | No stable production-like deployment was available. Build success is not a substitute for Core Web Vitals. |
| Backup/restore | Restore drill | **NOT TESTED** | No backup artifact, recovery environment, RPO/RTO, or restore drill exists in the repository. |
| CI workflow execution | GitHub Actions run | **NOT TESTED** | CI now declares lint, build, browser, backend, audit, and image-build gates, but a hosted run has not been observed from this environment. |

## Defects and Risks Found

1. The original Playwright test attempted a real signup and depended on a manually started application. It was replaced with seven deterministic, non-destructive browser tests and an automatically managed Vite server.
2. Frontend lint initially reported 29 errors and 2 warnings. Stale imports, unused state/listeners, and lint configuration for intentional JSX/provider patterns were corrected; lint now passes.
3. Full npm audits still report vulnerabilities in development/build dependencies. Production-only audits are clean, but developer/CI exposure is not zero. Breaking forced upgrades require a separate compatibility change and regression pass.
4. The admin production chunk is approximately 433 kB uncompressed (about 120 kB gzip). This is not proof of poor user experience, but it is the largest route chunk and a candidate for further lazy splitting before scale.
5. Integration coverage remains the largest evidence gap: database transactions, concurrent outbox leasing, real login persistence, payment-provider callbacks, and AI-provider behavior are not exercised end to end.

## What We Can Say About the Product

The repository has a credible engineering baseline for continued development and an interview case study:

- the backend's tested HTTP safety behavior, payment-verification rules, pagination helpers, outbox retry rules, and role gate behave as expected in isolation;
- the React application lint-checks, creates a production bundle, and performs the principal role-routing flows in a real browser under controlled API responses;
- production runtime dependencies have no currently reported npm advisories at high severity or above;
- the SQL migration mechanism has been exercised against Neon and shown to be idempotent;
- CI and container definitions exist, and Compose configuration is syntactically valid.

The evidence does **not** justify calling the product production-ready, secure, scalable, or fast. Those claims require live end-to-end tests, isolated database transaction/concurrency tests, provider sandbox tests, container execution, load and Lighthouse measurements, monitoring evidence, and a backup/restore drill. At present, the strongest accurate description is: **a buildable, testable pre-production application with useful reliability controls and clearly identified integration and operations gaps**.

## Recommended Next Test Gates

1. Run the new disposable MongoDB/PostgreSQL CI gate and retain its successful run as evidence; then extend it with transaction rollback fault injection.
2. Add Razorpay sandbox tests for successful, failed, duplicate, reordered, and forged callback scenarios.
3. Start the complete stack from built Docker images and run the browser suite against the real API rather than mocks.
4. Seed a documented dataset, then run the existing API benchmark at fixed concurrency and record p50/p95/p99, throughput, error rate, CPU, memory, and database latency in a dated results file.
5. Run Lighthouse against the same production-like deployment and record mobile and desktop results.
6. Upgrade or replace the vulnerable development dependency chains without `--force`, then rerun lint, build, browser tests, and both audits.
7. Execute CI on GitHub and link the successful run before treating it as release evidence.
8. Define RPO/RTO and complete a timed backup/restore drill.

## Reproducing the Current Checks

```powershell
cd backend
npm ci
npm run check
Get-ChildItem src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high

cd ../frontend/UI
npm ci
npm run lint
npm run build
npm run test:e2e
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high

cd ../..
docker compose config --quiet
docker build --tag ghar-nishchit-api:test ./backend
docker build --tag ghar-nishchit-web:test --file frontend/UI/Dockerfile .
```

The final two image-build commands require a running Docker engine. Database/provider/load tests must use disposable test credentials and data, never the normal development or production environment.
