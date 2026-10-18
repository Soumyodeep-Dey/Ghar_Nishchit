# System Design

## CURRENT IMPLEMENTATION

### Components
- React/Vite SPA: routing, role dashboards, server-state cache, checkout UI, chatbot UI.
- Express modular monolith: REST API, authentication/RBAC, business workflows, integrations.
- MongoDB: authoritative application and authentication store.
- Neon/PostgreSQL: partial projection of users, payments, contracts, visits, favourites.
- Transactional leased outbox: Mongo commits contract state and the outbox event together; a worker atomically claims jobs, syncs contracts to Neon, applies exponential backoff, and dead-letters after five attempts. It can run inline or through `npm run worker`.
- Razorpay: order creation, callback signature verification, signed webhooks.
- Gemini: backend proxy with timeout and process-local limiting.
- Operations baseline: Helmet headers, request IDs, structured request logs, liveness/readiness probes, protected Prometheus-format RED/process/outbox metrics, and bounded graceful shutdown.

### Database Architecture
MongoDB uses references for users/properties/contracts/payments and embedded arrays for inquiry replies and maintenance comments/history. Existing indexes include property geospatial, maintenance access paths, user uniqueness, payment/order identifiers, notification user, and outbox polling. Neon foreign keys exist only between its own projections; Mongo property IDs cannot have PostgreSQL FKs.

### Important Flows
1. Login: credentials → Mongo user/password → JWT pair → localStorage → Bearer token → user/status/role recheck.
2. Contract: landlord changes contract + creates outbox job in one Mongo transaction → worker upserts Neon later.
3. Tenant payment: authenticated request → active lease determines amount → Razorpay → order-bound callback or durable idempotent webhook → Mongo status transition → Neon best-effort sync.
4. Maintenance: tenant creates request tied to property/landlord → participants access it → landlord controls status/assignment.

### Failure Scenarios
- Mongo unavailable: API does not start.
- Neon unavailable: direct sync logs warnings; contract jobs retry. Mongo remains authoritative.
- Razorpay unavailable: order creation fails; pending records/webhooks need reconciliation.
- Gemini unavailable: chatbot returns 502/504 without affecting rental workflows.
- Worker process stops: contract projections lag until restart; expired leases are recoverable when a worker returns.
- Multiple workers: atomic leases prevent simultaneous claims; lease behavior still lacks a live multi-process integration test.
- Mongo standalone deployment: contract writes fail because transactional outbox correctness requires replica-set/Atlas transactions.
- Duplicate Razorpay webhook: the event ledger returns success for completed events, rejects concurrently processing duplicates, and permits failed/expired events to retry.
- Neon unavailable: readiness reports `degraded` rather than removing the API from service because MongoDB is authoritative; affected projection/reporting paths can still fail.

### Bottlenecks
Admin sections now load independently and overview analytics run in MongoDB; landlord payment attribution now batches contract lookups. Remaining bottlenecks include unpaginated admin/legacy lists, several other unpaginated collections, growing embedded arrays, compatibility access to the full dashboard payload, and HTTP/worker co-location.

## PROPOSED FUTURE ARCHITECTURE

### Caching Opportunities
Cache public property searches and stable dashboard summaries only after measuring hit rate. Never cache authorization decisions longer than account-status expectations. Redis is **Not currently implemented**.

### Horizontal Scaling and Load Balancing
Health checks, bounded shutdown, a standalone worker entrypoint, and job leases now provide a replication baseline. Before horizontal scaling, deploy the worker separately, externalize rate-limit state, and place stateless API replicas behind a managed load balancer. Sticky sessions are unnecessary with Bearer JWTs. A load balancer and shared limiter are **Not currently implemented**.

### Database Scaling
First paginate and fix queries/indexes. Next use managed Mongo connection pooling, backups, point-in-time recovery, and read replicas for suitable read traffic. Decide whether to retire Neon projections or complete a PostgreSQL migration; do not maintain two indefinite sources of truth.

### Observability
Request IDs, structured redacted logs, and protected Prometheus-format HTTP duration/count, process memory/uptime, and outbox backlog/dead-letter metrics are implemented. Database timings, distributed traces, centralized log shipping, a deployed scraper, dashboards, and alerts are **Not currently implemented**.

### Architecture for 100 Users
Current single API and managed Mongo are sufficient after correctness fixes, backups, tests, health checks, and basic monitoring. Avoid new infrastructure.

### Architecture for 10,000 Users
Paginated APIs, database aggregations/index tuning, separate worker, object storage for uploads, static hosting/CDN, two or more stateless API instances, shared rate limiting, monitoring, and automated deployment.

### Architecture for 1,000,000 Users
Partition high-volume workloads by bounded context only when profiling supports it; introduce durable queues for payments/notifications/outbox, multi-region static delivery, database partitioning/read replicas, strict idempotency, autoscaling, and tested disaster recovery. Kafka, Kubernetes, replicas, CDN, and microservices are **proposals, not current implementation**.
