# Fsd — ForgeSmartDefault

**Hash:** `Fsd` · **Type:** component · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-smart-default.js` (`createSmartDefault`). Showcase: `enterprise-app-compositions.html` `#sec-eac-smart`.

## Purpose

Governed enterprise-app surface for **ENT.APP.07**.

## Root element

```html
<div hash="Fsd" data-ks-hash="Fsd"
     data-ks-type="component" data-ks-name="forge-smart-default">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fsd"]` present when composition mounts.
- Related: `DET.APP.DISABLED_REASON`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.07 | `DET.APP.DISABLED_REASON` |

Contract: [`enterprise-app/rules/ENT.APP.07.yaml`](../../enterprise-app/rules/ENT.APP.07.yaml).
