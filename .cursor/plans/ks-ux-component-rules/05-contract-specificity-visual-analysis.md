# KS UX component rules — phase 05 (contract specificity + visual analysis)

## Goal

Make catalog contracts **implementation-useful**, not repeating undifferentiated “enterprise atmosphere” prose: concrete expected anatomy, repeatable deterministic gates, judgment-only cues, credible state coverage and responsive hints. Prefer automation for batch sections; tighten hero chrome manually where it materially changes reviewer signal.

## What changed

### `tools/design-catalog/lib/contract-governance-blocks.mjs` (phase baseline)

Registry-aware Markdown for **`## Deterministic checks`** and **`## AI-enabled review cues`**, specialized by **`layout` `source_symbols[0]`** (Python layout entrypoint) or **`chrome-region` `slug`**, plus type-specific bullets for **`page`** and **`layout-preview`**.

### `tools/design-catalog/apply-contract-governance-sections.mjs` (phase baseline)

Inserts governance sections **before `## Forbidden patterns`** when both headings are absent (Stateful types with `contract_status: own` only).

### `tools/design-catalog/lib/contract-element-blurbs.mjs` + `apply-element-specific-blurbs.mjs` (phase 05 completion)

Slug-keyed **Expected look** and **Responsive behavior** bullets for layouts, chrome regions, layout-previews, and museum pages—replacing the former duplicated “Calm Forge enterprise atmosphere…” paragraph and generic Bootstrap responsive slab. Run against **`visual-registry.generated.json`** so contract paths resolve deterministically.

### `tools/design-catalog/lib/contract-specificity.mjs` + `check-visual-catalog.mjs`

- Error on the legacy **Calm Forge atmosphere** slab under **Expected look** for **`layout` / `page` / `chrome-region` / `layout-preview`**.
- Cross-contract clustering: identical normalized **Expected look** bodies (≥90 chars) across those types fail the checker—catches future copy-paste regressions.

### Contracts (bulk)

- **44** own contracts updated via **`apply-element-specific-blurbs.mjs`** (Expected look + Responsive where generic).
- **Manually tightened earlier:** **`Kpn`**, **`Shw`** (masthead / museum shell).
- **Family roll-ups de-genericized:** **`Ksc`**, **`Kpr`**, **`Ksj`**, **`Ksv`**, **`Msm`**—concrete roles layered with **[forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)** linkage, not one-line “Calm Forge enterprise surface”.
- **`docs/design/catalog/primitives/FAM-react-primitives.md`** (`Rpf`): already carried studio-specific Expected look / states (unchanged).

### **`docs/design/catalog/visual-registry.yaml`** (phase baseline)

Extended **Kdt** `source_paths` with **`docs/design/ux-audit/*.md`** so inventory crosswalk stays clean as UX governance docs accumulate.

### **`docs/design/catalog/page-types/Kdt-fam-design-terminology.md`** (phase baseline)

Frontmatter **`source_paths`** plus **Covered children** synced to the **`ux-audit`** bundle.

### **`tools/design-catalog/check-visual-catalog.mjs`** (coverage)

Coverage report (**`visual-registry-coverage.md`**) appends **`## Intentional family-covered rows`** (hash, type, name, contract path, optional parent_hash) for auditors.

### **`docs/design/catalog/README.md`** + **`contract-template.md`** (phase baseline + README bump)

Document **`--strict-contract-governance`**; apply-script commands; extend template with Deterministic / AI headings. README documents **`apply-element-specific-blurbs.mjs`**.

## Checks run

Verified: **2026-05-19** (post slab purge + family tightening).

```bash
cd /home/lzvyahin/Code/forgesdlc-kitchensink
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase --refresh-inventory --strict-contract-governance
```

```bash
bash tools/design-catalog/verify-bad-fixture.sh
```

- Catalog checker: exit **0**, **`--strict-contract-governance`** produced **no warnings** on the real registry.
- Fixture script: exit **0**; underlying checker still exits **1** on **`fixtures/bad-visual-catalog`** (negative path intact).

### Family-covered appendix

Regenerated **`docs/design/catalog/visual-registry-coverage.md`** lists **37** intentional **`family-covered`** rows (`Ksc`, `Ksj`, `Ksv`, **`Kpr`** children, **`FAM-react-primitives`** / **`Rpf`**, diagram groups, **`Msm`** museum deferred assets, …).

## Acceptance mapping

| Criterion | Result |
|-----------|--------|
| Weak-contract detection (`contract-specificity.mjs` + placeholders + duplicate slab) | **Active** (atmosphere substring + cross-file duplicate bodies for stateful types) |
| Checker passes; warnings justified | **`--strict-contract-governance` zero warnings** on KS registry |
| Coverage / report regenerated | **`visual-registry-coverage.md`** + inventory refresh via successful check |
| Remaining intentional family-covered | **Captured in coverage table § Intentional family-covered rows**; family Expected look text **specific** for **`Ksc`/`Kpr`/`Ksj`/`Ksv`/`Msm`/`Rpf`** |

## No Fleet profile

Confirmed unchanged (Fleet remains only generic doc/mechanism example language where referenced elsewhere).

## Follow-ups (optional)

Extend **`contract-element-blurbs.mjs`** when new showcase slugs ship; re-run **`apply-element-specific-blurbs.mjs`** if boilerplate reappears in Expected look sections.
