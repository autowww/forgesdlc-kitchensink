# Mms — Mind-map static

**Hash:** `Mms` · **Type:** component · **Family:** mindmap · **Status:** active

Source: `components/mindmap.py::render_mindmap_static` · Showcase: `ks-creation-mindmap.html` `#sec-mindmap-static`

## Purpose

Server-rendered inline SVG mind-map for print and modal zoom. No JavaScript required.

## Expected look

- White background, `#0f172a` labels, `#cbd5e1` borders, teal root accent.
- Orthogonal elbow connectors (`#94a3b8`).
- `@media print` hides chrome; SVG scales to page width.

## Root element

```html
<div class="ks-mindmap ks-mindmap--static" hash="Mms" data-ks-hash="Mms"
     data-ks-type="component" data-ks-name="mindmap-static">
```

## Deterministic checks

- Built HTML contains `[data-ks-hash="Mms"]` with inline `<svg>`.
- Print preview: no dark blobs; connectors visible.
