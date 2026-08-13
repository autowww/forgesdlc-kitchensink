# Fwm — ForgeWorkflowMetrics

**Hash:** `Fwm` · **Type:** composition · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-workflow-metrics.js` (`createWorkflowMetrics`). Showcase: `enterprise-app-compositions.html` `#sec-eac-workflow`.

## Purpose

Governed enterprise-app surface for **ENT.APP.10**.

## Root element

```html
<div hash="Fwm" data-ks-hash="Fwm"
     data-ks-type="composition" data-ks-name="forge-workflow-metrics">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fwm"]` present when composition mounts.
- Related: `DET.APP.TILE_AFFORDANCE`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.10 | `DET.APP.TILE_AFFORDANCE` |

Contract: [`enterprise-app/rules/ENT.APP.10.yaml`](../../enterprise-app/rules/ENT.APP.10.yaml).
