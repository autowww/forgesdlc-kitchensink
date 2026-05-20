The phase verification failed or was inconclusive. Complete only the missing work for this phase. Do not redo completed work. Rerun relevant checks and update the phase evidence file.

--- PHASE PROMPT START ---
# 05 — Contract specificity and visual analysis

Goal: make catalog contracts genuinely useful for each emitted visual element.

For each registry row and contract:

1. Use screenshot/DOM/source analysis to determine the visual role.
2. Replace generic expected-look text with specific guidance.
3. Add deterministic checks section.
4. Add AI-enabled review cues section.
5. Add state coverage appropriate to the element.
6. Add responsive behavior specific to the element.
7. Keep family-covered rows only when a family contract is specific and useful.

Prioritize:

- pages and layouts that consumers use directly;
- chrome regions;
- React primitives;
- Python component modules;
- visual styles/theme packs;
- diagram groups;
- desktop/app interfaces.

Do not manually over-edit every file if automation can generate draft-specific sections from registry/source/screenshot metadata. But do not leave obviously generic boilerplate.

Acceptance:
- `tools/design-catalog/check-visual-catalog.mjs` detects weak contracts;
- current contracts pass or report only justified warnings;
- `docs/design/catalog/visual-registry-coverage.md` or equivalent report is regenerated;
- final report lists remaining intentionally family-covered entries.
--- PHASE PROMPT END ---

--- VERIFY LOG START ---
VERDICT: FAIL

### Evidence (what matches the execution log)

- **`check-visual-catalog.mjs`** imports **`analyzeContractSpecificity`** from **`contract-specificity.mjs`** and exposes **`--strict-contract-governance`** (`check-visual-catalog.mjs` around the import/use at lines 26 and 366).
- **Weak-contract logic** exists for thin/generic **Expected look**, **States** bullets, and governance headings (`tools/design-catalog/lib/contract-specificity.mjs`).
- **`docs/design/catalog/visual-registry-coverage.md`** is regenerated-style output (timestamp in header) and includes **`## Intentional family-covered rows`** with a **37-row** table, aligned with **`By contract_status` → family-covered: 37** (`visual-registry-coverage.md` lines 56–107).
- **Automation artifacts** are present: `tools/design-catalog/lib/contract-governance-blocks.mjs`, `tools/design-catalog/apply-contract-governance-sections.mjs`.
- **Governance sections** appear on multiple contracts (e.g. **`## Deterministic checks`** / **`## AI-enabled review cues`** under `docs/design/catalog/chrome/` and `pages/`).
- **Focused rewrites** are real for **`Kpn`** (element-specific masthead/copy) and **`Shw`** (museum showcase framing) vs generic slab — see e.g. `Kpn-product-primary-nav.md` lines 29–33 and `Shw-layout-showcase.md` lines 29–32.
- **`Kdt`** / UX-audit wiring is in **`visual-registry.yaml`** (`docs/design/ux-audit/*.md` under the `Kdt` entry).
- **Phase note** aligns with repo: `.cursor/plans/ks-ux-component-rules/05-contract-specificity-visual-analysis.md` documents the same work and admits **Expected look** follow-up.

### Missing / gaps vs the phase prompt

- **“Replace generic expected-look text with specific guidance”** and **“do not leave obviously generic boilerplate”** are **not** satisfied broadly: dozens of **`page`** and several **`chrome-region`** contracts still share the **same** “Calm Forge enterprise atmosphere…” **Expected look** paragraph (grep shows it across previews, handbook chapter, breadcrumbs, TOC sidebar, footer, offcanvas, doc sidebar, and many layouts/pages—**not** the tightened **`Kpn`/`Shw`** pattern).
- **Per-element responsive behavior** largely remains **shared Bootstrap/generic** prose on those same contracts versus chrome/page-specific breakpoints/anatomy wherever the duplicated slab remains.
- **Weak-contract detection** does **not** flag that repeated Forge slab (`contract-specificity.mjs` targets other generic phrases/word-count heuristics, not this duplicate).
- **`strict-contract-governance` exit 0** is **claimed** in the log/plan but was **not re-run here** (Ask mode: no shell execution); treat as **unverified** in this verification pass.

### Exact next actions

1. **Re-run locally** from repo root (to confirm CI parity):  
   `node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase --refresh-inventory --strict-contract-governance`  
   and **`bash tools/design-catalog/verify-bad-fixture.sh`**; ensure exit **0** / capture any warnings.
2. **Extend `contract-specificity.mjs`** (and/or **`contract-governance-blocks`**) to detect **near-duplicate Expected look** across contracts (minimum: the shared Calm Forge paragraph hash or substring + length/WC thresholds for `page` / `chrome-region`).
3. **Batch replace or generate** element-specific **Expected look** (+ **Responsive behavior** where generic) for the remaining slabs—same approach as **`Kpn`/`Shw`**, or scripted variants keyed by **`source_symbols`**, **`slug`**, **`root_selector`**, hash.
4. **Reconcile family contracts** (**`FAM-react-primitives`**, **`Ksc`/`Ksj`/`Ksv`/`Kpr`**, etc.) with the phase rule **“Keep family-covered rows only when a family contract is specific and useful”**—audit those `.md` files for concrete anatomy/states/responsive notes, not roll-up fluff.
5. **Regenerate** **`visual-registry-coverage.md`** after contract edits so timestamps and appendix stay authoritative.

Until the duplicated **Expected look** backlog is cleared or intentionally justified per hash with stronger tooling, the **substance** of phase **05** (catalogs **genuinely useful per emitted visual**) remains **open** despite strong progress on governance sections and coverage reporting—hence **FAIL**.
--- VERIFY LOG END ---
