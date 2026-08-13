# Fsr — ForgeShortcutRegistry

**Hash:** `Fsr` · **Type:** component · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-shortcut-registry.js` (`createShortcutRegistry`). Showcase: `enterprise-app-compositions.html` `#sec-eac-shortcut`.

## Purpose

Governed enterprise-app surface for **ENT.APP.07**.

## Root element

```html
<div hash="Fsr" data-ks-hash="Fsr"
     data-ks-type="component" data-ks-name="forge-shortcut-registry">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fsr"]` present when composition mounts.
- Related: `DET.APP.CONTROL_A11Y`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.07 | `DET.APP.CONTROL_A11Y` |

Contract: [`enterprise-app/rules/ENT.APP.07.yaml`](../../enterprise-app/rules/ENT.APP.07.yaml).
