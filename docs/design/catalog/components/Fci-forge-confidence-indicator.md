# Fci — ForgeConfidenceIndicator

**Hash:** `Fci` · **Type:** component · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-confidence-indicator.js` (`createConfidenceIndicator`). Showcase: `enterprise-app-compositions.html` `#sec-eac-confidence`.

## Purpose

Governed enterprise-app surface for **ENT.APP.AI**.

## Root element

```html
<div hash="Fci" data-ks-hash="Fci"
     data-ks-type="component" data-ks-name="forge-confidence-indicator">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fci"]` present when composition mounts.
- Related: `DET.APP.AI_PROVENANCE`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.AI | `DET.APP.AI_PROVENANCE` |

Contract: [`enterprise-app/rules/ENT.APP.AI.yaml`](../../enterprise-app/rules/ENT.APP.AI.yaml).
