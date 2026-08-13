# E04 — Composer spike: FORM handbook + catalog cross-links

**Phase:** E04  
**Executor:** Composer 2.5  
**Depends on:** E03

## Goal

Author full `det-form-label-error-summary.md` rule page; add Enterprise use / related ENT.APP / related DET tables on key primitives.

## Files to edit/create

| Path | Action |
|------|--------|
| `docs/design/ux-audit/rule-pages/det-form-label-error-summary.md` | Create (RULE_PAGE_SCHEMA compliant) |
| `docs/design/catalog/primitives/FAM-react-primitives.md` | Add enterprise cross-link tables per child |
| `docs/design/catalog/components/Ftb-filter-toolbar.md` | Enterprise use section |
| `docs/design/catalog/components/Dtb-data-table.md` | Enterprise use section |
| `docs/design/catalog/components/Sab-sticky-action-bar.md` | Enterprise use section (if exists) |

## FORM rule page

Must include: Purpose, Passing signals, Failing signals, Before/After HTML (form + error summary), Evidence and remediation, Related rules.

Reference `DET.FORM.LABEL_ERROR_SUMMARY` from `deterministic-design-rules.md`.

## Primitive cross-links (minimum)

For Frh, Fda, Fsb, Ftb, Dtb, Sab — tables:

| Enterprise use | Related ENT.APP | Related DET |

## Forbidden scope

- No new components
- Do not run full blend-rules unless needed for manifest

## Acceptance

- [ ] `det-form-label-error-summary.md` exists with Before/After blocks
- [ ] FAM-react-primitives has enterprise tables for P0 ingredients

## Check

```bash
test -f docs/design/ux-audit/rule-pages/det-form-label-error-summary.md
grep -c 'Enterprise use' docs/design/catalog/primitives/FAM-react-primitives.md
```

## Report

Files changed; note manifest status after pagegen (E05).
