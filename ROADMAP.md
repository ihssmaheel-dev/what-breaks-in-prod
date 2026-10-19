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
1. HTTP basics and status codes
2. REST vs GraphQL
3. Serialization (JSON and Protobuf)
4. Authentication vs authorization
5. Environment config and the 12-factor app
6. Monolith vs modular monolith vs microservices
7. Input validation and sanitization
8. Pagination (offset vs cursor)
9. Time and timezones
10. Money handling
11. File uploads and object storage
12. Testing strategy

### 02 API Reliability (16)
13. Idempotency keys
14. Rate limiting
15. Reverse proxies
16. API gateways
17. Timeouts
18. Retries
19. Exponential backoff
20. Circuit breakers
21. Bulkheads
22. Load shedding
23. Graceful degradation
24. Webhooks
25. CORS
26. API versioning
27. Semantic versioning
28. Error handling conventions

### 03 Performance and Caching (12)
29. Connection pooling
30. N+1 queries
31. Caching strategies
32. Cache invalidation
33. Cache stampede
34. Load balancing
35. CDN and edge caching
36. Latency and throughput
37. P99 and tail latency
38. Profiling and load testing
39. Memory leaks
40. Garbage collection

### 04 Databases (13)
41. SQL vs NoSQL
42. Normalization vs denormalization
43. ACID and isolation levels
44. Database indexing
45. Query optimization
46. Read replicas
47. Database migrations
48. Zero-downtime migrations
49. Schema versioning
50. Soft deletes and audit logs
51. Multi-tenancy
52. Full-text search
53. OLTP vs OLAP

### 05 Concurrency (9)
54. Concurrency vs parallelism
55. Async and the event loop
56. Race conditions
57. Deadlocks
58. Optimistic locking
59. Pessimistic locking
60. Distributed locks
61. Thread safety
62. Background workers and job queues

### 06 Distributed Systems (15)
63. Sharding
64. Partitioning
65. Replication
66. Leader election
67. CAP theorem
68. Eventual consistency
69. Consensus and quorum
70. Consistent hashing
71. Hot keys and hot partitions
72. Distributed transactions
73. Saga pattern
74. Outbox pattern
75. Network partitions
76. Clock skew
77. Bloom filters

### 07 Messaging and Events (7)
78. Message queues
79. Pub/Sub
80. Event-driven architecture
81. CQRS and event sourcing
82. Dead letter queues
83. Backpressure
84. Cron jobs and scheduling

### 08 Security (17)
85. SQL injection
86. XSS
87. CSRF
88. SSRF
89. OWASP Top 10 and broken access control
90. OAuth
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
103. DNS
104. HTTP/2 and HTTP/3
105. WebSockets
106. Server-Sent Events
107. Long polling
108. gRPC

### 10 DevOps and Deployment (18)
109. Docker
110. Kubernetes
111. Helm charts
112. Service discovery
113. CI/CD
114. Build caching
115. Infrastructure as code
116. Terraform
117. Feature flags
118. Blue-green deployment
119. Canary releases
120. Rolling deployments
121. Rollbacks
122. Health checks
123. Liveness and readiness probes
124. Dependency hell
125. Graceful shutdown
126. Git branching and trunk-based development

### 11 Scaling and Resilience (12)
127. Autoscaling
128. Horizontal vs vertical scaling
129. Cost optimization
130. Cold starts
131. Serverless limits
132. Capacity planning
133. Multi-region deployment
134. Failover
135. Backups
136. Disaster recovery
137. Chaos engineering
138. Connection exhaustion

### 12 Observability and Operations (14)
139. Structured logging and correlation IDs
140. Monitoring
141. Metrics
142. Alerts
143. Distributed tracing
144. Observability
145. SLIs/SLOs/SLAs
146. Error budgets
147. Production incidents
148. On-call
149. Runbooks
150. Postmortems
151. Code review
152. Tech debt

### 13 AI-Era Backend (5)
153. LLM cost and token limits
154. Rate limits and retries for AI APIs
155. Embeddings and vector databases
156. Streaming responses
157. Prompt injection
