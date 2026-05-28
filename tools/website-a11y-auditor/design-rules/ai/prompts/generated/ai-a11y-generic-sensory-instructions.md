# AI.A11Y.GENERIC.SENSORY_INSTRUCTIONS

Judgment overlay for **generic** sites. Scope: **generic**.

## Principle

Instructions do not rely on shape, color, size, or sound alone.

## WCAG criteria (indicative)

- 1.3.3

## Review

- Inspect DOM, visible text, and media elements for this principle.
- Flag blockers when the primary user task is blocked for assistive technology users.
- Prefer **warn** when human follow-up is required (e.g. caption quality).

## Output

Return JSON: `{ "summary": string, "findings": [ ... ] }`

Each finding must include:

- `principleId`: `AI.A11Y.GENERIC.SENSORY_INSTRUCTIONS`
- `severity`, `message` (or `title`), `remediation`, `screenshotOrDomEvidence`, `confidence` (0–1 or high/medium/low)
- When repeatable, set `candidateDeterministicRule` to `DET.A11Y.GENERIC.SENSORY_CUES`.
