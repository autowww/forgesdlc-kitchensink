# View Transition Hero (`Vth`)

**Hash:** `Vth` · **Slug:** `view-transition-hero` · **Showcase:** `overlays-transitions.html` `#sec-view-transition-hero`

Emitter: `components/nav_layout.py::render_view_transition_hero` · CSS root: `.ks-nav--view-transition-hero`

## Purpose

Governed nav-layout primitive: view transition hero.

## Expected behavior

See showcase section `#sec-view-transition-hero` on `overlays-transitions.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`vth-dom-present`

Machine oracle: [`../oracles/Vth.json`](../oracles/Vth.json) · Contract: [`../../catalog/components/Vth-view-transition-hero.md`](../../catalog/components/Vth-view-transition-hero.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Vth"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
