# Flip choice (`Fch`)

**Hash:** `Fch` · **Slug:** `flip-choice` · **Showcase:** `#sec-flip-choice`

Emitter: `components/spatial.py::render_flip_choice` · CSS root: `.ks-choice--flip`

## Purpose

Radio choice tiles that flip on selection.

## Expected behavior

Square choice pieces; selected piece rotatesY 180deg.

## States

Unselected flat; selected flipped.

## Oracle scenarios

`fch-dom-present`, `fch-select-alt`

Machine oracle: [`../oracles/Fch.json`](../oracles/Fch.json) · Contract: [`../../catalog/components/Fch-flip-choice.md`](../../catalog/components/Fch-flip-choice.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Fch"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
