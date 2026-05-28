# Accessibility standards (RTM profiles)

> Automated axe and deterministic checks do not constitute legal conformance, ADA certification, VPAT completion, or WCAG sign-off. Pair with manual testing and, when needed, forge-accessibility Studio evidence.

generatedAt: 2026-05-28T06:59:02.982Z

Handbook pages for each **standards pack** (RTM profile). Regenerate via `npm run blend-rules`.

## RTM profiles

| Pack | Label | Criteria | Handbook |
|------|-------|----------:|----------|
| `wcag20a` | WCAG —  | 26 | [wcag20a.md](wcag20a.md) |
| `wcag20aa` | WCAG —  | 38 | [wcag20aa.md](wcag20aa.md) |
| `wcag20aaa` | WCAG —  | 61 | [wcag20aaa.md](wcag20aaa.md) |
| `wcag21a` | WCAG —  | 31 | [wcag21a.md](wcag21a.md) |
| `wcag21aa` | WCAG —  | 50 | [wcag21aa.md](wcag21aa.md) |
| `wcag21aaa` | WCAG —  | 74 | [wcag21aaa.md](wcag21aaa.md) |
| `wcag22a` | WCAG —  | 31 | [wcag22a.md](wcag22a.md) |
| `wcag22aa` | WCAG —  | 56 | [wcag22aa.md](wcag22aa.md) |
| `wcag22aaa` | WCAG —  | 83 | [wcag22aaa.md](wcag22aaa.md) |
| `wcag30bronze` | WCAG 3.0 bronze | 37 | [wcag30bronze.md](wcag30bronze.md) |
| `wcag30silver` | WCAG 3.0 silver | 49 | [wcag30silver.md](wcag30silver.md) |
| `wcag30gold` | WCAG 3.0 gold | 49 | [wcag30gold.md](wcag30gold.md) |

## Compliance CLI aliases → RTM pack

| CLI `--compliance-profile` | RTM pack | Label |
|---------------------------|----------|-------|
| `ada-title-ii-wcag21aa` | `wcag21aa` | ADA Title II — WCAG 2.1 AA (axe mapping) |
| `ada-title-iii-wcag21aa` | `wcag21aa` | ADA Title III — WCAG 2.1 AA (axe mapping) |
| `best-practice` | `wcag22aa` | Deque best-practice |
| `en301549` | `wcag22aa` | EN 301 549 (EU ICT, axe tag mapping) |
| `section508` | `wcag22aa` | US Section 508 (axe tag mapping) |
| `wcag20a` | `wcag20a` | WCAG 2.0 Level A |
| `wcag20aa` | `wcag20aa` | WCAG 2.0 Level AA |
| `wcag20aaa` | `wcag20aaa` | WCAG 2.0 Level AAA |
| `wcag21a` | `wcag21a` | WCAG 2.1 Level A |
| `wcag21aa` | `wcag21aa` | WCAG 2.1 Level AA |
| `wcag21aaa` | `wcag21aaa` | WCAG 2.1 Level AAA |
| `wcag22a` | `wcag22a` | WCAG 2.2 Level A |
| `wcag22aa` | `wcag22aa` | WCAG 2.2 Level AA |
| `wcag22aaa` | `wcag22aaa` | WCAG 2.2 Level AAA |
| `wcag30bronze` | `wcag30bronze` | WCAG 3.0 Bronze (draft) |
| `wcag30gold` | `wcag30gold` | WCAG 3.0 Gold (draft) |
| `wcag30silver` | `wcag30silver` | WCAG 3.0 Silver (draft) |

## Related

- [standards-traceability-matrix.md](../standards-traceability-matrix.md) — tooling × lane summary
- [manual-test-playbooks.md](manual-test-playbooks.md) — manual_expected criteria index
- [standards-traceability-gaps.md](../standards-traceability-gaps.md) — gap-only report
- [standards-packs.md](../standards-packs.md) — pack JSON location

## Adding a new standard

1. Extend `wcag-criteria-catalog.json` or `wcag3-outcomes-catalog.json`.
2. Add profile to `RTM_PROFILE_IDS` in `lib/axe-rule-catalog.js` and `COMPLIANCE_PROFILES` if needed.
3. Map DET/AI in `design-rules/blender/rule-mappings.js`.
4. Run `npm run blend-rules` (regenerates this folder + matrix MD).
5. Run `npm run bootstrap-wcag-seeds` and `npm run sync-wcag-md`.
6. `npm run validate-all-packs` and `npm test`.

