# Frt — ForgeResultReceipt

**Hash:** `Frt` · **Type:** component · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-result-receipt.js` (`createResultReceipt`). Showcase: `enterprise-app-compositions.html` `#sec-eac-result`.

## Purpose

Governed enterprise-app surface for **ENT.APP.03**.

## Root element

```html
<div hash="Frt" data-ks-hash="Frt"
     data-ks-type="component" data-ks-name="forge-result-receipt">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Frt"]` present when composition mounts.
- Related: `DET.APP.TOAST_LIFECYCLE`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.03 | `DET.APP.TOAST_LIFECYCLE` |

Contract: [`enterprise-app/rules/ENT.APP.03.yaml`](../../enterprise-app/rules/ENT.APP.03.yaml).
