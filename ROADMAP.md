# Roadmap: 157 Concepts to Production Resilience

This roadmap outlines the phased rollout of all 157 backend and system design concepts in **what-breaks-in-prod**.

---

## Phased Release Plan

- **Phase 0 (Day 1 - Foundation):**
  - Scaffold folder skeleton, scripts, templates, prompts, and CI.
  - Setup core documentation (`STYLE-GUIDE.md`, `CONTRIBUTING.md`, `ROADMAP.md`, `glossary.md`).
- **Phase 1 (Week 1 - Gold Standard Reference):**
  - Hand-polish 3 gold-standard concepts:
    - `001`: Idempotency keys (`docs/02-api-reliability`)
    - `002`: N+1 queries (`docs/03-performance-and-caching`)
    - `003`: Rate limiting (`docs/02-api-reliability`)
  - Use these three pages as few-shot exemplars inside `prompts/master-prompt.md`.
- **Phase 2 (Weeks 2 to 4 - v0.1 Launch Batch):**
  - Author the first 30 high-priority launch concepts (see [Launch Set](#the-first-30-launch-concepts)).
  - Tag release `v0.1`.
- **Phase 3 (Ongoing - Weekly Category Rollout):**
  - Ship one complete category per week.
  - Generate a 1-page cheatsheet for each completed category.
  - Tag a release after each category completes.
- **Phase 4 (Expansion):**
  - Complete the interview question bank in `/interview`.
  - Expand `glossary.md` with complete cross-references.
  - Optional static documentation site (GitHub Pages / VitePress).

---

## The First 30 Launch Concepts
These 30 concepts form the core survival kit for developers deploying apps to production:

1. Idempotency keys
2. Rate limiting
3. Timeouts
4. Retries
5. Exponential backoff
6. Circuit breakers
7. N+1 queries
8. Connection pooling
9. Caching strategies
10. Cache invalidation
11. Database indexing
12. ACID and isolation levels
13. Race conditions
14. Optimistic locking
15. Pagination (offset vs cursor)
16. Money handling
17. Authentication vs authorization
18. Password hashing
19. SQL injection
20. XSS
21. CSRF
22. JWT and token rotation
23. Secrets management
24. CORS
25. Webhooks
26. Message queues
27. Docker
28. CI/CD
29. Structured logging and correlation IDs
30. P99 and tail latency

---

## Full Catalog (157 Concepts Across 13 Categories)

### 01 Foundations (12)
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

### 02 API Reliability (16)
13. Idempotency keys
14. Rate limiting
15. Reverse proxies
16. API gateways
17. Timeouts
18. Retries
19. Exponential backoff and jitter
20. Circuit breakers
21. Bulkheads
22. Load shedding
23. Graceful degradation
24. Webhooks
25. CORS and preflight request storms
26. API versioning and deprecation
27. Cascading failures and thundering herd
28. Error handling conventions (RFC 7807)

### 03 Performance and Caching (12)
29. Connection pooling
30. N+1 queries
31. Caching strategies
32. Cache invalidation
33. Cache stampede
34. Load balancing algorithms
35. CDN and edge caching
36. Latency and throughput
37. P99 and tail latency
38. Profiling and load testing
39. Memory leaks
40. Garbage collection pauses

### 04 Databases (13)
41. SQL vs NoSQL
42. Normalization vs denormalization
43. ACID and isolation levels
44. Database indexing
45. Query optimization and EXPLAIN ANALYZE
46. Read replicas
47. Database migrations
48. Zero-downtime migrations (Expand/Contract)
49. Replication lag and read-your-own-writes
50. Soft deletes and tombstone penalties
51. Multi-tenancy
52. Full-text search
53. OLTP vs OLAP

### 05 Concurrency (9)
54. Concurrency vs parallelism
55. Async and the event loop
56. Race conditions
57. Deadlocks and livelocks
58. Optimistic locking
59. Pessimistic locking
60. Distributed locks
61. Thread safety
62. Background workers and job queues

### 06 Distributed Systems (15)
63. Sharding
64. Horizontal partitioning
65. Replication strategies
66. Leader election
67. CAP theorem
68. Eventual consistency and PACELC
69. Consensus and quorum
70. Consistent hashing
71. Hot keys and partition skew
72. The Dual-Write problem
73. Transactional outbox and CDC
74. Saga pattern
75. Distributed transactions and 2PC
76. Network partitions and split-brain
77. Clock skew and logical clocks

### 07 Messaging and Events (7)
78. Message queues vs streams
79. Pub/Sub
80. Event-driven architecture
81. At-least-once delivery and consumer deduplication
82. Dead letter queues and poison pills
83. Backpressure and consumer lag
84. Distributed cron and leader scheduling

### 08 Security (17)
85. SQL injection
86. XSS
87. CSRF
88. SSRF
89. OWASP Top 10 and broken access control
90. OAuth 2.0 and OIDC
91. JWT and token rotation
92. Password hashing
93. Secrets management
94. IAM and least privilege
95. MFA
96. TLS and encryption (at rest and in transit)
97. Security headers and CSP
98. WAF
99. DDoS protection
100. Supply chain security
101. PII and data privacy

### 09 Networking and Real-Time (7)
102. TCP vs UDP
103. DNS resolution, caching, and stale IP failover
104. HTTP/2 and HTTP/3
105. WebSockets
106. Server-Sent Events
107. Long polling
108. gRPC

### 10 DevOps and Deployment (18)
109. Docker and container images
110. Kubernetes primitives
111. Container resource limits and OOMKilled
112. Service discovery
113. CI/CD pipelines
114. Build caching
115. Infrastructure as code
116. Terraform drift and state locks
117. Feature flags and dark launches
118. Blue-green deployment
119. Canary releases and automated rollbacks
120. Rolling deployments
121. Database rollbacks
122. Health checks (liveness, readiness, startup)
123. CrashLoopBackOff and dependency boot ordering
124. Dependency hell and lockfiles
125. Graceful shutdown and connection draining
126. Git branching and trunk-based development

### 11 Scaling and Resilience (12)
127. Autoscaling triggers and lag
128. Horizontal vs vertical scaling
129. Cost optimization
130. Cold starts
131. Serverless limits
132. Capacity planning
133. Multi-region deployment
134. Automated failover
135. Backups and restore testing
136. Disaster recovery (RPO/RTO)
137. Chaos engineering
138. Connection exhaustion and file descriptor limits

### 12 Observability and Operations (14)
139. Structured logging and JSON logs
140. Distributed tracing and span propagation
141. Correlation IDs
142. Metrics collection and types
143. Metric cardinality explosion
144. Alerting fatigue and alert thresholds
145. Observability vs monitoring
146. SLIs/SLOs/SLAs
147. Error budgets
148. Production incidents and severity triage
149. On-call rotations
150. Runbooks and playbooks
151. Blameless postmortems
152. Tech debt and refactoring

### 13 AI-Era Backend (5)
153. LLM cost and token limits
154. Rate limits and retries for AI APIs
155. Embeddings and vector databases
156. Streaming responses and dropped connections
157. Prompt injection and structured output schema enforcement
