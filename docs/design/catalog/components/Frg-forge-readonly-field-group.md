# Frg — ForgeReadOnlyFieldGroup

**Hash:** `Frg` · **Type:** component · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-readonly-field-group.js` (`createReadOnlyFieldGroup`). Showcase: `enterprise-app-compositions.html` `#sec-eac-readonly`.

## Purpose

Governed enterprise-app surface for **ENT.APP.06**.

## Root element

```html
<div hash="Frg" data-ks-hash="Frg"
     data-ks-type="component" data-ks-name="forge-readonly-field-group">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Frg"]` present when composition mounts.
- Related: `DET.APP.DISABLED_REASON`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.06 | `DET.APP.DISABLED_REASON` |

Contract: [`enterprise-app/rules/ENT.APP.06.yaml`](../../enterprise-app/rules/ENT.APP.06.yaml).
