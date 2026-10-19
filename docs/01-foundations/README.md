# Category 01: Foundations

Core architectural building blocks, protocols, data patterns, and engineering fundamentals required before taking applications to production.

## Why this matters in production
Before scaling to thousands of concurrent users, basic protocol errors, poor timezone handling, unsafe money math, or naive file uploads will corrupt data and crash servers. Mastering these foundational primitives prevents costly rewrites.

## Concepts in this category

<!-- CONCEPT_TABLE_START -->
| ID | Concept | Level | Demo | Status |
| :--- | :--- | :---: | :---: | :---: |
| `001` | [HTTP Status Codes and Error Semantics](001-http-status-codes-and-error-semantics/README.md) | `beginner` | ✅ | 🟢 Published |
| `002` | [API Contract Drift and Schema Validation](002-api-contract-drift-and-schema-validation/README.md) | `beginner` | ✅ | 🟢 Published |
| `003` | [Serialization (JSON, Protobuf, and BigInt Precision)](003-serialization-json-protobuf-and-bigint-precision/README.md) | `beginner` | ✅ | 🟢 Published |
| `004` | [Authentication vs Authorization (AuthN vs AuthZ)](004-authentication-vs-authorization/README.md) | `beginner` | ✅ | 🟢 Published |
| `005` | [Environment Config and the 12-Factor App](005-environment-config-and-the-12-factor-app/README.md) | `beginner` | ✅ | 🟢 Published |
| `006` | [Monolith vs Modular Monolith vs Microservices](006-monolith-vs-modular-monolith-vs-microservices/README.md) | `beginner` | ✅ | 🟢 Published |
| `007` | [Input Validation and Sanitization](007-input-validation-and-sanitization/README.md) | `beginner` | ✅ | 🟢 Published |
| `008` | [Pagination (Offset vs Cursor)](008-pagination-offset-vs-cursor/README.md) | `beginner` | ✅ | 🟢 Published |
| `009` | [Time, Timezones, and UTC Handling](009-time-timezones-and-utc-handling/README.md) | `beginner` | ✅ | 🟢 Published |
| `010` | [Money Handling and Fixed-Point Math](010-money-handling-and-fixed-point-math/README.md) | `beginner` | ✅ | 🟢 Published |
| `011` | [File Uploads and Presigned Object Storage](011-file-uploads-and-presigned-object-storage/README.md) | `beginner` | ✅ | 🟢 Published |

<!-- CONCEPT_TABLE_END -->

## Planned Topics (12)
1. HTTP status codes and error semantics
2. API contract drift and schema validation
3. Serialization (JSON, Protobuf, and BigInt precision)
4. Authentication vs authorization
5. Environment config and the 12-factor app
6. Monolith vs modular monolith vs microservices
7. Input validation and sanitization
8. Pagination (offset vs cursor)
9. Time, timezones, and UTC handling
10. Money handling and fixed-point math
11. File uploads and presigned object storage
12. Testing strategy (unit vs integration vs contract vs load)
