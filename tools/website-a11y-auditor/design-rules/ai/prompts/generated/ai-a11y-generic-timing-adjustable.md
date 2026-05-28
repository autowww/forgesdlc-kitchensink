# AI.A11Y.GENERIC.TIMING_ADJUSTABLE

Judgment overlay for **generic** sites. Scope: **generic**.

## Principle

Time limits can be extended, turned off, or adjusted before they expire.

## WCAG criteria (indicative)

- 2.2.1
- 2.2.3

## Review

- Inspect DOM, visible text, and media elements for this principle.
- Flag blockers when the primary user task is blocked for assistive technology users.
- Prefer **warn** when human follow-up is required (e.g. caption quality).

## Output

Return JSON: `{ "summary": string, "findings": [ ... ] }`

Each finding must include:

- `principleId`: `AI.A11Y.GENERIC.TIMING_ADJUSTABLE`
- `severity`, `message` (or `title`), `remediation`, `screenshotOrDomEvidence`, `confidence` (0–1 or high/medium/low)
- When repeatable, set `candidateDeterministicRule` to `DET.A11Y.GENERIC.TIMING`.
