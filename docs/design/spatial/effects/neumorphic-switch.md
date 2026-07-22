# Neumorphic switch (`Nsw`)

**Hash:** `Nsw` · **Slug:** `neumorphic-switch` · **Showcase:** `#sec-neumorphic-switch`

Emitter: `components/spatial.py::render_volumetric_switch(tactile=True)` · CSS root: `.ks-switch--tactile`

## Purpose

Recessed neumorphic variant of the volumetric switch.

## Expected behavior

Soft inset track; thumb sits in carved groove.

## States

Off/on thumb positions with tactile shadows.

## Oracle scenarios

`nsw-dom-present`, `nsw-toggle-on`

Machine oracle: [`../oracles/Nsw.json`](../oracles/Nsw.json) · Contract: [`../../catalog/components/Nsw-neumorphic-switch.md`](../../catalog/components/Nsw-neumorphic-switch.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Nsw"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
