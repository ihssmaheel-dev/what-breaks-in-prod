# Learning Path: System Design Interview Sprint

A targeted crash course covering the recurring fundamentals evaluated in senior backend and system design interviews.

## Core Interview Pillars
When interviewers test system design, they focus on trade-offs, scalability limits, failure handling, and consistency guarantees.

### 1. CAP Theorem & Consistency Guarantees
- **CAP Theorem** (`docs/06-distributed-systems`): Why network partitions force a choice between consistency and availability.
- **Eventual Consistency** (`docs/06-distributed-systems`): Designing for read-your-writes and monotonic reads across replicas.
- **Consensus & Quorum** (`docs/06-distributed-systems`): How leader election and write majorities prevent split-brain.

### 2. Storage & Transactions
- **ACID & Isolation Levels** (`docs/04-databases`): Read committed vs repeatable read vs serializable.
- **Database Indexing & Query Plans** (`docs/04-databases`): B-trees vs LSM trees, composite index ordering, and query selectivity.
- **Sharding & Consistent Hashing** (`docs/06-distributed-systems`): Partitioning databases horizontally without hot spots or massive rebalancing.

### 3. Caching & Throughput
- **Caching Strategies** (`docs/03-performance-and-caching`): Cache-Aside vs Write-Through vs Write-Back.
- **Cache Invalidation & Stampedes** (`docs/03-performance-and-caching`): Mitigating stampedes using mutex locks, probabilistic early expiration (XFetch), and TTLs.

### 4. Traffic Management & Asynchronous Decoupling
- **Rate Limiting Algorithms** (`docs/02-api-reliability`): Token bucket, leaky bucket, sliding window counter.
- **Message Queues & Pub/Sub** (`docs/07-messaging-and-events`): At-least-once vs at-most-once delivery, ordering guarantees, and dead letter queues.

## Practice Questions
See the dedicated `/interview` directory for mock questions, trade-off matrices, and model answers.
