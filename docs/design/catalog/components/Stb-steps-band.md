# Stb — Steps band

**Hash:** `Stb` · **Type:** component · **Family:** python-components · **Status:** active

Rendered by `components/consumer_marketing.py::render_steps_band`.

## Purpose

Numbered three-to-four step band for “how it works” sections on consumer marketing pages.

## Expected look

- Optional centered section title (H2).
- Ordered list presented as three equal columns on desktop.
- Each step: amber circular number, bold title, muted one-sentence body, centered.

## Root element

```html
<section class="fs-consumer-steps" hash="Stb" data-ks-hash="Stb" …>
```

## Responsive behavior

- Single column stack on mobile; three-column grid from md breakpoint.

## Accessibility contract

- Native `<ol>` preserves step order for screen readers.
- Decorative step numbers use `aria-hidden="true"`.
