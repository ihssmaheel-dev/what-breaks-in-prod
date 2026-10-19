# Diagram Prompt: Mermaid Visualization Prompt

Use this prompt to generate clean, valid Mermaid diagrams for concepts.

```markdown
Create a Mermaid diagram explaining the flow of {CONCEPT}.

Diagram requirements:
- Use sequenceDiagram, flowchart TD, or stateDiagram-v2 depending on what fits best.
- If sequenceDiagram: use 'autonumber', define explicit participants, and label request/response arrows clearly.
- If flowchart: keep nodes clear, avoid overly complex styling, and use short readable node labels.
- Ensure 100% valid Mermaid syntax that renders cleanly on GitHub.
- Avoid quotes inside unescaped strings or special characters that break Mermaid parsers.
- Illustrate the transition from failure condition (or naive state) to the resilient mechanism.
- Keep the diagram under 12 steps so it remains scannable in 30 seconds.
```
