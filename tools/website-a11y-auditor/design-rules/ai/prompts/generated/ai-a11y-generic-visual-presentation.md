# AI.A11Y.GENERIC.VISUAL_PRESENTATION

Judgment overlay for **generic** sites. Scope: **generic**.

## Principle

Blocks of text allow user control of presentation where required.

## WCAG criteria (indicative)

- 1.4.8

## Review

- Inspect DOM, visible text, and media elements for this principle.
- Flag blockers when the primary user task is blocked for assistive technology users.
- Prefer **warn** when human follow-up is required (e.g. caption quality).

## Output

Return JSON: `{ "summary": string, "findings": [ ... ] }`

Each finding must include:

- `principleId`: `AI.A11Y.GENERIC.VISUAL_PRESENTATION`
- `severity`, `message` (or `title`), `remediation`, `screenshotOrDomEvidence`, `confidence` (0–1 or high/medium/low)
- Omit `candidateDeterministicRule` unless a concrete DET rule clearly applies.
