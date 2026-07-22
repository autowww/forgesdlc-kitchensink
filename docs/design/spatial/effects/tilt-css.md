# CSS-only tilt (`Tlz`)

**Hash:** `Tlz` · **Slug:** `tilt-css` · **Showcase:** `#sec-tilt-css`

Emitter: `components/spatial.py::render_tilt_css_card` · CSS root: `.ks-tilt--css`

## Purpose

Nine-zone pointer tilt without JavaScript via sibling selectors.

## Expected behavior

Forge card inner surface tilts subtly when a zone radio is selected.

## States

Neutral center; zone selection applies rotateX/Y on inner card.

## Oracle scenarios

`tlz-dom-present`, `tlz-zone-select`

Machine oracle: [`../oracles/Tlz.json`](../oracles/Tlz.json) · Contract: [`../../catalog/components/Tlz-tilt-css.md`](../../catalog/components/Tlz-tilt-css.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Tlz"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
