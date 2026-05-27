# Accessibility compliance profiles

Named **compliance profiles** bundle:

1. **axe-core** `runOnly` tags (primary WCAG automation),
2. **DET.A11Y.\*** rules whose `standards[]` metadata overlaps the profile,
3. Report/showcase metadata for procurement-oriented campaigns.

**This is not legal conformance, ADA certification, VPAT completion, or WCAG sign-off.** Pair automated runs with manual testing and, when needed, **forge-accessibility** Studio evidence.

## Why only 21 handbook rules?

| Layer | Typical count | Role |
|-------|---------------|------|
| axe | ~80–100+ per run | Deque rules tagged for WCAG 2.x / Section 508 |
| DET.A11Y.\* | 17 | Forge/heuristic supplements |
| AI.A11Y.\* | 4 | Judgment overlays (`--enable-ai`) |

Profiles change **which axe tags run** and **which DET rules are in scope** — they do not multiply DET rules to match every WCAG success criterion.

## Profile IDs

| Profile | Use when |
|---------|----------|
| `wcag22aa` | Forge default (WCAG 2.2 AA axe tags) |
| `wcag20aa` | Legacy WCAG 2.0 A+AA ([W3C WCAG 2.0](https://www.w3.org/TR/WCAG20/)); axe `wcag2a` + `wcag2aa` only |
| `wcag20a` | WCAG 2.0 Level A only |
| `wcag20aaa` | WCAG 2.0 AAA (adds `wcag2aaa` axe tag) |
| `wcag21aa` | Procurement baseline; WCAG 2.1 AA |
| `wcag21a` | Level A only |
| `wcag22aaa` | AAA campaigns |
| `ada-title-ii-wcag21aa` | US state/local gov web (WCAG 2.1 AA mapping) |
| `ada-title-iii-wcag21aa` | US public accommodations web (WCAG 2.1 AA mapping) |
| `section508` | US federal ICT (axe `section508` + WCAG tags) |
| `en301549` | EU ICT procurement baseline |
| `best-practice` | Deque extras beyond WCAG |

ADA profiles use the **same** axe and DET tag bundle as `wcag21aa` — ADA references WCAG; there is no separate Deque “ADA” ruleset.

Per-profile **standards packs** (`*.pack.json`) for scriptable traceability and compliance scoring: see [standards-packs.md](standards-packs.md).

## CLI

```bash
node tools/website-a11y-auditor/analyze-website-a11y.mjs \
  --repo . \
  --site http://127.0.0.1:8080 \
  --compliance-profile ada-title-ii-wcag21aa
```

`--standard` is an alias for `--compliance-profile`.

Overrides (unchanged):

- `--axe-tags` — explicit tag list (custom profile)
- `--wcag-level a|aa|aaa` — derive tags from level
- `--include-best-practice` — append `best-practice` tag

## Report output

`a11y-audit-report.md` and `a11y-audit-data.json` include:

- `complianceProfile` — id, label, WCAG version/level, jurisdiction notes
- `coverageMap` — axe tags, DET rules in scope, excluded DET rules, manual testing themes

## Generated crosswalk

`tools/website-a11y-auditor/design-rules/compliance-profiles.generated.json` is emitted by `npm run blend-rules`. The Kitchen Sink showcase rule catalog embeds this table.

## Standards traceability matrix (RTM)

`npm run blend-rules` also emits:

- `design-rules/standards-traceability.generated.json` — SC ↔ axe / DET / AI per `wcag21aa` and `wcag22aa`
- [`standards-traceability-gaps.md`](standards-traceability-gaps.md) — uncovered criteria and untied rules

See [`standards-traceability.md`](standards-traceability.md). Audit reports include a `traceabilitySummary` when the matrix file is present.

## Manual testing still required

Even with the strictest profile, automate only a subset of WCAG. Typical manual themes:

- Keyboard-only task flows and focus visibility beyond heuristics
- Media alternatives (captions, audio description, transcripts)
- Complex widgets and live regions
- Cognitive load and plain language

## Related

- [`standards-matrix.md`](standards-matrix.md) — axe tag reference
- [`../../tools/website-a11y-auditor/README.md`](../../tools/website-a11y-auditor/README.md) — operator manual
- **forge-accessibility** Studio — SC-level evidence and deep CDP runs
