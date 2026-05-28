# A11y tooling stub inventory

Generated: 2026-05-28T05:38:46.834Z

> Read-only gap report. Does not modify code or close gaps.

## DET auditor (`analyze-website-a11y.mjs`)

- Crawl executes **axe + det**; **ai** when `--lanes` includes `ai` and agent not skipped (`lib/a11y-crawl.js`).
- `--enable-ai` lists eligible AI rules; use `--lanes axe,det,ai` to run AI in crawl when allowed.

## AI auditor (`run-website-a11y-ai-audit.mjs`)

- Separate CLI after deterministic audit.
- Depends on `run-design-ai-rule.sh` and agent availability.

## DET scorer (`score-compliance-a11y.mjs`)

- Default crawl lanes: **axe,det** — AI pack tooling not exercised in default site crawl.

## AI scorer

- **No** dedicated AI-only scorer CLI.
- **Yes** merged path: `run-website-a11y-ai-audit.mjs` → `npm run merge-ai-audit` → `score-compliance-a11y.mjs --audit-data`.
- Compliance criteria include `failingByLane` (axe / det / ai) when site findings exist.

## Quality scorer (`score-website-a11y.mjs`)

- Severity penalty only; not scoped to standards packs or WCAG 3 profiles.

## DET remediation (`lib/a11y-deterministic-fixers/`)

- Pilot fixers: **68** / **68** implemented DET rules.

## AI remediation

- **`lib/a11y-ai-fixers/`** — `run-ai-fixers.mjs` (plan_only v1; no auto DOM apply unless extended).
- `run-website-a11y-remediation-loop.sh` calls AI fixers after DET fixers.

## Rule pages with placeholder examples

Count: **0**


## DET checks flagged heuristic/supplemental in source

Count: **30**

- `det-a11y-generic-accessible-authentication.check.js`
- `det-a11y-generic-change-on-request.check.js`
- `det-a11y-generic-concurrent-input.check.js`
- `det-a11y-generic-consistent-help.check.js`
- `det-a11y-generic-consistent-nav.check.js`
- `det-a11y-generic-context-help.check.js`
- `det-a11y-generic-contrast-enhanced.check.js`
- `det-a11y-generic-contrast.check.js`
- `det-a11y-generic-dragging-movements.check.js`
- `det-a11y-generic-error-prevention.check.js`
- `det-a11y-generic-flash-threshold.check.js`
- `det-a11y-generic-focus-appearance.check.js`
- `det-a11y-generic-focus-context-change.check.js`
- `det-a11y-generic-focus-obscured-enhanced.check.js`
- `det-a11y-generic-glossary-abbr.check.js`
- `det-a11y-generic-interruptions.check.js`
- `det-a11y-generic-keyboard-access.check.js`
- `det-a11y-generic-lang-of-parts.check.js`
- `det-a11y-generic-low-background-audio.check.js`
- `det-a11y-generic-media-tracks.check.js`
- `det-a11y-generic-multiple-ways.check.js`
- `det-a11y-generic-pointer-gestures.check.js`
- `det-a11y-generic-re-authentication.check.js`
- `det-a11y-generic-reading-level-heuristic.check.js`
- `det-a11y-generic-reading-order.check.js`
- `det-a11y-generic-redundant-entry.check.js`
- `det-a11y-generic-resize-text.check.js`
- `det-a11y-generic-target-size-min.check.js`
- `det-a11y-generic-timing.check.js`
- `det-a11y-generic-visual-presentation-aaa.check.js`

## Standards packs (uncovered / manual)

| Pack | Uncovered | Manual rows | automationProxy |
|------|----------:|------------:|-----------------|
| wcag20a | 0 | 8 | — |
| wcag20aa | 0 | 12 | — |
| wcag20aaa | 0 | 30 | — |
| wcag21a | 0 | 9 | — |
| wcag21aa | 0 | 13 | — |
| wcag21aaa | 0 | 31 | — |
| wcag22a | 0 | 9 | — |
| wcag22aa | 0 | 17 | — |
| wcag22aaa | 0 | 38 | — |
| wcag30bronze | 0 | 5 | wcag22aa |
| wcag30silver | 0 | 14 | wcag22aa |
| wcag30gold | 0 | 14 | wcag22aaa |

## WCAG 3 requirements without mapsToWcag22

- (none in catalog)

## Machine-readable

See [`a11y-tooling-stub-inventory.json`](a11y-tooling-stub-inventory.json).

