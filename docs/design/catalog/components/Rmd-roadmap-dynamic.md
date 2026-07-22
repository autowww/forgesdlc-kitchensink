# Rmd — Roadmap dynamic

**Hash:** `Rmd` · **Type:** component · **Family:** roadmap · **Status:** active

Source: `components/roadmap.py::render_roadmap_dynamic` · Showcase: `nested-roadmap.html` `#sec-roadmap-dynamic`

## Purpose

Interactive nested drill-down swimlane grid with modal preview, tooltips, and breadcrumb navigation.

## Backward compatibility

`render_nested_roadmap()` delegates to this tier. Uses existing `nested-roadmap.css` and `ks-roadmap.js`.

## Root element

```html
<div class="ks-nested-roadmap ks-roadmap ks-roadmap--dynamic" data-ks-roadmap="1"
     hash="Rmd" data-ks-hash="Rmd" data-ks-type="component" data-ks-name="roadmap-dynamic">
```
