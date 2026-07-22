# Tactile range (`Rng`)

**Hash:** `Rng` · **Slug:** `tactile-range` · **Showcase:** `#sec-tactile-range`

Emitter: `components/spatial.py::render_tactile_range` · CSS root: `.ks-range--tactile`

## Purpose

Native range input with recessed track and glassy thumb.

## Expected behavior

Horizontal slider with neumorphic track and spherical thumb.

## States

Value drag updates thumb position along track.

## Oracle scenarios

`rng-dom-present`, `rng-value-change`

Machine oracle: [`../oracles/Rng.json`](../oracles/Rng.json) · Contract: [`../../catalog/components/Rng-tactile-range.md`](../../catalog/components/Rng-tactile-range.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Rng"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
