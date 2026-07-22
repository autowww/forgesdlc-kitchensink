# Stc — Scroll Spy Toc

**Hash:** `Stc` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_scroll_spy_toc` · Showcase: `navigation.html` `#sec-scroll-spy-toc`

## Purpose

Governed nav-layout primitive: scroll spy toc.

## Expected look

See showcase section `#sec-scroll-spy-toc` on `navigation.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Stc.json`):

- **stc-dom-present** — root `[data-ks-hash="Stc"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--scroll-spy-toc" hash="Stc" data-ks-hash="Stc"
     data-ks-type="component" data-ks-name="scroll-spy-toc">
```
