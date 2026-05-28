# A11y tooling stub inventory

Generated: 2026-05-28T04:23:01.350Z

> Read-only gap report. Does not modify code or close gaps.

## DET auditor (`analyze-website-a11y.mjs`)

- Crawl executes **axe + det** only (`lib/a11y-crawl.js`).
- `--enable-ai` adds eligibility metadata; **does not** run LLM prompts in this CLI.

## AI auditor (`run-website-a11y-ai-audit.mjs`)

- Separate CLI after deterministic audit.
- Depends on `run-design-ai-rule.sh` and agent availability.

## DET scorer (`score-compliance-a11y.mjs`)

- Default crawl lanes: **axe,det** — AI pack tooling not exercised in default site crawl.

## AI scorer

- **No** dedicated compliance rollup consuming AI audit output.

## Quality scorer (`score-website-a11y.mjs`)

- Severity penalty only; not scoped to standards packs or WCAG 3 profiles.

## DET remediation (`lib/a11y-deterministic-fixers/`)

- Pilot fixers: **12** / **68** implemented DET rules.

## AI remediation

- **No** `a11y-ai-fixers/` module.
- `run-website-a11y-remediation-loop.sh` may skip agent if not on PATH.

## Rule pages with placeholder examples

Count: **75**

- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-audio-control.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-change-on-request.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-consistent-nav-judgment.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-context-help.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-error-prevention.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-form-error-association.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-interruptions.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-keyboard-no-exception.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-keyboard-task-flow.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-media-alternatives.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-multiple-ways.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-pointer-gestures-judgment.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-pronunciation.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-re-authentication.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-reading-level.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-sensory-instructions.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-timing-adjustable.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-unusual-words.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-generic-visual-presentation.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-ks-handbook-sidebar-labels.md`
- `docs/design/a11y-audit/rule-pages/ai-a11y-ks-region-labeling.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-accessible-authentication.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-app-focus-trap.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-autoplay-audio.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-change-on-request.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-character-shortcuts.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-consistent-help.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-consistent-labels.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-consistent-nav.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-context-help.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-contrast-enhanced.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-contrast.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-data-table-headers.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-diagram-alt.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-dragging-movements.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-error-prevention.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-flash-threshold.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-focus-appearance.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-focus-not-obscured.md`
- `docs/design/a11y-audit/rule-pages/det-a11y-generic-focus-obscured-enhanced.md`
- … and 35 more

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

