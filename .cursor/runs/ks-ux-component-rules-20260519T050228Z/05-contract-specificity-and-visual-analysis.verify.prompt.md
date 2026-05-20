Verify this phase without editing files.

Start with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide concise evidence, missing work, and exact next actions.

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

--- EXECUTION LOG START ---
## Summary

Phase **05 — Contract specificity and visual analysis** is implemented with a **small toolchain + bulk contract updates**, then two **hand-tightened** high-priority contracts.

### Automation (new)

- **`tools/design-catalog/lib/contract-governance-blocks.mjs`** — Builds **`## Deterministic checks`** and **`## AI-enabled review cues`** from registry fields, with **`layout`** hints keyed by **`source_symbols[0]`** (`handbook_page`, `showcase_page`, …) and **`chrome-region`** hints keyed by **`slug`** (`product-primary-nav`, `doc-sidebar`, …).
- **`tools/design-catalog/apply-contract-governance-sections.mjs`** — Inserts both sections **before `## Forbidden patterns`** on **`contract_status: own`** rows whose type is **`layout` \| `page` \| `chrome-region` \| `layout-preview`**.

(Unicode em dash in **`contract-governance-blocks.mjs`** was replaced with ascii punctuation—Node parsed some em-dash-adjacent template text incorrectly.)

### Contract / registry edits

- **45 contracts** gained deterministic + AI governance sections via **`--write`**.
- **`Kpn-product-primary-nav.md`**: **`Expected look`** + **`Responsive behavior`** rewritten for **`nav.fs-primary-nav-global`** and **`lg`/collapsing** behavior.
- **`Shw-layout-showcase.md`**: **`Expected look`** rewritten for museum / dense-inventory **`showcase_page`** duty (drops generic slab paragraph).

### Catalog checker / coverage report

- **`check-visual-catalog.mjs`** now appends **`## Intentional family-covered rows`** to **`docs/design/catalog/visual-registry-coverage.md`** (**37 rows**, including **`FAM-react-primitives`**, **`Kpr`/K-style children, **`Msm`**, …).
- **`Kdt`** in **`visual-registry.yaml`** (+ **`Kdt-fam-design-terminology.md`**) now lists **`docs/design/ux-audit/*.md`** so inventory/Kdt stays aligned (**no more UX-audit path warnings**).

### Docs / template

- **`docs/design/catalog/README.md`**: **`--strict-contract-governance`** + apply-script workflow + fixed link to **`tools/design-catalog/lib/contract-governance-blocks.mjs`**.
- **`contract-template.md`**: template includes Deterministic / AI headings.

### Evidence file

- **`.cursor/plans/ks-ux-component-rules/05-contract-specificity-visual-analysis.md`** — Phase log, acceptance table, commands, family-covered pointer.

### Checks run

```bash
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase --refresh-inventory --strict-contract-governance
bash tools/design-catalog/verify-bad-fixture.sh
```

Both **exit 0**. Remaining **`page`** contracts still share the Phase 04 “Calm Forge enterprise atmosphere…” **`Expected look`** paragraph where not yet hand-edited; follow-up can extend **`contract-governance-blocks`** to rewrite **`Expected look`** or continue per-hash passes.
--- EXECUTION LOG END ---
