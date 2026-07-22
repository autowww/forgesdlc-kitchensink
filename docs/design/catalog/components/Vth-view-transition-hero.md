# Vth — View Transition Hero

**Hash:** `Vth` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_view_transition_hero` · Showcase: `overlays-transitions.html` `#sec-view-transition-hero`

## Purpose

Governed nav-layout primitive: view transition hero.

## Expected look

See showcase section `#sec-view-transition-hero` on `overlays-transitions.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Vth.json`):

- **vth-dom-present** — root `[data-ks-hash="Vth"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--view-transition-hero" hash="Vth" data-ks-hash="Vth"
     data-ks-type="component" data-ks-name="view-transition-hero">
```
