# KS UX component rules — master sequence (phase 00)

This file sequences the KS UX component rules governance pack. Source pack requirements live in `ks-ux-component-rules-governor-pack/INITIATING_PROMPT.md` (workspace); execution is from **forgesdlc-kitchensink** root.

## Governance principles (non-negotiable)

1. **Fleet is only a regression example, not a profile**  
   Do not add a Fleet-specific product profile to the UX auditor. `fleet.forgesdlc.com` may appear only as a **generic fixture** for repeatable checks (docs-first shell, dense nav, mechanism-led copy, early technical/API exposure, high context density). The deliverable is **KS-wide** layout/component/page/style/design-rule governance.

2. **Source of truth**  
   Treat these together as the combined truth set (not any single consumer site):

   - **`docs/design/catalog/visual-registry.yaml`** plus generated **`visual-registry.generated.json`**
   - **Design contracts** under `docs/design/catalog/**/*.md` (per-hash and family contracts)
   - **Local or live Kitchen Sink showcase** (`https://ks.forgesdlc.com/showcase/`, or locally built `showcase/` after `python3 generator/build-showcase.py`)
   - **Screenshots** under `docs/design/catalog/screenshots/` and mirrored `showcase/screenshots/`
   - **Emitted DOM**: `hash="XYZ"` and `data-ks-hash="XYZ"` (plus `data-ks-type`, `data-ks-name` where practical) on visual roots

3. **Deterministic vs AI**

   - **Deterministic rules** should cover **most repeatable failures** (density, nav/hero contracts, hash coverage, screenshot/registry consistency, token drift signals, etc.) so routine findings do not require a model.
   - **AI-enabled rules** handle **judgment-heavy** quality (premium enterprise feel, narrative coherence, contract usefulness, “overwhelming despite acceptable counts”) and must **propose candidate deterministic rules** when a failure pattern is repeatable.

4. **Tool boundary**  
   Keep `tools/website-ux-auditor/analyze-website-ux.mjs` and `score-website-ux.mjs` **separate** (no mutual calls). Shared logic may live in `lib/` or `checks/`.

## Inspect before broad edits

Skim or diff these areas before large-scale contract or rule changes:

| Area | Role |
|------|------|
| `docs/design/catalog/visual-registry.yaml` | Hash registry, contract paths, screenshot status |
| `docs/design/catalog/**/*.md` | Per-hash/family contracts, ontology, coverage docs |
| `docs/design/catalog/screenshots/` | Baseline PNGs and capture reports |
| `tools/design-catalog/*` | Catalog check, inventory, screenshot capture, hash allocation |
| `tools/website-ux-auditor/*` | Deterministic checks, scoring, AI batches, remediation plans |
| `components/`, `css/`, `js/` | What actually ships to consumers |
| `generator/pages/` | Showcase / page generation wiring |
| `react/`, `assets/svg/` | React primitives and diagram assets |

## Plan tree (pack documents)

Create or refresh these under `.cursor/plans/ks-ux-component-rules/`:

| Order | File | Focus |
|-------|------|--------|
| 00 | `00-master-sequence.md` (this file) | Sequencing, principles, inspection list |
| 01 | `01-showcase-and-catalog-inventory.md` | Showcase URLs, registry rows, screenshots, inventory scripts |
| 02 | `02-component-design-ruleset-taxonomy.md` | Taxonomy for component/page/layout/style rules |
| 03 | `03-deterministic-rules-and-scripts.md` | Checks, design-catalog scripts, DOM metrics, scorer/analyzer split |
| 04 | `04-ai-enabled-principles-and-prompts.md` | Judgment-only AI tasks; schema (`principleId`, `candidateDeterministicRule`, …) |
| 05 | `05-contract-specificity-and-visual-analysis.md` | Contract sections, weak generic text, family-covered notes |
| 06 | `06-remediation-generator-integration.md` | Plans, loops, dashboard/snapshot tooling |
| 07 | `07-final-qa-and-coverage-report.md` | Acceptance matrix, coverage counts, no-Fleet-profile confirmation |

