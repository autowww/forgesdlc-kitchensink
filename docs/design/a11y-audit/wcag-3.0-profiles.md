# WCAG 3.0 compliance profiles (draft)

**Working Draft only.** Not legal conformance. WCAG 2.2 remains the procurement baseline for most policies.

- **Specification:** [W3C WCAG 3.0](https://www.w3.org/TR/wcag-3.0/)
- **Catalog:** [`wcag3-outcomes-catalog.json`](wcag3-outcomes-catalog.json)

## Profile IDs (canonical)

| Profile | Tier | CLI example |
|---------|------|-------------|
| `wcag30bronze` | Bronze (minimum draft tier) | `--compliance-profile wcag30bronze` |
| `wcag30silver` | Silver | `--compliance-profile wcag30silver` |
| `wcag30gold` | Gold | `--compliance-profile wcag30gold` |

## Why not `wcag30a` / `wcag30aa` / `wcag30aaa`?

WCAG 3.0 **Bronze / Silver / Gold** is **not** equivalent to WCAG 2.x **Level A / AA / AAA**:

- **Bronze** is expected to overlap **most of WCAG 2.2 Level A + AA**, not Level A alone.
- **Silver / Gold** add supplemental requirements, assertions, and holistic expectations — not a 1:1 map to AA or AAA checklists.
- WCAG 3 uses a different structure (outcomes, core/supplemental, scoring) and **no axe `wcag30*` tags**.

CLI rejects legacy-style aliases (`wcag30a`, `wcag30aa`, `wcag30aaa`) with an error pointing to the canonical IDs above.

## Informative crosswalk to WCAG 2.x (automation proxy only)

| WCAG 3 tier | Informative 2.x relationship | `automationProxy` in packs |
|-------------|------------------------------|----------------------------|
| Bronze | Closest to **WCAG 2.2 AA** baseline | `wcag22aa` |
| Silver | Beyond 2.2 AA; supplemental outcomes | `wcag22aa` (+ manual/AI) |
| Gold | Aspirational; not equal to 2.2 AAA checklist | `wcag22aaa` (upper-bound proxy) |

## Tooling

```bash
cd tools/website-a11y-auditor
npm run blend-rules
node validate-standards-pack.mjs --pack wcag30bronze --strict
node score-compliance-a11y.mjs --compliance-profile wcag30bronze --pack-only --out ./reports/wcag30bronze
```

Reference pages: [`wcag/3.0/outcomes/`](wcag/3.0/outcomes/).

## Related

- [compliance-profiles.md](compliance-profiles.md)
- [standards-packs.md](standards-packs.md)
- [wcag3-import-notes.md](wcag3-import-notes.md)
