# Volumetric switch (`Vsw`)

**Hash:** `Vsw` · **Slug:** `volumetric-switch` · **Showcase:** `#sec-volumetric-switch`

Emitter: `components/spatial.py::render_volumetric_switch` · CSS root: `.ks-switch--volumetric`

## Purpose

Toggle with physical thumb translation on Z and X.

## Expected behavior

Recessed track; cyan fill when on; thumb lifts on translateZ.

## States

Off (thumb left); on (thumb right, track filled).

## Oracle scenarios

`vsw-dom-present`, `vsw-toggle-on`

Machine oracle: [`../oracles/Vsw.json`](../oracles/Vsw.json) · Contract: [`../../catalog/components/Vsw-volumetric-switch.md`](../../catalog/components/Vsw-volumetric-switch.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Vsw"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
