# AI.A11Y.GENERIC.CHANGE_ON_REQUEST

Judgment overlay for **generic** sites. Scope: **generic**.

## Principle

Context changes occur only on user request.

## WCAG criteria (indicative)

- 3.2.5

## Review

- Inspect DOM, visible text, and media elements for this principle.
- Flag blockers when the primary user task is blocked for assistive technology users.
- Prefer **warn** when human follow-up is required (e.g. caption quality).

## Output

Return JSON: `{ "summary": string, "findings": [ ... ] }`

Each finding must include:

- `principleId`: `AI.A11Y.GENERIC.CHANGE_ON_REQUEST`
- `severity`, `message` (or `title`), `remediation`, `screenshotOrDomEvidence`, `confidence` (0–1 or high/medium/low)
- Omit `candidateDeterministicRule` unless a concrete DET rule clearly applies.
