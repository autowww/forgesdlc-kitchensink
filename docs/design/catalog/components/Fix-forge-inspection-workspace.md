# Fix — ForgeInspectionWorkspace

**Hash:** `Fix` · **Type:** composition · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-inspection-workspace.js` (`createInspectionWorkspace`). Showcase: `enterprise-app-compositions.html` `#sec-eac-inspection`.

## Purpose

Governed enterprise-app surface for **ENT.APP.08**.

## Root element

```html
<div hash="Fix" data-ks-hash="Fix"
     data-ks-type="composition" data-ks-name="forge-inspection-workspace">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fix"]` present when composition mounts.
- Related: `AI.APP.WORKFLOW_CONTINUITY`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.08 | `AI.APP.WORKFLOW_CONTINUITY` |

Contract: [`enterprise-app/rules/ENT.APP.08.yaml`](../../enterprise-app/rules/ENT.APP.08.yaml).
