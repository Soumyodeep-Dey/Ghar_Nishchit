# Database Integration Testing

## Purpose

The integration suite exercises behavior that mocks cannot prove: MongoDB persistence and indexes, MongoDB transactions, PostgreSQL migrations and projections, authentication lifecycle behavior, authorization against stored account state, and atomic outbox leasing.

This is a separate gate from the fast unit/HTTP suite. It requires disposable databases and performs destructive cleanup.

## Safety Boundary

The runner requires both `TEST_MONGODB_URI` and `TEST_NEONDB_URL`. Before importing the application, it parses each URL and refuses to continue unless the database name ends in `_test`.

The suite drops the configured MongoDB database and deletes rows from the configured PostgreSQL test database. Never set either variable to a development, staging, or production database.

## CI Topology

The `integration` GitHub Actions job creates:

- a PostgreSQL 17 service database named `ghar_nishchit_test`;
- a single-node MongoDB 8 replica set named `rs0`, required for transaction behavior;
- the backend process under Node.js 22 with test-only JWT secrets.

The job applies the real ordered PostgreSQL migrations before running the integration suite. The container-build job waits for this gate in addition to the unit and frontend gates.

## Covered Scenarios

1. Both versioned PostgreSQL migrations are present and core tables exist.
2. Registration persists a bcrypt hash in MongoDB and a projection in PostgreSQL.
3. Duplicate email registration is rejected.
4. Invalid and valid login behavior is checked against stored credentials.
5. Protected profile access and refresh-token exchange are exercised.
6. A suspended account is rejected at login and on a request using an existing access token.
7. A tenant cannot invoke the landlord contract endpoint.
8. Contract creation and its outbox event commit together inside a MongoDB transaction.
9. The assigned tenant can accept the contract, creating another outbox event.
10. Two concurrent leasing attempts cannot claim the same outbox job, and an expired worker lease can be recovered.
11. Two concurrent deliveries of one webhook event admit only one processor, and a completed event cannot be replayed.

This does not test Razorpay's sandbox, Gemini, a deployed reverse proxy, browser-to-real-API behavior, high load, backups, or disaster recovery.

## Run Locally

Start disposable MongoDB and PostgreSQL instances first. MongoDB must run as a replica set, not as a standalone server.

```powershell
cd backend
$env:TEST_MONGODB_URI='mongodb://127.0.0.1:27017/ghar_nishchit_test?replicaSet=rs0&directConnection=true'
$env:TEST_NEONDB_URL='postgresql://test:test@127.0.0.1:5432/ghar_nishchit_test?sslmode=disable'
$env:NEONDB_URL=$env:TEST_NEONDB_URL
$env:JWT_SECRET='local-integration-access-secret'
$env:JWT_REFRESH_SECRET='local-integration-refresh-secret'
npm run migrate:neon
npm run test:integration
```

The exact CI provisioning commands are maintained in `.github/workflows/ci.yml`. Prefer that workflow when local Docker is unavailable.

## Evidence Status

Implementation and syntax validation were completed on 2026-10-23. A local database-backed execution is **NOT TESTED** because the Docker Desktop Linux engine was unavailable. Do not mark the integration gate PASS until a GitHub Actions run completes successfully; record that run URL and commit in `TESTING_REPORT.md` when it does.
