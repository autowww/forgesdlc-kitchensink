# AI.A11Y.GENERIC.CONSISTENT_NAV_JUDGMENT

Judgment overlay for **generic** sites. Scope: **generic**.

## Principle

Repeated navigation blocks are consistent across pages.

## WCAG criteria (indicative)

- 3.2.3

## Review

- Inspect DOM, visible text, and media elements for this principle.
- Flag blockers when the primary user task is blocked for assistive technology users.
- Prefer **warn** when human follow-up is required (e.g. caption quality).

## Output

Return JSON: `{ "summary": string, "findings": [ ... ] }`

Each finding must include:

- `principleId`: `AI.A11Y.GENERIC.CONSISTENT_NAV_JUDGMENT`
- `severity`, `message` (or `title`), `remediation`, `screenshotOrDomEvidence`, `confidence` (0–1 or high/medium/low)
- When repeatable, set `candidateDeterministicRule` to `DET.A11Y.GENERIC.CONSISTENT_NAV`.
