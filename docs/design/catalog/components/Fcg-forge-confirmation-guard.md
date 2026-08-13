# Fcg — ForgeConfirmationGuard

**Hash:** `Fcg` · **Type:** component · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-confirmation-guard.js` (`createConfirmationGuard`). Showcase: `enterprise-app-compositions.html` `#sec-eac-confirmation`.

## Purpose

Governed enterprise-app surface for **ENT.APP.04**.

## Root element

```html
<div hash="Fcg" data-ks-hash="Fcg"
     data-ks-type="component" data-ks-name="forge-confirmation-guard">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fcg"]` present when composition mounts.
- Related: `DET.APP.MODAL_DISMISSAL_GUARD`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.04 | `DET.APP.MODAL_DISMISSAL_GUARD` |

Contract: [`enterprise-app/rules/ENT.APP.04.yaml`](../../enterprise-app/rules/ENT.APP.04.yaml).
