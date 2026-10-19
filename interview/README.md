# Backend & System Design Interview Question Bank

Targeted interview questions grouped by architectural category, complete with trade-off analyses and production evaluation criteria.

---

## Question Bank by Category

### API Reliability
- **How would you design an API endpoint to withstand rapid duplicate POST requests without double billing?**
  - Evaluates understanding of [Idempotency Keys](../docs/02-api-reliability/README.md), Redis mutex locks, and database unique constraints.
- **How would you prevent cascading failures when a critical third-party dependency experiences an outage?**
  - Evaluates knowledge of [Circuit Breakers](../docs/02-api-reliability/README.md), fast fallbacks, and bulkheads.

### Caching & Performance
- **How do you address the cache stampede problem when a high-traffic key expires?**
  - Evaluates understanding of [Cache Stampede](../docs/03-performance-and-caching/README.md), locking (mutex), and early probabilistic expiration algorithms (XFetch).
- **Why does P99 latency matter more than average latency for an e-commerce checkout page?**
  - Evaluates understanding of [P99 and Tail Latency](../docs/03-performance-and-caching/README.md) and user journey aggregation.

### Databases & Transactions
- **What is the difference between Read Committed and Repeatable Read isolation levels?**
  - Evaluates understanding of dirty reads, non-repeatable reads, and MVCC in [ACID and Isolation Levels](../docs/04-databases/README.md).
- **How do you migrate a database column with 50 million rows without taking downtime or locking writes?**
  - Evaluates understanding of [Zero-Downtime Migrations](../docs/04-databases/README.md) (Expand/Contract pattern).
