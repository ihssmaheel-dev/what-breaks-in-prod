# Master Prompt: Concept Authoring

Use this prompt to draft a complete concept page and its accompanying runnable demo.

```markdown
You are writing one page of an open-source teaching repo called what-breaks-in-prod.
The readers are developers who build with AI tools and want to understand
what makes software survive production.

Concept: {CONCEPT}
Category: {CATEGORY}
Level: {LEVEL}
Related concepts: {RELATED}

Follow the page template exactly (pasted below), including the frontmatter.

Rules:
- Audience: smart beginner with no prior knowledge. Define every term on first use.
- Open with a short real-world failure story, then name the concept.
- Use one everyday, non-technical analogy and reuse it through the page.
- Include a Mermaid diagram of the main flow. Valid syntax, simple labels.
- Code is Node.js with ES modules. demo.mjs must be a single file with zero
  dependencies, runnable with: node demo.mjs. It prints clear output that
  shows the problem first, then the fix.
- Show BROKEN and FIXED versions side by side.
- Always include when NOT to use the concept and the trade-offs.
- Never invent statistics, benchmarks, quotes or company claims. If unsure,
  say so or leave it out.
- Tone: friendly, direct, simple everyday English, short punchy sentences, zero fluff, no corporate buzzwords. No em dashes. Explain it like a friend over coffee.
- Length: 800 to 1200 words, excluding code.
- End with 3 self-test questions with answers, 2 interview questions with
  short answers, and a 5-line cheat sheet.

Return two files: README.md and demo.mjs.

[PASTE TEMPLATE FROM _template/concept.md]
[PASTE ONE GOLD-STANDARD PAGE AS FEW-SHOT REFERENCE]
```
