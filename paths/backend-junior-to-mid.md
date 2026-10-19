# Learning Path: Backend Junior to Mid-Level

A structured reading sequence guiding developers from basic CRUD implementation to robust system thinking.

## Progression Order

### Step 1: Category 01 - Foundations
Master core architectural boundaries, HTTP conventions, input validation, and foundational data handling.
- HTTP status codes & semantic usage
- REST vs GraphQL trade-offs
- 12-Factor App design and environment variables
- Safe pagination, timezones, and money precision

### Step 2: Category 02 - API Reliability
Ensure APIs do not collapse under unstable network conditions or client retries.
- Timeouts, retries, and exponential backoff
- Idempotency keys for non-GET endpoints
- Rate limiting and API gateways
- Circuit breakers and load shedding

### Step 3: Category 03 - Performance & Caching
Learn to measure bottlenecks, profile endpoints, and optimize throughput.
- Solving N+1 queries
- Managing connection pools
- Implementing cache-aside patterns
- Reading P99 / P99.9 latency distributions

### Step 4: Category 04 - Databases
Move beyond basic queries to production schema management and transaction safety.
- B-tree indexing and query execution plans
- ACID guarantees and isolation levels
- Zero-downtime database migrations (Expand/Contract pattern)
- Soft deletes vs audit logging

### Step 5: Category 05 - Concurrency
Tackle race conditions, asynchronous job loops, and distributed locking.
- Event loop mechanics vs OS thread concurrency
- Identifying and replicating race conditions
- Optimistic locking using version fields
- Background queues and worker isolation
