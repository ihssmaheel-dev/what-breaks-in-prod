# Category 03: Performance and Caching

Maximizing throughput, shrinking latency, and caching safely without running into stampedes or memory leaks.

## Why this matters in production
A query that runs in 2 milliseconds on your machine will take down a database when 500 requests hit it at the same time. Caching is powerful, but cache invalidation, stampedes, and memory leaks represent some of the hardest operational bugs in backend systems.

## Concepts in this category

<!-- CONCEPT_TABLE_START -->
| ID | Concept | Level | Demo | Status |
| :--- | :--- | :---: | :---: | :---: |
| - | _Coming soon_ | - | - | ⚪ Planned |

<!-- CONCEPT_TABLE_END -->

## Planned Topics (12)
1. Connection pooling
2. N+1 queries
3. Caching strategies
4. Cache invalidation
5. Cache stampede
6. Load balancing
7. CDN and edge caching
8. Latency and throughput
9. P99 and tail latency
10. Profiling and load testing
11. Memory leaks
12. Garbage collection
