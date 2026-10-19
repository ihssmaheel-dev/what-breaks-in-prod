---
id: 004
title: Authentication vs Authorization (AuthN vs AuthZ)
slug: authentication-vs-authorization
category: 01-foundations
level: beginner
status: published
prerequisites: [001-http-status-codes-and-error-semantics]
related: [jwt-and-token-rotation, input-validation-and-sanitization]
tags: [security, authn, authz, idor, bola, rbac]
last_reviewed: 2026-10-19
---

# Authentication vs Authorization (AuthN vs AuthZ)

> **In 30 seconds:** Authentication (AuthN) verifies who you are, like showing your passport at an airport check-in desk. Authorization (AuthZ) decides what you are allowed to do, like checking if your ticket lets you into the first-class lounge. If your API verifies identity but forgets to check document ownership, any logged-in user can view and edit everyone else's private data.

---

## The story

Consider this realistic engineering scenario: A digital healthcare startup launches an online patient portal called MediPulse.

The engineering team prioritizes security from day one. They set up email and password login with strong bcrypt password hashing. When a user logs in, the server generates a signed cryptographic token. Every API endpoint runs through authentication middleware: if a request arrives without a valid token, the server immediately returns `401 Unauthorized`.

The team feels proud. They tell management: "Our API is completely locked down. Nobody can access anything without logging in."

Three months later, a patient named Alice logs into her account to view her routine blood test results. Her browser sends this HTTP request:

```http
GET /api/lab-results?recordId=10452 HTTP/1.1
Host: medipulse.example.com
Authorization: Bearer alice-valid-session-token
```

The authentication middleware inspects the token. The signature is valid. The user is indeed Alice. The request proceeds to the database query:

```sql
SELECT * FROM lab_records WHERE id = 10452;
```

Notice what is missing: the query never checks who owns record `10452`.

Alice is a software tester. Out of curiosity, she opens Chrome DevTools and looks at the network tab. She copies the request URL and changes `recordId=10452` to `recordId=10451`.

The page reloads. Alice is now looking at a confidential medical report for a patient named Bob: full home address, date of birth, medication history, and private lab notes.

Alice did not break any passwords. She did not forge any tokens. Her token was completely valid. The server answered her request because she was **authenticated**. But the server never checked if she was **authorized** to touch Bob's record.

This flaw is known as Broken Object Level Authorization (BOLA), also called Insecure Direct Object Reference (IDOR). A single script cycling through record IDs from 1 to 100,000 can dump the entire database in under an hour.

---

## The analogy

Think of staying at a large hotel:

