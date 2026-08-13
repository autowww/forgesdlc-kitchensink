# Fpw — ForgePersistentWorkspace

**Hash:** `Fpw` · **Type:** composition · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-persistent-workspace.js` (`createPersistentWorkspace`). Showcase: `enterprise-app-compositions.html` `#sec-eac-persistent`.

## Purpose

Governed enterprise-app surface for **ENT.APP.02**.

## Root element

```html
<div hash="Fpw" data-ks-hash="Fpw"
     data-ks-type="composition" data-ks-name="forge-persistent-workspace">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fpw"]` present when composition mounts.
- Related: `DET.APP.WORK_STATE_PERSISTENCE`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.02 | `DET.APP.WORK_STATE_PERSISTENCE` |

Contract: [`enterprise-app/rules/ENT.APP.02.yaml`](../../enterprise-app/rules/ENT.APP.02.yaml).
