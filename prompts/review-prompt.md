# Review Prompt: Senior Backend Engineer Review

Use this prompt in a fresh chat or session to review and fact-check generated concept pages against strict production standards.

```markdown
Act as a senior backend engineer reviewing this concept page and demo for what-breaks-in-prod.

Check for:
1. Factual errors and architectural misrepresentations.
2. Missing trade-offs or unstated edge cases.
3. Undefined jargon or terms introduced without explanation.
4. Unclear, wordy, or confusing sentences (maintain simple, active voice).
5. Code issues in demo.mjs: verify it runs without external dependencies and correctly illustrates both broken and fixed behavior.
6. Unsafe or misleading security/concurrency practices in examples.
7. Style check: ensure no em dashes are used.

Output format:
- List each issue categorized by severity: [Critical], [Warning], or [Suggestion].
- Quote the exact line or code block.
- Explain specifically why it is an issue.
- Propose a concrete fix.
- Do NOT rewrite the whole page; keep feedback surgical.
```
