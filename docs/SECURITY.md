# Security Review

This document records controls and gaps; it does not claim the application is secure.

| Area | Current implementation | Risk / next action |
|---|---|---|
| Authentication | Mongo users, bcrypt, one-hour access and 72-hour refresh JWTs | Refresh tokens in localStorage; add HttpOnly rotation/revocation |
| Authorization | Database-backed role/status verification and ownership checks | Add automated deny-path tests and audit every controller |
| Validation | Zod auth/contract validation plus controller checks | Schemas are incomplete; validate params/query/body everywhere |
| Injection | Mongoose filters and parameterized `pg` queries | Restrict operator-shaped input and never concatenate SQL |
| XSS | React escaping, Helmet defaults including CSP; no deliberate raw HTML sink found | localStorage raises impact; tune CSP for deployment and add URL/upload sanitization |
| CSRF | Bearer header reduces cookie-CSRF exposure | Required if refresh/auth moves to cookies |
| CORS | Environment allowlist plus localhost | Validate production origin; do not use wildcard credentials |
| Secrets | Ignored `.env`; Gemini is server-side; startup requires distinct access/refresh JWT secrets | Use a secret manager/rotation; frontend `VITE_*` is public |
| Rate limiting | Process-local auth/write/AI buckets | Not distributed or durable; bound memory and use shared storage at scale |
| Dependencies | CI audits production dependencies; backend production audit reports zero known vulnerabilities on 2026-10-09 | Tailwind 3 build-time dependencies still have advisories; migrate deliberately rather than forcing Tailwind 4 |
| API exposure | Admin/user APIs require admin RBAC | Public property endpoints intentionally expose listings; document fields |
| Logging | Structured request/lifecycle logs redact sensitive key names and carry request IDs | Many legacy controller logs remain; centralized retention and field-level review are missing |
| Payments | Razorpay HMAC callback/webhook verification | Add idempotency/event ledger and server-derived prices |

## OWASP-Oriented Concerns
- Broken access control: materially improved with RBAC, but requires regression tests.
- Cryptographic failures: bcrypt/JWT secrets exist; managed rotation and secure token storage are missing.
- Injection: low for parameterized SQL, but broad request objects need schemas.
- Insecure design: dual writes and payment state reconciliation need explicit invariants.
- Misconfiguration: Helmet/CSP and critical JWT/database startup validation exist, but deployment configuration and integration-secret validation are incomplete.
- Vulnerable components: CI checks production dependencies; build-tool advisories and automated update policy remain open.
- Identification failures: no MFA, lockout, refresh rotation, or revocation list.
- Integrity failures: no signed build/deployment pipeline.
- Logging/monitoring failures: no centralized alerts/audit trail.
- SSRF: Gemini target is fixed; future user-provided URLs/uploads must be constrained.
