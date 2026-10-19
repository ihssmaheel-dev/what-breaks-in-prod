# Style Guide for what-breaks-in-prod

This document defines the writing, coding, and architectural standards for all concept pages in **what-breaks-in-prod**. Consistency is what makes this repository authoritative, readable, and immediately useful.

---

## 1. Core Writing Principles

1. **Write for someone smart but new.** Never use a term before defining it. If you introduce "latency" or "idempotency", explain what it means on the spot.
2. **Story first.** Always open with the failure scenario (a duplicate charge, a locked database, a 3 AM outage) before revealing the name of the pattern.
3. **One concept per page, one idea per section.** Each page must take between 5 to 8 minutes to read (800 to 1200 words, excluding code).
4. **Analogy before technical detail.** Use everyday, non-technical comparisons (coffee shops, postal sorting centers, restaurants) and reuse that analogy throughout the entire page.
5. **Show broken code and fixed code side by side.** Make the flaw unmistakable before presenting the solution.
6. **Diagram everything that moves.** Illustrate request flows, lock handoffs, message queues, and failover steps using Mermaid.
7. **Be honest about trade-offs.** Every single concept has a cost. Every page must explicitly state when NOT to use the concept.
8. **Short sentences, active voice, no hype, no filler.** Write directly to the reader.
9. **No em dashes.** Use standard commas, parentheses, colons, or separate sentences instead.
10. **Never invent numbers, benchmarks, or quotes.** Always cite official documentation, RFCs, or verified engineering blog posts.
11. **Tag every page:** `beginner`, `intermediate`, or `advanced`.

---

## 2. Code Standards

All runnable code must adhere to the following rules:

1. **Zero dependencies:** Demos must run on vanilla Node.js LTS using standard ECMAScript modules (`.mjs`). Do not add `package.json` or `npm install` requirements.
2. **Single-file demos:** Every demo lives in a single `demo.mjs` file inside the concept folder.
3. **Self-contained execution:** Running `node demo.mjs` should clearly print the broken scenario first, followed by the fixed scenario, and exit with code 0.
4. **Defensive code:** Clean up resources (close timers, HTTP servers, or open handles) so the script exits automatically without hanging.

---

## 3. Mermaid Diagram Guidelines

- Use `sequenceDiagram`, `flowchart TD`, or `stateDiagram-v2`.
- Always enable `autonumber` on sequence diagrams.
- Keep diagrams simple and scannable in under 30 seconds (maximum 10 to 12 steps).
- Verify that Mermaid renders properly on GitHub without syntax errors.

---

## 4. Definition of Done (Quality Gate)

A concept page is ready to publish only when:
- [x] A beginner can explain the concept after 5 minutes of reading.
- [x] Story, analogy, diagram, broken vs fixed code, and trade-offs are all present.
- [x] `node demo.mjs` runs with zero external installs.
- [x] Claims and RFC references are verified against authoritative sources.
- [x] All relative links resolve correctly.
- [x] 3 self-test questions and 2 interview questions are answered accurately.
- [x] A 5-line cheat sheet is included at the end.
- [x] Frontmatter metadata is complete.
