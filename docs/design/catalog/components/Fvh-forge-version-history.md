# Fvh — ForgeVersionHistory

**Hash:** `Fvh` · **Type:** component · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-version-history.js` (`createVersionHistory`). Showcase: `enterprise-app-compositions.html` `#sec-eac-version`.

## Purpose

Governed enterprise-app surface for **ENT.APP.04**.

## Root element

```html
<div hash="Fvh" data-ks-hash="Fvh"
     data-ks-type="component" data-ks-name="forge-version-history">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fvh"]` present when composition mounts.
- Related: `DET.APP.WORK_STATE_PERSISTENCE`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.04 | `DET.APP.WORK_STATE_PERSISTENCE` |

Contract: [`enterprise-app/rules/ENT.APP.04.yaml`](../../enterprise-app/rules/ENT.APP.04.yaml).
