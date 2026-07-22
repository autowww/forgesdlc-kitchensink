# Fch — Flip choice

**Hash:** `Fch` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_flip_choice` · Showcase anchor: `#sec-flip-choice`

## Purpose

Radio choice tiles that flip on selection.

## Expected look

Square choice pieces; selected piece rotatesY 180deg.

## States

Unselected flat; selected flipped.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Fch.json`):

- **fch-dom-present** — root `[data-ks-hash="Fch"]` visible; threshold 1.0 after scenario actions.
- **fch-select-alt** — root `[data-ks-hash="Fch"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-choice--flip -->
<div class="ks-choice--flip" hash="Fch" data-ks-hash="Fch"
     data-ks-type="component" data-ks-name="flip-choice">
```
