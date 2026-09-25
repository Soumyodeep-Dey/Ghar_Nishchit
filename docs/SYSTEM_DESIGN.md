# System Design

## CURRENT IMPLEMENTATION

### Components
- React/Vite SPA: routing, role dashboards, server-state cache, checkout UI, chatbot UI.
- Express modular monolith: REST API, authentication/RBAC, business workflows, integrations.
- MongoDB: authoritative application and authentication store.
- Neon/PostgreSQL: partial projection of users, payments, contracts, visits, favourites.
- In-process outbox worker: polls MongoDB every 10 seconds and syncs contracts to Neon, 10 jobs per batch, maximum five attempts.
- Razorpay: order creation, callback signature verification, signed webhooks.
- Gemini: backend proxy with timeout and process-local limiting.

### Database Architecture
MongoDB uses references for users/properties/contracts/payments and embedded arrays for inquiry replies and maintenance comments/history. Existing indexes include property geospatial, maintenance access paths, user uniqueness, payment/order identifiers, notification user, and outbox polling. Neon foreign keys exist only between its own projections; Mongo property IDs cannot have PostgreSQL FKs.

### Important Flows
1. Login: credentials → Mongo user/password → JWT pair → localStorage → Bearer token → user/status/role recheck.
2. Contract: landlord writes Mongo contract and outbox job → worker upserts Neon later.
3. Payment: authenticated order request → Razorpay → client callback/webhook HMAC → Mongo status → Neon best-effort sync.
4. Maintenance: tenant creates request tied to property/landlord → participants access it → landlord controls status/assignment.

### Failure Scenarios
- Mongo unavailable: API does not start.
- Neon unavailable: direct sync logs warnings; contract jobs retry. Mongo remains authoritative.
- Razorpay unavailable: order creation fails; pending records/webhooks need reconciliation.
- Gemini unavailable: chatbot returns 502/504 without affecting rental workflows.
- Worker process stops: contract projections lag until restart.
- Multiple API replicas: every replica would poll the same outbox without leases; unsafe today.

### Bottlenecks
Unpaginated collections, full admin reads, application-memory analytics, N+1 landlord payment filtering, growing embedded arrays, and HTTP/worker co-location.

## PROPOSED FUTURE ARCHITECTURE

### Caching Opportunities
Cache public property searches and stable dashboard summaries only after measuring hit rate. Never cache authorization decisions longer than account-status expectations. Redis is **Not currently implemented**.

### Horizontal Scaling and Load Balancing
Make shutdown/health checks production-safe, separate the worker, externalize rate-limit state, then place stateless API replicas behind a managed load balancer. Sticky sessions are unnecessary with Bearer JWTs. A load balancer is **Not currently implemented**.

### Database Scaling
First paginate and fix queries/indexes. Next use managed Mongo connection pooling, backups, point-in-time recovery, and read replicas for suitable read traffic. Decide whether to retire Neon projections or complete a PostgreSQL migration; do not maintain two indefinite sources of truth.

### Observability
Add request IDs, structured redacted logs, RED metrics (rate/errors/duration), process/database metrics, traces for Mongo/Neon/Razorpay, dashboards, alerts, and outbox-lag/dead-letter monitoring. These are **Not currently implemented**.

### Architecture for 100 Users
Current single API and managed Mongo are sufficient after correctness fixes, backups, tests, health checks, and basic monitoring. Avoid new infrastructure.

### Architecture for 10,000 Users
Paginated APIs, database aggregations/index tuning, separate worker, object storage for uploads, static hosting/CDN, two or more stateless API instances, shared rate limiting, monitoring, and automated deployment.

### Architecture for 1,000,000 Users
Partition high-volume workloads by bounded context only when profiling supports it; introduce durable queues for payments/notifications/outbox, multi-region static delivery, database partitioning/read replicas, strict idempotency, autoscaling, and tested disaster recovery. Kafka, Kubernetes, replicas, CDN, and microservices are **proposals, not current implementation**.