Downstream docs to add/update under `docs/design/ux-audit/` (per pack) are spelled out in `INITIATING_PROMPT.md`; phases 01–07 should reference them when those files exist.

## Suggested execution order

1. **01** — Baseline inventory (registry + showcase + screenshots); note gaps.  
2. **02** — Lock taxonomy so rules and contracts use the same vocabulary.  
3. **03** — Implement or extend deterministic checks and catalog scripts; add tests/fixtures.  
4. **04** — AI prompts batching + finding schema with `candidateDeterministicRule`.  
5. **05** — Raise contract specificity (no shared generic boilerplate across unrelated hashes).  
6. **06** — Wire remediation / plan generation if needed for new rule IDs.  
7. **07** — Run acceptance commands; record coverage and regressions (including Fleet-as-fixture-only).

**Phase 03 report:** `03-deterministic-rules-and-scripts.md` (deterministic DOM metrics + catalog contract specificity; completed 2026-05-19).

**Phase 04 report:** `04-ai-enabled-principles-and-prompts.md` (canonical `AI.*` principles, finding schema with `candidateDeterministicRule`, manifest/batch `aiReviewContract`, Cursor agent prompt; completed 2026-05-19).

**Phase 06 report:** `06-remediation-generator-integration.md` (defect plans cite hash/contract from DOM metrics + optional `DET.*` / `AI.*` on findings; scorer adds known-hash→contract table; completed 2026-05-19).

## Evidence — phase 00 (orchestrator)

**Completed:** 2026-05-19 (orchestrator pass).

**Inspected (representative):**

- `docs/design/catalog/visual-registry.yaml` — active registry with layout/page/chrome entries, contract paths, showcase URLs.
- `docs/design/catalog/README.md`, `screenshots/README.md` — hash marker conventions and screenshot pipeline.
- `docs/design/catalog/**/*.md` — contracts across `layouts/`, `pages/`, `chrome/`, family docs, `ONTOLOGY.md`, coverage/inventory generated markdown.
- `tools/design-catalog/` — `check-visual-catalog.mjs`, `inventory-ks-visuals.mjs`, `capture-showcase-screenshots.mjs`, `allocate-visual-hash.mjs`, etc. (not only `registry-data.mjs` / `sync-registry-metadata.mjs`).
- `tools/website-ux-auditor/` — `analyze-website-ux.mjs`, `score-website-ux.mjs`, `checks/`, `lib/design-ux-score.js`, `lib/ai-audit-batches.js`, `lib/defect-remediation-plans.js`.
- Implementation surfaces: `components/`, `css/`, `js/`, `generator/pages/`, `react/`, `assets/svg/` present per kitchensink layout (full tree not duplicated here).

**Pack reference:** `INITIATING_PROMPT.md` in `ks-ux-component-rules-governor-pack` defines the required plan tree and acceptance checks.

**Validation (2026-05-19):**

| Command | Result |
|--------|--------|
| `python3 generator/build-showcase.py` (repo root) | Exit **0** — 22 pages + layout previews written to `showcase/`. |
| `npm test` in `tools/website-ux-auditor` | Exit **0** — 89/89 tests pass after fixing `buildWatchFrameLines` call in `auditor-tests/loop-watch-dashboard-frame.test.js` (missing `crawlLogTail` argument had shifted `meta` to the wrong position). |
| `npm install` in `tools/design-catalog` + `node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase` | Exit **0** — `check-visual-catalog OK (91 entries)`; refreshed `docs/design/catalog/visual-registry-coverage.md` and `docs/design/catalog/visual-registry.generated.json`. |

Full acceptance commands (repeat for `07-final-qa-and-coverage-report.md`):

```bash
python3 generator/build-showcase.py
cd tools/website-ux-auditor && npm test
cd tools/design-catalog && npm install && cd ../.. && node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase
```

---

*Next step:* Draft `01-showcase-and-catalog-inventory.md` using live/local showcase and registry counts.
