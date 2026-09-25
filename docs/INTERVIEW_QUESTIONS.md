# Repository-Specific Interview Questions

Each entry contains the expected answer (A), likely follow-up (F), strong follow-up answer (S), and weakness to acknowledge (W).

## Implementation (10)

1. **How does login work?** A: Mongo lookup, bcrypt check, JWT pair, stored session. F: Why reload the user per request? S: Immediate role/status enforcement. W: localStorage and no refresh rotation.
2. **How is admin access protected?** A: Admin is a Mongo role; signup cannot request it; script provisions it; backend RBAC guards routes. F: Is frontend protection enough? S: No, it is only UX. W: No MFA/audit log.
3. **Why a modular monolith?** A: Domain separation without distributed operations. F: When split? S: Independent scale/team/deployment evidence. W: Shared process/resources.
4. **How are contracts synced to Neon?** A: Mongo contract plus outbox job, polled and upserted. F: Why outbox? S: Preserve primary write during Neon failure. W: no lease/dead-letter UI.
5. **How are payments verified?** A: Razorpay HMAC callback/webhook before state update. F: Can client amount be trusted? S: No; derive price server-side. W: idempotency incomplete.
6. **Why embedded maintenance history?** A: Retrieved with request as one aggregate. F: Growth risk? S: cap/archive or separate events. W: document growth.
7. **How is frontend server state managed?** A: TanStack Query plus localized state. F: Why not Redux? S: most state is remote, not global client state. W: fetching patterns are inconsistent.
8. **How is Gemini secured?** A: backend proxy, fixed upstream, timeout, rate limit. F: Why not browser SDK? S: it exposes key/quota. W: process-local limiting.
9. **How are Atlas DNS failures handled?** A: HTTPS SRV/TXT discovery fallback builds a seed-list URI. F: Risk? S: fixed trusted DoH endpoint and TLS remains enabled. W: external DNS dependency.
10. **How are errors handled?** A: global middleware plus controller responses and JSON 404. F: Is the schema consistent? S: not yet; standardize error codes/envelopes. W: console-only diagnostics.

## System Design and Scaling (10)

11. **How would you support 10k users?** A: measure, paginate, aggregate, index, separate worker, replicas/load balancer/shared limiter. F: First change? S: query/payload fixes before infrastructure. W: no current benchmarks.
12. **How would you support 1M users?** A: durable queues, partitioned workloads/data, autoscaling, replicas, CDN, tested DR. F: Microservices now? S: only after bounded-context evidence. W: proposed only.
13. **How would you scale the outbox?** A: separate workers with atomic claims/leases and idempotent consumers. F: Why not current loop? S: replicas can double-process. W: five failures become stranded.
14. **Where would caching help?** A: public property search and dashboard summaries. F: What not to cache? S: mutable auth decisions/payment state without careful invalidation. W: Redis absent.
15. **Load-balancing strategy?** A: stateless API replicas behind managed L7 balancing after shared limiting and graceful shutdown. F: sticky sessions? S: unnecessary for Bearer JWT. W: not implemented.
16. **Database scaling strategy?** A: pagination/index/query fixes, managed pooling/backups, then read replicas/partitioning. F: Shard key? S: choose from measured tenant/property access patterns. W: no evidence yet.
17. **How handle external-service failures?** A: timeouts, idempotency, retries with jitter, circuit breaking, reconciliation. F: Retry payments? S: retry reads/order creation carefully; deduplicate state transitions. W: incomplete today.
18. **Observability design?** A: request IDs, structured logs, RED metrics, traces, outbox lag and payment alerts. F: Key SLO? S: availability plus p95 latency/error rate by critical flow. W: no tooling present.
19. **Would you keep two databases?** A: only for a time-bounded migration or distinct justified workloads. F: Current problem? S: mixed dual writes and no reconciliation. W: ambiguous ownership.
20. **How deploy without downtime?** A: backward-compatible migrations, readiness, rolling instances, graceful drain, rollback. F: Current support? S: none; production blocker. W: no CI/CD/deployment manifest.

## Database and Performance (5)

21. **Why MongoDB currently?** A: Mongoose implementation and document-shaped aggregates. F: Why not Postgres auth? S: either works; one authoritative store matters more. W: relationships are application-enforced.
22. **Which indexes matter?** A: geospatial property, maintenance owner/status, payment tenant/order, notification user, outbox polling. F: Add more? S: only from explain plans and query telemetry. W: some sort/filter composites missing.
23. **Where is an N+1 query?** A: landlord payment filtering looks up contracts per payment/tenant. F: Fix? S: batch IDs or aggregate/join in bounded queries. W: latency grows with result size.
24. **Why is admin dashboard expensive?** A: full collections plus in-memory analytics/population. F: Fix? S: aggregates, projections, pagination, cached summaries. W: currently unbounded.
25. **How benchmark it?** A: k6/autocannon percentiles/RPS/errors plus query timings, CPU/RSS and Lighthouse. F: Why no numbers? S: none were reproducibly measured. W: test fixtures absent.

## Security (5)

26. **Largest auth risk?** A: refresh/access tokens in localStorage. F: Improve? S: short access token plus rotated HttpOnly Secure SameSite refresh cookie and CSRF design. W: not implemented.
27. **How prevent broken access control?** A: verifyToken, database user reload, role middleware, ownership filters. F: Prove it? S: table-driven deny/allow integration tests. W: tests missing.
28. **Injection posture?** A: parameterized pg and Mongoose reduce risk; schemas must reject unexpected operators/fields. F: Is ODM enough? S: no. W: validation coverage incomplete.
29. **Payment attack to consider?** A: amount tampering, replayed callback/webhook, cross-user record update. F: Mitigation? S: server price catalog, idempotency/event ledger, scoped updates. W: price derivation incomplete.
30. **How protect secrets?** A: server-only env, ignored files, no `VITE_*` secrets. F: Production? S: managed secret store, least privilege, rotation and leak scanning. W: no secret manager/rotation evidence.
