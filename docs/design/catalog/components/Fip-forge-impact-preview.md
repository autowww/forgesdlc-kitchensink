# Fip — ForgeImpactPreview

**Hash:** `Fip` · **Type:** composition · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-impact-preview.js` (`createImpactPreview`). Showcase: `enterprise-app-compositions.html` `#sec-eac-impact`.

## Purpose

Governed enterprise-app surface for **ENT.APP.04**.

## Root element

```html
<div hash="Fip" data-ks-hash="Fip"
     data-ks-type="composition" data-ks-name="forge-impact-preview">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fip"]` present when composition mounts.
- Related: `DET.APP.MODAL_DISMISSAL_GUARD`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.04 | `DET.APP.MODAL_DISMISSAL_GUARD` |

Contract: [`enterprise-app/rules/ENT.APP.04.yaml`](../../enterprise-app/rules/ENT.APP.04.yaml).
