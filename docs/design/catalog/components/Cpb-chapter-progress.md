# Cpb — Chapter Progress

**Hash:** `Cpb` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_chapter_progress` · Showcase: `layout-shells.html` `#sec-chapter-progress`

## Purpose

Governed nav-layout primitive: chapter progress.

## Expected look

See showcase section `#sec-chapter-progress` on `layout-shells.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Cpb.json`):

- **cpb-dom-present** — root `[data-ks-hash="Cpb"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--chapter-progress" hash="Cpb" data-ks-hash="Cpb"
     data-ks-type="component" data-ks-name="chapter-progress">
```
