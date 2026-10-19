# Learning Path: Vibe Coder to Production-Safe

A prioritized, 30-concept curriculum designed for developers who build with AI or rapid prototyping tools and want their applications to survive real traffic without 3 AM outages.

## Overview
When moving from a local demo to production, you face unpredictable networks, concurrent users, payment gateways, and malicious actors. This path gives you the 30 highest-impact patterns to protect your system.

## The 30 Core Concepts

### Part 1: Network & API Resilience
1. **Idempotency keys** (`docs/02-api-reliability`): Prevent double-charging and duplicate actions on network retries.
2. **Rate limiting** (`docs/02-api-reliability`): Prevent DDoS, scrapers, and noisy neighbor overload.
3. **Timeouts** (`docs/02-api-reliability`): Never let a stuck external service tie up your server workers indefinitely.
4. **Retries** (`docs/02-api-reliability`): Safely recover from transient network drops.
5. **Exponential backoff** (`docs/02-api-reliability`): Add jitter and delay to avoid the thundering herd problem.
6. **Circuit breakers** (`docs/02-api-reliability`): Fast-fail downstream dependencies before they consume all system resources.

### Part 2: Database & Data Integrity
7. **N+1 queries** (`docs/03-performance-and-caching`): Eliminate hidden multi-query loops killing database throughput.
8. **Connection pooling** (`docs/03-performance-and-caching`): Reuse persistent database connections rather than crashing on connection limits.
9. **Caching strategies** (`docs/03-performance-and-caching`): Choose the right caching pattern (Cache-Aside, Write-Through) for your workload.
10. **Cache invalidation** (`docs/03-performance-and-caching`): Avoid serving stale or corrupted data to users.
11. **Database indexing** (`docs/04-databases`): Speed up queries from full table scans to sub-millisecond B-tree lookups.
12. **ACID and isolation levels** (`docs/04-databases`): Understand dirty reads, phantom reads, and transaction guarantees.

### Part 3: Concurrency & State
13. **Race conditions** (`docs/05-concurrency`): Prevent overlapping requests from corrupting shared state.
14. **Optimistic locking** (`docs/05-concurrency`): Use version numbers to prevent overwriting updates without heavy database locks.
15. **Pagination (offset vs cursor)** (`docs/01-foundations`): Prevent severe query degradation and skipped items on dynamic feeds.
16. **Money handling** (`docs/01-foundations`): Never use floating-point numbers for financial calculations.

### Part 4: Security Essentials
17. **Authentication vs authorization** (`docs/01-foundations`): Know the difference between identity and permissions.
18. **Password hashing** (`docs/08-security`): Protect credentials with slow, salted hashing algorithms (Argon2, bcrypt).
19. **SQL injection** (`docs/08-security`): Use parameterized queries to defeat database attacks.
20. **XSS** (`docs/08-security`): Prevent malicious script injection into client browsers.
21. **CSRF** (`docs/08-security`): Protect state-changing HTTP requests from cross-origin forged submissions.
22. **JWT and token rotation** (`docs/08-security`): Balance stateless authorization with immediate revocation capabilities.
23. **Secrets management** (`docs/08-security`): Stop baking API keys and credentials into source code.
24. **CORS** (`docs/02-api-reliability`): Configure cross-origin browser security headers without opening wildcards (`*`).

### Part 5: Scale, Async & Operations
25. **Webhooks** (`docs/02-api-reliability`): Receive third-party event notifications reliably with signature verification.
26. **Message queues** (`docs/07-messaging-and-events`): Offload heavy background work from user-facing request loops.
27. **Docker** (`docs/10-devops-and-deployment`): Package software into consistent, reproducible execution environments.
28. **CI/CD** (`docs/10-devops-and-deployment`): Automate testing and deployment pipelines to catch bugs before production.
29. **Structured logging & correlation IDs** (`docs/12-observability-and-operations`): Trace a single request across multiple services in JSON logs.
30. **P99 and tail latency** (`docs/03-performance-and-caching`): Optimize for the worst-case user experiences rather than misleading averages.
