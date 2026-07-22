# Split Pane Resizer (`Spr`)

**Hash:** `Spr` · **Slug:** `split-pane-resizer` · **Showcase:** `layout-shells.html` `#sec-split-pane-resizer`

Emitter: `components/nav_layout.py::render_split_pane_resizer` · CSS root: `.ks-nav--split-pane-resizer`

## Purpose

Governed nav-layout primitive: split pane resizer.

## Expected behavior

See showcase section `#sec-split-pane-resizer` on `layout-shells.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`spr-dom-present`

Machine oracle: [`../oracles/Spr.json`](../oracles/Spr.json) · Contract: [`../../catalog/components/Spr-split-pane-resizer.md`](../../catalog/components/Spr-split-pane-resizer.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Spr"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
