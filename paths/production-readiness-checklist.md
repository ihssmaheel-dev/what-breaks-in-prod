# Production Readiness Checklist

Before shipping your backend to production, run through this checklist. If the answer to any item is **NO**, read the linked concept page to understand the failure risk and implement the fix.

## 1. Reliability & Resilience
- [ ] **Are state-changing API endpoints protected against duplicate retries?**
  - If **NO**, implement [Idempotency Keys](../docs/02-api-reliability/README.md).
- [ ] **Are all external HTTP requests and database queries bound by explicit timeouts?**
  - If **NO**, implement [Timeouts](../docs/02-api-reliability/README.md).
- [ ] **Do client retries employ exponential backoff with randomized jitter?**
  - If **NO**, implement [Exponential Backoff](../docs/02-api-reliability/README.md).
- [ ] **Are public endpoints protected against malicious scrapers or unbounded bursts?**
  - If **NO**, implement [Rate Limiting](../docs/02-api-reliability/README.md).
- [ ] **Can your service survive downstream service outages without hanging indefinitely?**
  - If **NO**, implement [Circuit Breakers](../docs/02-api-reliability/README.md).

## 2. Databases & Performance
- [ ] **Have you audited your ORM queries to ensure you are not running N+1 loops?**
  - If **NO**, resolve [N+1 Queries](../docs/03-performance-and-caching/README.md).
- [ ] **Is your application reusing database connections through a connection pool?**
  - If **NO**, configure [Connection Pooling](../docs/03-performance-and-caching/README.md).
- [ ] **Are all query filters (`WHERE`, `JOIN`, `ORDER BY`) backed by appropriate indexes?**
  - If **NO**, configure [Database Indexing](../docs/04-databases/README.md).
- [ ] **Can database schema updates deploy without taking the application offline?**
  - If **NO**, implement [Zero-Downtime Migrations](../docs/04-databases/README.md).
- [ ] **Are cached keys protected against simultaneous stampedes on TTL expiration?**
  - If **NO**, prevent [Cache Stampede](../docs/03-performance-and-caching/README.md).

## 3. Concurrency & Data Integrity
- [ ] **Are financial operations stored in exact integer cents instead of floating-point numbers?**
  - If **NO**, adopt [Money Handling](../docs/01-foundations/README.md).
- [ ] **Are concurrent balance updates or inventory deductions protected against race conditions?**
  - If **NO**, implement [Optimistic Locking](../docs/05-concurrency/README.md) or [Pessimistic Locking](../docs/05-concurrency/README.md).
- [ ] **Are long-running jobs (emails, report generation, webhooks) handled outside the web server request lifecycle?**
  - If **NO**, offload work to [Job Queues & Background Workers](../docs/05-concurrency/README.md).

## 4. Security
- [ ] **Are all database interactions using parameterized queries or safe ORMs?**
  - If **NO**, defend against [SQL Injection](../docs/08-security/README.md).
- [ ] **Are all passwords hashed with slow, salted modern algorithms (Argon2 / bcrypt)?**
  - If **NO**, implement proper [Password Hashing](../docs/08-security/README.md).
- [ ] **Are API keys, database credentials, and secrets kept completely out of source code?**
  - If **NO**, set up [Secrets Management](../docs/08-security/README.md).
- [ ] **Are incoming webhook payloads verified with cryptographic signatures before processing?**
  - If **NO**, implement signature verification in [Webhooks](../docs/02-api-reliability/README.md).

## 5. Operations & Observability
- [ ] **Do all incoming HTTP requests attach or generate a correlation ID that propagates across logs?**
  - If **NO**, configure [Structured Logging & Correlation IDs](../docs/12-observability-and-operations/README.md).
- [ ] **Does the service handle `SIGTERM` signals and drain active requests before exiting?**
  - If **NO**, implement [Graceful Shutdown](../docs/10-devops-and-deployment/README.md).
- [ ] **Do container orchestrators have accurate liveness and readiness health checks configured?**
  - If **NO**, configure [Liveness and Readiness Probes](../docs/10-devops-and-deployment/README.md).
