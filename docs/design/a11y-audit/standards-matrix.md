# Accessibility standards matrix

Maps CLI **`--standard`** / **`--compliance-profile`** presets to **axe-core** `runOnly` tags and **DET** `standards[]` filters.

See [`compliance-profiles.md`](compliance-profiles.md) for ADA, procurement context, and disclaimers.

| Profile | WCAG | axe tags (default) | DET standards tags |
|---------|------|-------------------|-------------------|
| `wcag21a` | 2.1 A | `wcag2a`, `wcag21a` | `wcag2a`, `wcag21a`, `wcag2aa` |
| `wcag21aa` | 2.1 AA | `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` | `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` |
| `wcag22aa` | 2.2 AA | above + `wcag22aa` | above + `wcag22aa` |
| `wcag22aaa` | 2.2 AAA | above + `wcag22aaa` | above + `wcag22aaa` |
| `ada-title-ii-wcag21aa` | 2.1 AA (ADA Title II mapping) | same as `wcag21aa` | same as `wcag21aa` |
| `ada-title-iii-wcag21aa` | 2.1 AA (ADA Title III mapping) | same as `wcag21aa` | same as `wcag21aa` |
| `section508` | US federal ICT | `section508`, `wcag2aa` | `section508`, `wcag2aa`, `wcag21aa` |
| `en301549` | EU ICT | `wcag2aa`, `wcag21aa` | `wcag2aa`, `wcag21aa` |
| `best-practice` | Deque extras | `best-practice` | `wcag2aa`, `wcag21aa`, `wcag22aa` |

Overrides:

- `--axe-tags tag1,tag2` — explicit tag list (custom profile)
- `--wcag-level a|aa|aaa` — derived tag set
- `--include-best-practice` — append `best-practice` to preset/level tags

Automated axe coverage is **not** a full WCAG audit. Pair with manual testing and, when needed, **forge-accessibility** Studio runs.

Generated machine-readable crosswalk: `tools/website-a11y-auditor/design-rules/compliance-profiles.generated.json` (from `npm run blend-rules`).
