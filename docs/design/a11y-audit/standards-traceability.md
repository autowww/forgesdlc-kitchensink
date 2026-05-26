# Standards traceability matrix (RTM)

The RTM joins three sources:

| Source | File | Role |
|--------|------|------|
| Canonical WCAG SC | [`wcag-criteria-catalog.json`](wcag-criteria-catalog.json) | Success criteria per profile |
| axe-core | extracted at blend time | `AXE.*` → WCAG SC via Deque tags |
| Forge registry | [`registry.generated.json`](../../tools/website-a11y-auditor/design-rules/registry.generated.json) | `DET.A11Y.*` / `AI.A11Y.*` with `wcagCriteria[]` |

## Profiles

| RTM profile | Scope |
|-------------|--------|
| `wcag21aa` | WCAG 2.1 Level A + AA (50 criteria in catalog) |
| `wcag22aa` | 2.1 AA + WCAG 2.2 AA additions (56 criteria) |

Compliance CLI profiles such as `ada-title-ii-wcag21aa` use the **wcag21aa** RTM row in audit reports.

## Coverage legend

| Value | Meaning |
|-------|---------|
| `axe` | At least one eligible axe rule maps to this SC |
| `det` | At least one `DET.A11Y.*` rule lists this SC |
| `manual_ai` | `AI.A11Y.*` candidate mapping (judgment lane) |
| `manual_catalog` | Catalog marks SC as manual-only (media, etc.) |
| `uncovered` | No axe/DET/AI mapping and not manual-only |

## Generated artifacts

| Output | Path |
|--------|------|
| Matrix JSON | `tools/website-a11y-auditor/design-rules/standards-traceability.generated.json` |
| Gap report | [`standards-traceability-gaps.md`](standards-traceability-gaps.md) |

## Refresh

```bash
cd tools/website-a11y-auditor
npm run blend-rules
```

Then rebuild showcase: `python3 generator/build-showcase.py` from the KS repo root.

## Rule metadata conventions

- **`wcagCriteria`** — indicative WCAG SC ids on DET/AI rules (required on DET unless `traceabilityRole: forge_only`).
- **`traceabilityRole: forge_only`** — KS governance rules (hash markers); excluded from untied-rule “action required” lists.

## Related

- [`compliance-profiles.md`](compliance-profiles.md) — axe tag bundles for audits
- [`standards-matrix.md`](standards-matrix.md) — CLI preset → tags

Automated output is **not** legal conformance or a VPAT.
