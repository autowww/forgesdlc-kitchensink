---
rule_id: DET.STUDIO.HASH
lane: deterministic
title: Studio KS hash markers
summary: Governed Studio surfaces emit data-ks-hash on visual roots for catalog and regression traceability.
page_version: e6c019f41fd50037fc287030f3204ebef8a0026352f1fa3a0f11cf9146539a7f
generated_at: 2026-08-13T00:00:00.000Z
registry_status: documented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-studio-hash
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
---

## Purpose

Studio pages that ship KS layouts or wrappers should expose at least one **`data-ks-hash`** (and mirrored `hash` when static HTML) so visual catalog governance and parity checks can attribute defects to contracts.

## Passing signals

- `main` or shell regions include `data-ks-hash` with registry-backed three-letter id.
- React primitives use `ksReactPrimitiveAttrs()`.

## Failing signals

- Bare Vite markup with zero KS hashes on a page that claims KS reuse.

## Before example

```html
<main class="fc-main"><h1>Analysis</h1></main>
```

## After example

```html
<main class="fc-main" hash="Anl" data-ks-hash="Anl" data-ks-type="desktop-interface" data-ks-name="analysis-workspace">
  <h1>Analysis</h1>
</main>
```

## Evidence and remediation

- `page.json.ks_hash_count` from `capture-page.mjs`.
- Update `visual-registry.yaml` when adding new roots.

## Related rules

- `DET.HASH.MARKERS`
- `DET.APP.PRIMITIVE_MARKERS`
