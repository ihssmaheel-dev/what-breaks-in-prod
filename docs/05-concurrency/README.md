# Category 05: Concurrency

Managing shared state, avoiding deadlocks and race conditions, and executing asynchronous tasks safely.

## Why this matters in production
In single-threaded local test runs, race conditions almost never trigger. Under production concurrency, two users clicking "buy" at the exact same millisecond can trigger negative inventory, duplicate refunds, and balance corruption if locking patterns are overlooked.

## Concepts in this category

<!-- CONCEPT_TABLE_START -->
| ID | Concept | Level | Demo | Status |
| :--- | :--- | :---: | :---: | :---: |
| - | _Coming soon_ | - | - | ⚪ Planned |

<!-- CONCEPT_TABLE_END -->

## Planned Topics (9)
1. Concurrency vs parallelism
2. Async and the event loop
3. Race conditions
4. Deadlocks and livelocks
5. Optimistic locking
6. Pessimistic locking
7. Distributed locks
8. Thread safety
9. Background workers and job queues
