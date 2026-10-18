# Engineering Decisions

## Current Decisions

| Decision | Why | Trade-off |
|---|---|---|
| Modular monolith | Matches team/scale and keeps workflows in one deployable unit | Domains scale together |
| MongoDB source of truth | Existing Mongoose domain model and nested conversations/maintenance | Relational integrity is application-enforced |
| Partial Neon projection | Explores relational reporting/migration without blocking primary writes | Mixed sync strategies can diverge |
| REST API | Direct fit for resource CRUD and browser clients | Over/under-fetching and no formal schema yet |
| JWT + database user lookup | Keeps API calls token-based while enforcing current role/status | Database lookup on each request; refresh token remains client-held |
| bcrypt cost 10 | Established password hashing with acceptable development latency | Cost must be benchmarked for production hardware |
| Backend RBAC | Client routes are UX only; server owns authorization | Requires consistent middleware/ownership checks |
| Transactional leased contract outbox | Contract state and its projection event must either both commit or both roll back; atomic claims allow safe worker competition | Requires Atlas/replica-set transactions, and only contract projection uses the outbox |
| TanStack Query | Fits server-owned cacheable state | Some screens still use manual fetching/local state |
| Backend Gemini proxy | Keeps secret and rate control off the browser | Adds backend dependency and latency |
| Razorpay HMAC + idempotent transitions | Payment success cannot be trusted from client fields; order binding, unique gateway IDs, and a durable event ledger prevent replayed callbacks from repeating side effects | Live gateway/reconciliation tests are absent and landlord plan prices remain client-supplied |
| Forward-only Neon migrations | Ordered SQL, checksums, transactions, and an advisory lock make schema changes reproducible and prevent concurrent runners | Migrations are not automatically deployed and destructive down-migrations are intentionally absent |
| Separate liveness/readiness | A live process is not necessarily safe to receive traffic; Mongo is required while Neon degradation is reported without taking the authoritative Mongo API offline | Readiness semantics must be revisited if Neon becomes authoritative |
| JSON logs + request IDs | Machine-readable events and response correlation are useful before adopting a logging vendor | Existing controller logs are not fully migrated and logs are not centrally shipped |
| Bounded graceful shutdown | Stops new HTTP work and lets the current outbox batch finish before closing database pools | Shutdown behavior still needs an integration test under active traffic |
| Lazy admin sections + database aggregation | Avoids transferring seven full collections for every tab and removes repeated in-memory scans for overview metrics | Section lists remain unpaginated and the legacy all-data response remains for compatibility |
| Opt-in pagination | Enables bounded property reads without silently breaking frontend callers that currently expect raw arrays | Legacy calls remain unbounded until consumers migrate to the paginated envelope |
| Batched payment attribution | Preserves legacy payments without property IDs while replacing per-payment contract queries with set-based lookups | The fallback ownership rule is still more complex than storing an explicit landlord ID on every payment |
| Protected pull metrics | Prometheus-format text is vendor-neutral and easy to scrape while a bearer token avoids public process/backlog exposure | No scraper, dashboard, alert rules, or centralized retention are included |
| Separate API and worker entrypoints | Keeps the modular monolith while allowing HTTP and projection work to scale/restart independently | Adds another process to operate; inline mode remains the local default |
| Docker Compose baseline | Makes the three-process topology reproducible without claiming a cloud platform | Local env-file secrets and single-host Compose are not a production orchestrator |

## Alternatives Considered
- PostgreSQL-only: preferred if the team commits to relational ownership; rejected as an immediate rewrite.
- Microservices: rejected until independent scale/team boundaries exist.
- Firebase authentication: removed because no backend token exchange/account mapping existed.
- Cookie sessions: a strong future option for refresh tokens, requiring CSRF/session design.
- Redis/Kafka/Kubernetes: **Not currently implemented** and not justified without measured need.

## Decision Revisit Triggers
Revisit storage when dual-write incidents occur or Neon becomes authoritative; revisit deployment when one process cannot meet measured SLOs; revisit caching only after query/latency evidence; revisit service boundaries when teams or workloads require independent ownership/scaling.
