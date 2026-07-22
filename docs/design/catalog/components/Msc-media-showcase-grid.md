# Msc — Media showcase grid

**Hash:** `Msc` · **Type:** component · **Family:** python-components · **Status:** active

Rendered by `components/consumer_marketing.py::render_media_showcase_grid`.

## Purpose

Linked media card grid — template-gallery pattern for sample reports, tours, or resource highlights.

## Expected look

- Optional centered H2 section title.
- Responsive grid of 2–3 cards (3 columns on md+).
- Each card: 4:3 cover area, title, optional subtitle; entire card is one link.
- Subtle hover lift and shadow on pointer devices when motion allowed.

## Root element

```html
<section class="fs-consumer-showcase" hash="Msc" data-ks-hash="Msc" …>
```

## Responsive behavior

- Single column on narrow viewports; multi-column from md.

## Accessibility contract

- Card is a single `<a>` with visible title text.
- Decorative cover images use empty `alt` when title is present in card meta.
