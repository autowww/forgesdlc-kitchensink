# Fri — ForgeRecentItems

**Hash:** `Fri` · **Type:** component · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-recent-items.js` (`createRecentItems`). Showcase: `enterprise-app-compositions.html` `#sec-eac-recent`.

## Purpose

Governed enterprise-app surface for **ENT.APP.02**.

## Root element

```html
<div hash="Fri" data-ks-hash="Fri"
     data-ks-type="component" data-ks-name="forge-recent-items">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fri"]` present when composition mounts.
- Related: `DET.APP.WORK_STATE_PERSISTENCE`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.02 | `DET.APP.WORK_STATE_PERSISTENCE` |

Contract: [`enterprise-app/rules/ENT.APP.02.yaml`](../../enterprise-app/rules/ENT.APP.02.yaml).
