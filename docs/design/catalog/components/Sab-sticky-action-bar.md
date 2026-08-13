# Sab — Sticky Action Bar

**Hash:** `Sab` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_sticky_action_bar` · Showcase: `controls.html` `#sec-sticky-action-bar`

## Purpose

Governed nav-layout primitive: sticky action bar.

## Expected look

See showcase section `#sec-sticky-action-bar` on `controls.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Sab.json`):

- **sab-dom-present** — root `[data-ks-hash="Sab"]` visible; threshold 1.0 after scenario actions.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Bulk actions after row selection with visible count | ENT.APP.05, ENT.APP.08 | `DET.APP.BULK_ACTION_SCOPE`, `AI.APP.WORKFLOW_CONTINUITY` |
| Contextual next step when checkboxes present | ENT.APP.08 | `DET.BUTTON.GROUP.MAX` |

Contract: [`enterprise-app/rules/ENT.APP.05.yaml`](../../enterprise-app/rules/ENT.APP.05.yaml).

## Root element

```html
<div class="ks-nav--sticky-action-bar" hash="Sab" data-ks-hash="Sab"
     data-ks-type="component" data-ks-name="sticky-action-bar">
```
