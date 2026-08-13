# Faw — ForgeAdaptiveWorkspace

**Hash:** `Faw` · **Type:** composition · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-adaptive-workspace.js` (`createAdaptiveWorkspace`). Showcase: `enterprise-app-compositions.html` `#sec-eac-adaptive`.

## Purpose

Governed enterprise-app surface for **ENT.APP.07**.

## Root element

```html
<div hash="Faw" data-ks-hash="Faw"
     data-ks-type="composition" data-ks-name="forge-adaptive-workspace">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Faw"]` present when composition mounts.
- Related: `DET.APP.PRIMARY_CTA`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.07 | `DET.APP.PRIMARY_CTA` |

Contract: [`enterprise-app/rules/ENT.APP.07.yaml`](../../enterprise-app/rules/ENT.APP.07.yaml).
