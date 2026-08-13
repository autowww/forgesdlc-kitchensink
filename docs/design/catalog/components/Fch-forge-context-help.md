# Fch — ForgeContextHelp

**Hash:** `Fch` · **Type:** component · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-context-help.js` (`createContextHelp`). Showcase: `enterprise-app-compositions.html` `#sec-eac-context`.

## Purpose

Governed enterprise-app surface for **ENT.APP.07**.

## Root element

```html
<div hash="Fch" data-ks-hash="Fch"
     data-ks-type="component" data-ks-name="forge-context-help">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fch"]` present when composition mounts.
- Related: `DET.APP.PRIMARY_CTA`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.07 | `DET.APP.PRIMARY_CTA` |

Contract: [`enterprise-app/rules/ENT.APP.07.yaml`](../../enterprise-app/rules/ENT.APP.07.yaml).
