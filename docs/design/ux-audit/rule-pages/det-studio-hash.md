---
rule_id: DET.STUDIO.HASH
lane: deterministic
title: Studio KS hash markers
summary: Governed Studio surfaces emit data-ks-hash on visual roots for catalog and regression traceability.
page_version: df3197008328d726b1c6bec9e811599d2e98be5126f0ec3bead162cbb3189f8e
generated_at: 2026-08-13T00:00:00.000Z
registry_status: documented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-studio-hash
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
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
