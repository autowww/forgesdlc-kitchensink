# Display depth (`Dpt`)

**Hash:** `Dpt` · **Slug:** `display-depth` · **Showcase:** `#sec-display-depth`

Emitter: `components/spatial.py::render_display_depth` · CSS root: `.ks-display--depth`

## Purpose

Lift display typography with perspective and translateZ.

## Expected behavior

Headline text extruded above section plane with subtle shadow stack.

## States

Static volumetric headline.

## Oracle scenarios

`dpt-dom-present`, `dpt-spiral-variant`

Machine oracle: [`../oracles/Dpt.json`](../oracles/Dpt.json) · Contract: [`../../catalog/components/Dpt-display-depth.md`](../../catalog/components/Dpt-display-depth.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Dpt"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
