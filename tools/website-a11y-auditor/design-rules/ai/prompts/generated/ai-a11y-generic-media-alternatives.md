# AI.A11Y.GENERIC.MEDIA_ALTERNATIVES

Judgment overlay for **generic** sites. Scope: **generic**.

## Principle

Captions, audio description, transcripts, and text alternatives for time-based media.

## WCAG criteria (indicative)

- 1.2.1
- 1.2.2
- 1.2.3
- 1.2.4
- 1.2.5
- 1.2.6
- 1.2.7
- 1.2.8
- 1.2.9

## Review

- Inspect DOM, visible text, and media elements for this principle.
- Flag blockers when the primary user task is blocked for assistive technology users.
- Prefer **warn** when human follow-up is required (e.g. caption quality).

## Output

Return JSON: `{ "summary": string, "findings": [ ... ] }`

Each finding must include:

- `principleId`: `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES`
- `severity`, `message` (or `title`), `remediation`, `screenshotOrDomEvidence`, `confidence` (0–1 or high/medium/low)
- When repeatable, set `candidateDeterministicRule` to `DET.A11Y.GENERIC.MEDIA_TRACKS`.
