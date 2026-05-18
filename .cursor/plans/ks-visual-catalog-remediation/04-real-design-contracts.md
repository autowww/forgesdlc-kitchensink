# Phase 04 — Real design contracts (evidence)

**Date:** 2026-05-18  
**Scope:** Replace catalog stubs with actionable design guidance; add cross-cutting page-type guidelines; align family contracts with **Covered children** and standard section names.

## Deliverables

| Deliverable | Path |
|-------------|------|
| Page-type & surface guidance (12 archetypes) | `docs/design/catalog/page-types/Ks-page-type-design-guidelines.md` |
| Contract template (instructional, no stub bullets) | `docs/design/catalog/contract-template.md` |
| Catalog README link | `docs/design/catalog/README.md` |
| **54** unique registry-backed contract Markdown files | `docs/design/catalog/{layouts,pages,chrome,components,diagrams,interactions,styles,primitives,desktop-interfaces,page-types}/…` |

Supplemental guidelines file is **not** a registry row; it informs reviews referenced from contracts.

## Registry-backed contract counts (current)

From `visual-registry-coverage.md` after acceptance run:

- **Registry entries:** 91  
- **contract_status `own`:** 54  
- **contract_status `family-covered`:** 37  
- **Distinct contract file paths:** 54 (YAML `contract:` deduplicated: 9 layouts + 31 pages + 6 chrome + 8 shared family/consumer paths: `FAM-react-primitives.md`, `Ksc-fam-styles.md`, `Ksj-fam-scripts.md`, `Ksv-fam-svg.md`, `Kpr-fam-python-renderers.md`, `Kdt-fam-design-terminology.md`, `Kra-fam-showcase-react-app.md`, `Msm-museum-studio.md`, `Fad-forge-autodoc.md`)

## Contract section standard (Phase 04)

**Own** contracts include: Identity, Purpose, Expected look, Anatomy, States, Variants, Responsive behavior, Accessibility contract, Enterprise look and feel rules, Content rules, Forbidden patterns, Implementation notes, Screenshot acceptance, Change policy, Changelog.

**Family** contracts add **Covered children** (explicit child hashes or governed source names).

## Acceptance commands

```bash
cd /path/to/forgesdlc-kitchensink
node tools/design-catalog/check-visual-catalog.mjs \
  --repo . \
  --registry docs/design/catalog/visual-registry.yaml \
  --showcase showcase \
  --refresh-inventory \
  --strict-contract-placeholders
```

**Result (2026-05-18):** Exit **0** — `check-visual-catalog OK (91 entries).` No stub-bullet errors under `--strict-contract-placeholders`. Regenerated `visual-inventory.generated.json`, `visual-inventory.generated.md`, `visual-registry-coverage.md`, and `visual-registry.generated.json`.

## Placeholder / banned-language spot check

Manual grep under `docs/design/catalog/**/*.md` for legacy stub lines (`- TBD`, `Auto-stub`, `Expand this stub`, `Stub for KS visual catalog`) returned **no matches** after edits. The word “placeholder” was avoided in normative contract prose (README tooling flags kept as-is).

## Notes

- `Hdc-handbook-chapter.md` purpose/anatomy corrected after bulk generation: **`Hdc`** is forge-autodoc **`assemble_handbook_page`** output, not `generator/pages/handbook-chapter.py`.
- One-shot emitter script was **not** retained in `tools/design-catalog/` (phase-only bootstrap).

## Changelog

- 2026-05-18 — Initial phase evidence.
