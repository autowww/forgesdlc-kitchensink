# Fct — ForgeCommentThread

**Hash:** `Fct` · **Type:** component · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-comment-thread.js` (`createCommentThread`). Showcase: `enterprise-app-compositions.html` `#sec-eac-comment`.

## Purpose

Governed enterprise-app surface for **ENT.APP.08**.

## Root element

```html
<div hash="Fct" data-ks-hash="Fct"
     data-ks-type="component" data-ks-name="forge-comment-thread">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fct"]` present when composition mounts.
- Related: `AI.APP.WORKFLOW_CONTINUITY`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.08 | `AI.APP.WORKFLOW_CONTINUITY` |

Contract: [`enterprise-app/rules/ENT.APP.08.yaml`](../../enterprise-app/rules/ENT.APP.08.yaml).
