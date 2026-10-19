# Backend & System Design Glossary

Every term defined in a single, plain-English line without fluff.

---

### A
- **ACID:** A set of database transaction properties (Atomicity, Consistency, Isolation, Durability) guaranteeing data validity despite errors or crashes.
- **API Gateway:** A single server entry point that routes requests, enforces authentication, and handles rate limiting for microservices.
- **Asynchronous (Async):** An execution model where operations run without blocking the main execution thread while awaiting I/O.
- **Authentication:** Verifying the identity of a user, service, or client system.
- **Authorization:** Verifying whether an authenticated identity has permission to perform a specific action.
- **Autoscaling:** Dynamically increasing or decreasing computing resources based on real-time traffic demand.

### B
- **Backoff (Exponential):** A retry algorithm that exponentially increases the delay between successive attempts to avoid overwhelming a recovering server.
- **Backpressure:** A flow-control mechanism where a downstream consumer signals an upstream producer to slow down message emission.
- **Bloom Filter:** A space-efficient probabilistic data structure used to test whether an element is definitely not in a set or possibly in a set.
- **Bulkhead:** An architectural pattern isolating critical resources into distinct pools so a failure in one pool does not sink the entire system.

### C
- **CAP Theorem:** A distributed computing principle stating that a system can guarantee at most two out of Consistency, Availability, and Partition tolerance simultaneously.
- **Cache Invalidation:** The process of removing or updating stale cache entries when the underlying source of truth changes.
- **Cache Stampede:** A situation where many concurrent requests simultaneously miss the cache and overwhelm the origin database calculating the exact same result.
- **Cardinality (High-Cardinality Metrics):** The count of unique metric time-series created by label combinations; high cardinality crashes monitoring backends with out-of-memory errors.
- **Change Data Capture (CDC):** Streaming committed database row changes as an event stream to keep downstream systems and caches synchronized without dual-writes.
- **Circuit Breaker:** A design pattern that fails requests immediately when a downstream service is struggling, preventing cascading system collapse.
- **Consistent Hashing:** A hashing technique where adding or removing nodes only re-maps a minimal fraction of keys rather than reorganizing the entire cluster.
- **Correlation ID:** A unique identifier passed across distributed services in request headers to track a single end-to-end operation in logs.
- **CORS (Cross-Origin Resource Sharing):** A browser security mechanism that restricts web pages from making AJAX requests to a different domain unless authorized by the target server.

### D
- **Dead Letter Queue (DLQ):** A secondary queue dedicated to holding messages that could not be processed successfully after maximum retry attempts.
- **Deadlock:** A state where two or more concurrent processes cannot proceed because each is waiting for a lock held by the other.
- **Distributed Lock:** A synchronization lock coordinated across multiple server nodes using a consensus store (like Redis or etcd) to protect shared resources.
- **Dual-Write Problem:** An architectural failure where an application writes to two independent stores without atomic coordination, causing permanent state corruption when one write fails.

### E
- **Event Loop:** A single-threaded runtime loop in Node.js and browsers that monitors the call stack and offloads I/O tasks to background workers.
- **Eventual Consistency:** A consistency model where replicas are guaranteed to converge to the same value over time given no new updates.

### I
- **Idempotency:** The property of an operation where applying it multiple times produces the exact same outcome as applying it once.
- **Index (Database):** A supplementary data structure (typically a B-tree) that allows a database engine to locate records without scanning the entire table.

### J
- **JWT (JSON Web Token):** A compact, cryptographically signed URL-safe string containing a JSON payload used for stateless authorization.

### L
- **Load Shedding:** Dropping lower-priority incoming requests when a server approaches saturation to maintain stability for existing traffic.
- **Lock (Optimistic):** A concurrency strategy where updates check a version column before committing, rolling back if another transaction modified the row first.
- **Lock (Pessimistic):** A concurrency strategy where an exclusive database lock is held on rows for the duration of a transaction, blocking all other readers/writers.

### N
- **N+1 Query Problem:** A database performance anti-pattern where 1 query fetches a list of parent records, followed by N separate queries fetching child records in a loop.

### O
- **OOMKilled:** The operating system kernel terminating a container or process immediately when memory usage breaches configured limit thresholds.

### P
- **P99 Latency:** The response time threshold below which 99% of all requests complete, representing the experience of your slowest 1% of users.
- **Pagination (Cursor-based):** A pagination technique using a unique, sequential pointer (like an ID or timestamp) instead of numeric offsets to query adjacent pages efficiently.

### R
- **Race Condition:** A flaw where system behavior depends on the uncontrolled order or timing of concurrent execution threads.
- **Rate Limiting:** Restricting the number of requests a client or IP address can submit to an API within a defined window of time.
- **Read Replica:** A read-only copy of a primary database that synchronizes asynchronously to offload query traffic.
- **Replication Lag:** The delay between a write committing on a primary database and replicating to read replicas, causing stale read bugs.

### S
- **Saga Pattern:** A design pattern managing distributed transactions across multiple microservices through a sequence of local transactions and compensating rollbacks.
- **SQL Injection:** A vulnerability where untrusted user input is directly concatenated into SQL queries, altering command execution.
- **Structured Logging:** Emitting logs formatted as parseable machine-readable JSON objects rather than unstructured plain text.

### T
- **Thundering Herd:** A spike where numerous waiting processes or clients wake simultaneously to recompute or fetch an expired resource, crashing backend services.
- **Timeout:** An enforced limit on how long a client or server will wait for a response before terminating the operation.
- **Truncated Exponential Backoff with Jitter:** Exponential retry delays randomized with added noise to prevent client retries from synchronizing into coordinated waves.

### W
- **Webhook:** An automated HTTP POST callback triggered by an event in one service and sent to a configured endpoint on another.
- **Write-Through Cache:** A caching architecture where data is written to the cache and the backing database simultaneously before returning success.

### Z
- **Zero-Downtime Migration:** Applying database schema modifications in safe, backward-compatible phases (Expand/Contract) while the application remains fully online.
