# AI.A11Y.GENERIC.AUDIO_CONTROL

Judgment overlay for **generic** sites. Scope: **generic**.

## Principle

Autoplay audio can be paused or stopped; background audio meets contrast where applicable.

## WCAG criteria (indicative)

- 1.4.2
- 1.4.7

## Review

- Inspect DOM, visible text, and media elements for this principle.
- Flag blockers when the primary user task is blocked for assistive technology users.
- Prefer **warn** when human follow-up is required (e.g. caption quality).

## Output

Return JSON: `{ "summary": string, "findings": [ ... ] }`

Each finding must include:

- `principleId`: `AI.A11Y.GENERIC.AUDIO_CONTROL`
- `severity`, `message` (or `title`), `remediation`, `screenshotOrDomEvidence`, `confidence` (0–1 or high/medium/low)
- When repeatable, set `candidateDeterministicRule` to `DET.A11Y.GENERIC.AUTOPLAY_AUDIO`.
