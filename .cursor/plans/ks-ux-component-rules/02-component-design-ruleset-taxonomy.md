# Phase 02 — Component design ruleset taxonomy

**Completed:** 2026-05-19 (forgesdlc-kitchensink repo root).

**Governance:** No Fleet-specific UX profile or checklist fork was added. Fleet remains only a generic regression example per workspace rules.

## Deliverables (this phase)

| Artifact | Path |
|----------|------|
| UX audit doc index | `docs/design/ux-audit/README.md` |
| Deterministic rule catalog (`DET.*`) | `docs/design/ux-audit/deterministic-design-rules.md` |
| AI-enabled principle catalog (`AI.*`) | `docs/design/ux-audit/ai-enabled-design-principles.md` |
| Level ↔ rule crosswalk | `docs/design/ux-audit/element-level-ruleset-matrix.md` |
| Per-level taxonomy (purpose, role, checks, AI, forbidden, contract fields) | `docs/design/ux-audit/component-design-ruleset-taxonomy.md` |
| Industry-aligned checklist mapped to IDs | `docs/design/ux-audit/industry-standard-page-quality.md` |

## Taxonomy coverage

The taxonomy defines rules for:

- Page types  
- Layouts  
- Chrome regions  
- Content sections  
- Cards & surfaces  
- Navigation components  
- CTA / button groups  
- Data / chart components  
- Diagram / visual systems  
- Motion / ambient layers  
- Desktop / app interfaces  
- React primitives  
- Python-generated HTML modules  
- Visual styles / theme packs  
- Interaction scripts  

## Acceptance checklist

| Criterion | Status |
|-----------|--------|
| Docs exist under `docs/design/ux-audit/` | Yes |
| Deterministic vs AI-enabled explicitly split (`DET.*` vs `AI.*`) | Yes |
| Rule IDs are stable strings scripts can reference | Yes |
| No Fleet-specific doc/profile | Yes |

## Evidence — validation (2026-05-19)

Commands run from repo root after doc authoring:

| Command | Result |
|---------|--------|
| `python3 generator/build-showcase.py` | Exit **0** |
| `cd tools/website-ux-auditor && npm test` | Exit **0** — **91/91** tests pass |
| `cd tools/design-catalog && npm install && cd ../.. && node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase` | Exit **0** — `check-visual-catalog OK (91 entries)`; refreshed `docs/design/catalog/visual-registry-coverage.md` |

## Notes for downstream phases

- **Phase 03** — Wire selected `DET.*` IDs into `analyze-website-ux.mjs` / `score-website-ux.mjs` without merging the two tools.  
- **Phase 04** — Ensure AI finding schema references `principleId` (`AI.*`) and `candidateDeterministicRule` (`DET.*`).  
- **Phase 05** — Raise contract specificity to satisfy `DET.CATALOG.CONTRACT_SPECIFICITY` for high fan-out families (`Kpr`, `Rpf`, etc., per phase 01).

---

*Next step:* Draft `03-deterministic-rules-and-scripts.md` (checks, catalog scripts, DOM metrics).
