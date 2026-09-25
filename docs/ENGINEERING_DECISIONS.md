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
| Contract outbox | Neon failure must not roll back authoritative Mongo contract | In-process polling and no leasing/dead-letter UI |
| TanStack Query | Fits server-owned cacheable state | Some screens still use manual fetching/local state |
| Backend Gemini proxy | Keeps secret and rate control off the browser | Adds backend dependency and latency |
| Razorpay HMAC | Payment success cannot be trusted from client fields alone | Idempotency/reconciliation still incomplete |

## Alternatives Considered
- PostgreSQL-only: preferred if the team commits to relational ownership; rejected as an immediate rewrite.
- Microservices: rejected until independent scale/team boundaries exist.
- Firebase authentication: removed because no backend token exchange/account mapping existed.
- Cookie sessions: a strong future option for refresh tokens, requiring CSRF/session design.
- Redis/Kafka/Kubernetes: **Not currently implemented** and not justified without measured need.

## Decision Revisit Triggers
Revisit storage when dual-write incidents occur or Neon becomes authoritative; revisit deployment when one process cannot meet measured SLOs; revisit caching only after query/latency evidence; revisit service boundaries when teams or workloads require independent ownership/scaling.
