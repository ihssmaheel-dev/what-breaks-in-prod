# Contributing to what-breaks-in-prod

Thank you for your interest in contributing to **what-breaks-in-prod**! Our goal is to build the highest-quality, zero-dependency, open-source knowledge repository for backend systems and production resilience.

---

## The Core Philosophy: "AI Drafts, You Own the Facts"

We encourage using AI tools to assist in drafting content, but human ownership of facts is mandatory:
- **Never publish a page you could not explain in a senior-level interview.**
- Verify every claim, benchmark, and mechanism against official specifications (RFCs, official cloud docs, database internals).
- Never fabricate numbers or performance metrics.

---

## How to Add or Update a Concept

1. **Check the Roadmap:**
   Look at [ROADMAP.md](ROADMAP.md) and open issues to ensure the concept isn't already claimed.

2. **Follow the Template:**
   Copy [_template/concept.md](_template/concept.md) into the appropriate category folder under `docs/<category>/<id>-<slug>/README.md`.

3. **Create the Runnable Demo:**
   Create a single-file `demo.mjs` in the same directory using standard Node.js ES modules.
   - Zero external npm packages.
   - Illustrate the broken failure state first, then the resilient fixed state.
   - Run `node demo.mjs` locally to verify clean execution.

4. **Review Against the Style Guide:**
   Read [STYLE-GUIDE.md](STYLE-GUIDE.md). Specifically verify:
   - No em dashes used.
   - Story first, followed by everyday analogy.
   - Trade-offs and "When NOT to use it" clearly articulated.
   - Self-test and interview questions included.

5. **Update Tables & Verify CI:**
   Run the zero-dependency verification scripts:
   ```bash
   node scripts/build-index.mjs
   node scripts/check-demos.mjs
   ```

6. **Submit a Pull Request:**
   Submit your pull request using our pull request template.
