# Tab Swimlane Sync (`Tsw`)

**Hash:** `Tsw` · **Slug:** `tab-swimlane-sync` · **Showcase:** `navigation.html` `#sec-tab-swimlane-sync`

Emitter: `components/nav_layout.py::render_tab_swimlane_sync` · CSS root: `.ks-nav--tab-swimlane-sync`

## Purpose

Governed nav-layout primitive: tab swimlane sync.

## Expected behavior

See showcase section `#sec-tab-swimlane-sync` on `navigation.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`tss-dom-present`

Machine oracle: [`../oracles/Tsw.json`](../oracles/Tsw.json) · Contract: [`../../catalog/components/Tsw-tab-swimlane-sync.md`](../../catalog/components/Tsw-tab-swimlane-sync.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Tsw"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
