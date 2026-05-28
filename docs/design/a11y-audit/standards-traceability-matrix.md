# Standards traceability matrix

> Automated axe and deterministic checks do not constitute legal conformance, ADA certification, VPAT completion, or WCAG sign-off. Pair with manual testing and, when needed, forge-accessibility Studio evidence.

generatedAt: 2026-05-28T08:42:55.303Z

Refresh: `cd tools/website-a11y-auditor && npm run blend-rules`

## Tooling × lane (auditor / scorer / remediation)

| Lane | Auditor | Scorer | Remediation |
|------|---------|--------|-------------|
| **axe** | `analyze-website-a11y.mjs` / `a11y-crawl.js` (default `--lanes axe,det`) | `score-compliance-a11y.mjs` → `failingByLane.axe`; `score-website-a11y.mjs` severity + optional `compliance` | No dedicated axe fixer in a11y loop |
| **DET** | Default crawl `DET.A11Y.*` (+ KS when `--rules-scope` allows) | Same findings → `failingByLane.det` | `run-deterministic-fixers.mjs` — see fixer ids below |
| **AI** | `--lanes …,ai` + agent, or `run-website-a11y-ai-audit.mjs` | `merge-ai-audit` + `score-compliance-a11y.mjs --audit-data` | `run-ai-fixers.mjs` (`plan_only` / `remediation_note`) |

`analyze-website-a11y.mjs` **must not** call `score-website-a11y.mjs` or `score-compliance-a11y.mjs`.

## Fixer registry (Forge rules)

- **DET** distinct fixer ids (68 rules): `hash_markers`, `nav_breadcrumb`, `patch_accessible_auth`, `patch_ambient_z`, `patch_app_focus_trap`, `patch_concurrent_input`, `patch_cta_label`, `patch_data_table`, `patch_diagram_alt`, `patch_dragging_movements`, `patch_error_prevention`, `patch_glossary_abbr`, `patch_landmarks`, `patch_motion_flash`, `patch_motion_reduced`, `patch_nav_toc`, `patch_page_lang`, `patch_page_mode`, `patch_page_title`, `patch_page_viewport`, `patch_re_authentication`, `patch_reading_level`, `patch_redundant_entry`, `patch_section_heading`, `repo_production`
- **AI** distinct fixer ids (21 rules): `ai_apply_audio_control`, `ai_apply_error_prevention`, `ai_apply_form_error`, `ai_apply_reading_level`, `ai_apply_region_labeling`, `ai_apply_timing_adjustable`, `plan_only`, `remediation_note`

## Profile summary (design-time SC coverage)

| Pack | Handbook | Total | axe SC | DET SC | AI SC | Manual | Covered | Uncovered |
|------|----------|------:|-------:|-------:|------:|-------:|--------:|----------:|
| `wcag20a` | [standards/wcag20a.md](standards/wcag20a.md) | 26 | 15 | 24 | 14 | 8 | 18 | 0 |
| `wcag20aa` | [standards/wcag20aa.md](standards/wcag20aa.md) | 38 | 18 | 34 | 20 | 12 | 26 | 0 |
| `wcag20aaa` | [standards/wcag20aaa.md](standards/wcag20aaa.md) | 61 | 23 | 57 | 37 | 30 | 31 | 0 |
| `wcag21a` | [standards/wcag21a.md](standards/wcag21a.md) | 31 | 16 | 29 | 15 | 9 | 22 | 0 |
| `wcag21aa` | [standards/wcag21aa.md](standards/wcag21aa.md) | 50 | 22 | 46 | 21 | 13 | 37 | 0 |
| `wcag21aaa` | [standards/wcag21aaa.md](standards/wcag21aaa.md) | 74 | 27 | 70 | 38 | 31 | 43 | 0 |
| `wcag22a` | [standards/wcag22a.md](standards/wcag22a.md) | 31 | 16 | 29 | 15 | 9 | 22 | 0 |
| `wcag22aa` | [standards/wcag22aa.md](standards/wcag22aa.md) | 56 | 23 | 52 | 21 | 17 | 39 | 0 |
| `wcag22aaa` | [standards/wcag22aaa.md](standards/wcag22aaa.md) | 83 | 24 | 79 | 38 | 38 | 45 | 0 |
| `wcag30bronze` | [standards/wcag30bronze.md](standards/wcag30bronze.md) | 37 | 19 | 34 | 14 | 5 | 32 | 0 |
| `wcag30silver` | [standards/wcag30silver.md](standards/wcag30silver.md) | 49 | 19 | 46 | 18 | 14 | 35 | 0 |
| `wcag30gold` | [standards/wcag30gold.md](standards/wcag30gold.md) | 49 | 19 | 46 | 18 | 14 | 35 | 0 |

## Artifacts

| Output | Path |
|--------|------|
| Matrix JSON | `tools/website-a11y-auditor/design-rules/standards-traceability.generated.json` |
| Gap report | [standards-traceability-gaps.md](standards-traceability-gaps.md) |
| Per-profile handbook | [standards/](standards/) |
| Standards packs | `tools/website-a11y-auditor/design-rules/standards-packs/*.pack.json` |

