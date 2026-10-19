# Category 02: API Reliability

Techniques, patterns, and defenses designed to keep APIs responsive, resilient, and safe against duplicate operations and network failures.

## Why this matters in production
In local development, networks are instantaneous and requests never fail midway. In production, requests get dropped, retried repeatedly, or flood servers. Without rate limiting, timeouts, and idempotency, a single flaky dependency can bring down your entire architecture.

## Concepts in this category

<!-- CONCEPT_TABLE_START -->
| ID | Concept | Level | Demo | Status |
| :--- | :--- | :---: | :---: | :---: |
| - | _Coming soon_ | - | - | ⚪ Planned |

<!-- CONCEPT_TABLE_END -->

## Planned Topics (16)
1. Idempotency keys
2. Rate limiting
3. Reverse proxies
4. API gateways
5. Timeouts
6. Retries
7. Exponential backoff and jitter
8. Circuit breakers
9. Bulkheads
10. Load shedding
11. Graceful degradation
12. Webhooks
13. CORS and preflight request storms
14. API versioning and deprecation
15. Cascading failures and thundering herd
16. Error handling conventions (RFC 7807)
