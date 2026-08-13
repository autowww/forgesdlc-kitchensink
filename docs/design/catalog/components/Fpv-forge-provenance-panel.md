# Fpv — ForgeProvenancePanel

**Hash:** `Fpv` · **Type:** component · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-provenance-panel.js` (`createProvenancePanel`). Showcase: `enterprise-app-compositions.html` `#sec-eac-provenance`.

## Purpose

Governed enterprise-app surface for **ENT.APP.AI**.

## Root element

```html
<div hash="Fpv" data-ks-hash="Fpv"
     data-ks-type="component" data-ks-name="forge-provenance-panel">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fpv"]` present when composition mounts.
- Related: `DET.APP.AI_PROVENANCE`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.AI | `DET.APP.AI_PROVENANCE` |

Contract: [`enterprise-app/rules/ENT.APP.AI.yaml`](../../enterprise-app/rules/ENT.APP.AI.yaml).
