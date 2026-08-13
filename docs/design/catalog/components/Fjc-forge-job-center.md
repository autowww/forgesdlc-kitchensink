# Fjc — ForgeJobCenter

**Hash:** `Fjc` · **Type:** composition · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-job-center.js` (`createJobCenter`). Showcase: `enterprise-app-compositions.html` `#sec-eac-job`.

## Purpose

Governed enterprise-app surface for **ENT.APP.03**.

## Root element

```html
<div hash="Fjc" data-ks-hash="Fjc"
     data-ks-type="composition" data-ks-name="forge-job-center">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fjc"]` present when composition mounts.
- Related: `DET.APP.DATA_REFRESH_STALENESS`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.03 | `DET.APP.DATA_REFRESH_STALENESS` |

Contract: [`enterprise-app/rules/ENT.APP.03.yaml`](../../enterprise-app/rules/ENT.APP.03.yaml).
