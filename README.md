# what-breaks-in-prod

> **What breaks in production when AI-generated code meets real traffic.**  
> A zero-dependency, open-source guide teaching 157 backend and system design concepts through failure stories, real-world analogies, diagrams, and runnable code.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Concepts](https://img.shields.io/badge/concepts-4%2F157-blue)
![Dependencies](https://img.shields.io/badge/dependencies-0-success)
![Node LTS](https://img.shields.io/badge/node-%3E%3D20-green)

---

## Why this exists

AI coding assistants can generate full-stack applications in minutes, but local development hides almost every failure mode that matters. On `localhost`, networks never drop packets, databases never lock under concurrent transactions, users never click "Purchase" five times in half a second, and third-party APIs never time out.

**what-breaks-in-prod** bridges the gap between prototyping and production. It teaches you how systems actually break under load, and the defensive architectural patterns required to keep them running.

---

## The 5-Part Promise

Every single concept page adheres to the exact same 5-part structure:

1. **A plain-English explanation:** Written for a smart beginner. Technical terms are defined on first use.
2. **An everyday analogy:** Intuitive non-technical comparisons (restaurants, coffee shops, post offices) reused across the page.
3. **A Mermaid diagram:** Visualizing request flows, race conditions, retries, and lock handoffs.
4. **Broken vs. Fixed runnable code:** A single zero-dependency `demo.mjs` script showing the failure first, followed by the production-safe fix.
5. **A self-test:** 3 scenario-based questions with expandable answers to test your intuition.

---

## Guided Learning Paths

Depending on your goal, jump directly into a curated reading path:

- 🚀 [**What Breaks First (Prototype to Production)**](paths/what-breaks-first.md) — The 30 highest-impact concepts every developer must master before handling real users and payments.
- 🎯 [**System Design Interview Sprint**](paths/interview-sprint.md) — Core distributed systems, consistency models, and transaction guarantees tested in technical interviews.
- 📈 [**Backend Junior to Mid-Level**](paths/backend-junior-to-mid.md) — Structured progression from basic REST CRUD to distributed locking and message queues.
- ✅ [**Production Readiness Checklist**](paths/production-readiness-checklist.md) — An interactive yes/no audit sheet for your service before deployment.

---

## Progress Overview

<!-- PROGRESS_TABLE_START -->
| # | Category | Planned | Published | Reviewed | Draft | Progress |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 01 | [Foundations](docs/01-foundations/README.md) | 12 | 4 | 0 | 0 | `███░░░░░░░ 33%` |
| 02 | [API Reliability](docs/02-api-reliability/README.md) | 16 | 0 | 0 | 0 | `░░░░░░░░░░ 0%` |
| 03 | [Performance & Caching](docs/03-performance-and-caching/README.md) | 12 | 0 | 0 | 0 | `░░░░░░░░░░ 0%` |
| 04 | [Databases](docs/04-databases/README.md) | 13 | 0 | 0 | 0 | `░░░░░░░░░░ 0%` |
| 05 | [Concurrency](docs/05-concurrency/README.md) | 9 | 0 | 0 | 0 | `░░░░░░░░░░ 0%` |
| 06 | [Distributed Systems](docs/06-distributed-systems/README.md) | 15 | 0 | 0 | 0 | `░░░░░░░░░░ 0%` |
| 07 | [Messaging & Events](docs/07-messaging-and-events/README.md) | 7 | 0 | 0 | 0 | `░░░░░░░░░░ 0%` |
| 08 | [Security](docs/08-security/README.md) | 17 | 0 | 0 | 0 | `░░░░░░░░░░ 0%` |
| 09 | [Networking & Real-Time](docs/09-networking-and-realtime/README.md) | 7 | 0 | 0 | 0 | `░░░░░░░░░░ 0%` |
| 10 | [DevOps & Deployment](docs/10-devops-and-deployment/README.md) | 18 | 0 | 0 | 0 | `░░░░░░░░░░ 0%` |
| 11 | [Scaling & Resilience](docs/11-scaling-and-resilience/README.md) | 12 | 0 | 0 | 0 | `░░░░░░░░░░ 0%` |
| 12 | [Observability & Operations](docs/12-observability-and-operations/README.md) | 14 | 0 | 0 | 0 | `░░░░░░░░░░ 0%` |
| 13 | [AI-Era Backend](docs/13-ai-era-backend/README.md) | 5 | 0 | 0 | 0 | `░░░░░░░░░░ 0%` |
| **All** | **Total** | **157** | **4** | **0** | **0** | **`░░░░░░░░░░ 3%`** |

<!-- PROGRESS_TABLE_END -->

---

## Published Concepts Catalog

<!-- CONCEPT_CATALOG_START -->
| ID | Concept | Category | Level | Demo | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `001` | [HTTP Status Codes and Error Semantics](docs/01-foundations/001-http-status-codes-and-error-semantics/README.md) | 01-foundations | `beginner` | ✅ | 🟢 Published |
| `002` | [API Contract Drift and Schema Validation](docs/01-foundations/002-api-contract-drift-and-schema-validation/README.md) | 01-foundations | `beginner` | ✅ | 🟢 Published |
| `003` | [Serialization (JSON, Protobuf, and BigInt Precision)](docs/01-foundations/003-serialization-json-protobuf-and-bigint-precision/README.md) | 01-foundations | `beginner` | ✅ | 🟢 Published |
| `004` | [Authentication vs Authorization (AuthN vs AuthZ)](docs/01-foundations/004-authentication-vs-authorization/README.md) | 01-foundations | `beginner` | ✅ | 🟢 Published |

<!-- CONCEPT_CATALOG_END -->

---

## Running Demos Locally

Every demo is self-contained and requires **zero package installations**:

```bash
# Clone the repository
git clone https://github.com/ihssmaheel-dev/what-breaks-in-prod.git
cd what-breaks-in-prod

# Run any concept demo directly with Node.js
node docs/02-api-reliability/001-idempotency-keys/demo.mjs

# Verify all demos across the repository
node scripts/check-demos.mjs
```

---

## Contributing

We welcome additions, fixes, and reviews! Please review our:
- [CONTRIBUTING.md](CONTRIBUTING.md) — Guide on proposing concepts, running scripts, and the fact-checking workflow.
- [STYLE-GUIDE.md](STYLE-GUIDE.md) — Voice, formatting, and strict writing rules (no em dashes, story first).
- [ROADMAP.md](ROADMAP.md) — The complete 157-concept roadmap and release schedule.

---

## License

This project is licensed under the [MIT License](LICENSE).
