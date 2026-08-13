# Fac — ForgeAssignmentControl

**Hash:** `Fac` · **Type:** component · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-assignment-control.js` (`createAssignmentControl`). Showcase: `enterprise-app-compositions.html` `#sec-eac-assignment`.

## Purpose

Governed enterprise-app surface for **ENT.APP.08**.

## Root element

```html
<div hash="Fac" data-ks-hash="Fac"
     data-ks-type="component" data-ks-name="forge-assignment-control">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fac"]` present when composition mounts.
- Related: `DET.APP.BULK_ACTION_SCOPE`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.08 | `DET.APP.BULK_ACTION_SCOPE` |

Contract: [`enterprise-app/rules/ENT.APP.08.yaml`](../../enterprise-app/rules/ENT.APP.08.yaml).