- **Authentication (AuthN):** You walk up to the front desk and show your government ID. The receptionist confirms your name and hands you an electronic keycard. The hotel now knows: "Yes, this person is Alice."
- **Authorization (AuthZ):** You take the elevator to the fourth floor and tap your keycard against Room 412. The electronic lock asks: "Does this specific keycard have permission to unlock Room 412?" If Alice tries tapping her card on Room 413 (Bob's room), the lock blinks red and stays bolted shut.
- **The BOLA / IDOR Bug:** Imagine the hotel buys cheap door locks that only check if the plastic card belongs to *any* guest staying in the hotel. The lock never checks which room you actually paid for. Now Alice can walk down the hallway opening every guest room in the building.

Authentication proves your identity. Authorization checks your permissions.

---

## What it is

Developers often mix up authentication and authorization because both words start with "auth". In production, they are two completely separate steps that run in a strict order:

| Dimension | Authentication (AuthN) | Authorization (AuthZ) |
| :--- | :--- | :--- |
| **Question answered** | "Who are you?" | "What are you allowed to do?" |
| **When it runs** | First (at the door) | Second (at the specific resource) |
| **Input** | Passwords, session cookies, OAuth tokens, biometrics | User ID, user role, permissions, resource ownership |
| **Failure status code** | `401 Unauthorized` (really means "Unauthenticated") | `403 Forbidden` (or `404 Not Found` to hide existence) |
| **Example failure** | "Wrong password" or "Session expired" | "Alice cannot delete Bob's invoice" |

### The Three Types of Authorization

Authorization is not just a single yes-or-no check. In modern backends, authorization operates at three distinct levels:

1. **Role-Based Access Control (RBAC):** Checks if the user belongs to a specific group.
   - Example: Only users with the `admin` role can visit `/admin/dashboard`.
2. **Object-Level Access Control (BOLA / IDOR Defense):** Checks if the user owns or has explicit rights to a specific data row.
   - Example: Alice can view `/invoices/101` because it belongs to her, but cannot view `/invoices/102` belonging to Bob.
3. **Field-Level Access Control:** Checks if the user can see specific columns within a record.
   - Example: A manager can see an employee's job title and salary, but a teammate can only see the job title.

---

## How it works

The following sequence diagram shows the difference between a system that only checks authentication (vulnerable to BOLA) and a system that enforces object-level authorization:

```mermaid
sequenceDiagram
    autonumber
    actor Attacker as Logged-in User (Alice)
    participant API as API Server
    participant DB as Database

    Note over Attacker, DB: Scenario A: Broken (Authentication Only - BOLA Leak)
    Attacker->>API: GET /api/records/102 (Token: Alice)
    API->>API: Verify Token: Valid user Alice (AuthN OK)
    API->>DB: SELECT * FROM records WHERE id = 102
    DB-->>API: Returns Bob's confidential record
    API-->>Attacker: 200 OK (Bob's private record leaked!)

    Note over Attacker, DB: Scenario B: Fixed (Authentication + Object-Level AuthZ)
    Attacker->>API: GET /api/records/102 (Token: Alice)
    API->>API: Verify Token: Valid user Alice (AuthN OK)
    API->>DB: SELECT * FROM records WHERE id = 102 AND owner_id = 'alice'
    DB-->>API: 0 rows found
    API-->>Attacker: 404 Not Found or 403 Forbidden (Bob's data is safe)
```

### Walkthrough of the Steps

1. **Client sends request with credentials:** Alice sends her valid session token in the `Authorization` header. She asks for record `102` (which belongs to Bob).
2. **Authentication succeeds:** The server validates the token signature and extracts Alice's user ID (`req.user = { id: 'alice' }`).
3. **Scenario A (Broken):** The server ignores `req.user.id` when fetching the data. It searches the database solely by `WHERE id = 102`. The database returns Bob's private record, and the server blindly returns it with status `200 OK`.
4. **Scenario B (Fixed):** The server automatically scopes the query to the authenticated user: `WHERE id = 102 AND owner_id = 'alice'`. Because Alice does not own record `102`, the database returns zero rows.
5. **Safe response:** The server returns `404 Not Found` (or `403 Forbidden`), completely protecting Bob's confidential data.

---

## Broken vs fixed

### Broken: Authentication without object authorization

Here is typical beginner backend code. It checks that the user is logged in, but trusts the client-provided `id` parameter directly:

```javascript
// Express.js route handler
app.get('/api/documents/:id', requireAuth, async (req, res) => {
  // Authentication passed: req.user contains the logged-in user
  const documentId = req.params.id;

  // DANGER: We query by documentId only!
  // Any logged-in user can read ANY document by changing the URL parameter.
  const document = await db.query(
    'SELECT * FROM documents WHERE id = $1',
    [documentId]
  );

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Leaks private data to unauthorized users!
  return res.status(200).json(document);
});
```

### Fixed: Enforcing object-level ownership

Here is the secure implementation. The database query is scoped strictly to the authenticated user, or an explicit authorization check verifies ownership:

```javascript
// Secure Express.js route handler
app.get('/api/documents/:id', requireAuth, async (req, res) => {
  const documentId = req.params.id;
  const currentUserId = req.user.id;

  // SAFE: Query scoped strictly to the authenticated user's ownership
  const document = await db.query(
    'SELECT * FROM documents WHERE id = $1 AND owner_id = $2',
    [documentId, currentUserId]
  );

  // If the record does not exist OR belongs to someone else, return 404
  if (!document) {
    return res.status(404).json({
      error: 'Document not found',
    });
  }

  return res.status(200).json(document);
});
```

Alternatively, if you use an ORM or policy-based access control library:

```javascript
// Policy-based authorization check
app.delete('/api/documents/:id', requireAuth, async (req, res) => {
  const document = await db.findDocumentById(req.params.id);

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Explicit policy check
  const canDelete = document.ownerId === req.user.id || req.user.role === 'admin';
  if (!canDelete) {
    return res.status(403).json({
      error: 'You do not have permission to delete this document',
    });
  }

  await db.deleteDocument(document.id);
  return res.status(204).send();
});
```

---

## Try it yourself

Run the zero-dependency demonstration script included in this folder:

```bash
node docs/01-foundations/004-authentication-vs-authorization/demo.mjs
```

### What the demo shows

1. **Anonymous request:** Fails immediately with `401 Unauthorized` because no auth token is provided.
2. **Legitimate request:** Alice uses her valid token to view her own medical record `#101`. The server returns `200 OK`.
3. **The Broken endpoint (BOLA / IDOR):** Alice keeps her valid token, but changes the query parameter to Bob's record `#102`. The broken endpoint leaks Bob's confidential medical diagnosis.
4. **The Fixed endpoint:** Alice repeats the attack on the secured endpoint. The server verifies her identity, detects that she does not own record `#102`, and rejects the request with `403 Forbidden`.

---

## Where you have seen it

- **OWASP API Security Top 10:** Broken Object Level Authorization (BOLA) has held the number 1 spot on the OWASP API security rankings for years. It accounts for a massive portion of all modern API data leaks.
- **Postal and Delivery Trackers:** Multiple national shipping carriers experienced vulnerabilities where changing the tracking ID in an authenticated web portal exposed the full names, phone numbers, and physical home addresses of other recipients.
- **Smart Vehicle Apps:** Several automotive and electric scooter apps suffered bugs where an authenticated user could unlock another person's car or scooter simply by passing the target vehicle's serial number to the unlock API.

---

## When to use it

- **Every database query that filters by ID:** Never fetch, modify, or delete a record using only an ID supplied by the client without verifying ownership or tenancy.
- **Multi-tenant SaaS products:** Every single tenant query must be scoped by `tenant_id` to prevent cross-customer data leakage.
- **Administrative actions:** Verify that the authenticated user possesses the specific administrative role required before executing sensitive operations.

---

## When to skip it

- **Public endpoints:** Endpoints specifically designed for unauthenticated public traffic (such as `GET /api/v1/products`, documentation pages, or marketing blog posts) require neither AuthN nor AuthZ.
- **Global reference data:** Static lookup tables that are identical for every user (such as lists of countries, postal code formats, or currency symbols).

---

## Common mistakes

- **Hiding UI buttons instead of protecting API routes:** Disabling a "Delete Invoice" button in a React UI does not secure your backend. Anyone can open a terminal and run `curl -X DELETE /api/invoices/99`.
- **Assuming UUIDs replace authorization:** Using random strings like `uuidv4` makes IDs harder to guess than sequential numbers (like 1, 2, 3). But UUIDs still leak in web browser history, logs, and shared links. Obscurity is never a replacement for authorization.
- **Returning 401 instead of 403:** If an authenticated user tries to view a record they do not own, returning `401 Unauthorized` tricks client applications into thinking the user's session expired, prompting an unnecessary logout. Return `403 Forbidden` or `404 Not Found`.
- **Securing GET but forgetting PUT, PATCH, and DELETE:** A team remembers to scope read queries, but forgets to verify ownership when updating or deleting records. An attacker cannot read Bob's profile, but can overwrite Bob's email address.
- **Checking permissions only at the API gateway:** The gateway verifies the user's JWT, but downstream microservices accept internal requests without verifying object ownership. If one service is compromised, all data is exposed.

---

## Self-test

<details>
<summary>Question 1: Why is BOLA / IDOR considered the number one API vulnerability rather than weak password hashing?</summary>

Password attacks require guessing or cracking credentials. BOLA allows an attacker who already has a regular, low-privilege, valid account to steal millions of confidential records from other users simply by changing a number in an API request. The attacker is fully authenticated, so firewalls and rate limiters often treat the traffic as legitimate user activity.
</details>

<details>
<summary>Question 2: If your database uses random 128-bit UUIDs instead of sequential integers (1, 2, 3), do you still need object-level authorization?</summary>

Yes, absolutely. UUIDs prevent blind enumeration attacks (an attacker guessing sequential IDs in a loop). However, UUIDs regularly leak in URLs, referrer headers, client-side caches, webhooks, and shared invite links. Once an attacker obtains a valid UUID, missing authorization allows them to read, edit, or delete the resource without restriction.
</details>

<details>
<summary>Question 3: When an authenticated user requests a record belonging to another user, should you return 403 Forbidden or 404 Not Found?</summary>

Both are valid, but they carry different trade-offs:
- `403 Forbidden` is semantically accurate: "You are logged in, but you are not allowed to see this." However, it confirms to an attacker that the record ID actually exists in your database.
- `404 Not Found` prevents enumeration: The attacker cannot tell whether the record does not exist or simply belongs to someone else. High-security platforms (such as GitHub for private repositories) return `404 Not Found` for unauthorized object access.
</details>

---

## Interview angle

1. **How do you prevent Broken Object Level Authorization (BOLA) systematically across a large engineering team?**
   - Relying on individual developers to remember `WHERE user_id = ?` in every SQL query will inevitably fail as codebases grow.
   - The production solution is architectural:
     - Use database-level Row Level Security (RLS) in databases like PostgreSQL, which enforces tenant or user boundaries automatically on every query.
     - Implement centralized repository layers or ORM middleware that automatically injects tenant and user scoping into queries.
     - Use policy enforcement libraries (such as Open Policy Agent or CASL) that evaluate access rules in middleware before route handlers execute.

2. **What is the difference between 401 Unauthorized and 403 Forbidden, and why does this distinction matter for frontend applications?**
   - `401 Unauthorized` means unauthenticated: the client sent missing or invalid credentials. Frontends respond to 401 by clearing tokens and redirecting the user to the login screen.
   - `403 Forbidden` means unauthorized: the server knows exactly who the user is, but their permissions do not allow this action.
   - If a backend returns 401 when an authorized user accesses a forbidden record, the frontend will mistakenly log the user out, causing frustration and confusing bug reports.

---

## Cheat sheet

- **Authentication (AuthN):** Confirms identity ("Who are you?"). Handled with passwords, tokens, and multi-factor auth.
- **Authorization (AuthZ):** Confirms permissions ("What are you allowed to do?"). Handled with RBAC, ownership checks, and policies.
- **The BOLA rule:** Never query, update, or delete a record using only an ID supplied by the user. Always verify ownership.
- **Status codes:** Return `401` when credentials are missing or invalid; return `403` or `404` when permissions are denied.
- **UUIDs are not security:** Random IDs prevent easy guessing, but they do not replace authorization checks.

---

## Related concepts

- [001: HTTP Status Codes and Error Semantics](../001-http-status-codes-and-error-semantics/README.md)
- [007: Input Validation and Sanitization](../007-input-validation-and-sanitization/README.md)
- [022: JWT and Token Rotation](../../08-security/022-jwt-and-token-rotation/README.md)

---

## Sources

- [OWASP API Security Top 10: API1:2023 Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- [RFC 9110: HTTP Semantics (Sections 15.5.2 "401 Unauthorized" and 15.5.4 "403 Forbidden")](https://www.rfc-editor.org/rfc/rfc9110.html)
- [PortSwigger Web Security Academy: Insecure Direct Object References (IDOR)](https://portswigger.net/web-security/access-control/idor)
