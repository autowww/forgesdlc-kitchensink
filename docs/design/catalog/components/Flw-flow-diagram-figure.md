# Flw — Enriched flow diagram figure

**Hash:** `Flw` · **Type:** component · **Family:** python-components · **Status:** active

Rendered by `components/diagram_flow.py::flow_diagram_figure_html` when a
`blueprint-diagram` Markdown fence carries per-node enrichment metadata
(`node:` groups with optional `detail:` and `more:` lines, plus optional
`title:` and `summary:`) and no `src:`. Replaces the legacy generated inline
SVG for enriched fences; unenriched fences keep the legacy rendering.

## Purpose

Give readers a compact, information-dense flow: each step shows its label plus
a one-line explanation in context, with an **Expand** flyout (shared diagram
modal) that dives deeper per step — without leaving the page or duplicating
prose into the surrounding article.

## Expected look

- A `forge-diagram` shell (dark surface card, breathe-static) with generous
  clamp padding, same rhythm as sibling diagram figures.
- Head row: display-font cyan title (`~0.95rem`, 900 weight) with an optional
  muted one-line summary (max `62ch`) on the left; a compact toolbar on the
  right with an **ASCII view** toggle (only when `fallback_ascii` present) and
  an **Expand** button (`btn-sm btn-outline-secondary`).
- Body: vertical ordered list of step cards — surface background, subtle cyan
  border, 8px radius. Each card stacks a monospace label (`0.85rem`, near-white)
  over a muted `0.78rem` detail line. Cards are connected by a slim vertical
  rule ending in a downward triangle arrow, centered between cards.
- Hovering a card raises border to `--forge-border-hover` with a soft cyan
  ring — matching the diagram-modal detail-item elevation language.
- Flyout (shared `#diagramModal`): title in the modal header; canvas shows the
  optional summary paragraph plus the same step list at modal scale; right
  detail panel lists one `detail-item` per step (cyan term + `detail`/`more`
  text). Hovering a step or a detail item highlights its counterpart.
- Optional `caption:` renders as the standard centered diagram figcaption.

## Root element

```html
<figure class="forge-diagram forge-diagram-flow breathe-static [forge-diagram-dual]"
        hash="Flw" data-ks-hash="Flw"
        data-ks-type="component" data-ks-name="Enriched flow diagram figure"
        role="group" aria-label="...">
```

## Anatomy

- `.forge-flow__head` — `.forge-flow__heading` (`__title`, `__summary`) +
  `.forge-flow__toolbar` (view toggle, `.forge-flow-expand` button).
- `.forge-flow-list` > `.forge-flow-step[data-node]` —
  `.forge-flow-step__label` + `.forge-flow-step__detail`.
- When `fallback_ascii` present: dual panels (`data-panel="svg"` holds the flow
  list, `data-panel="ascii"` the monospace pre) toggled by
  `ks-diagram-view-toggle.js`.
- `script.forge-flow-data` — embedded JSON payload (`title`, `summary`,
  `caption`, `nodes[{label, detail, more}]`) consumed by
  `openFlowDetailModal` in `js/ks-diagram-modal.js`.

## Accessibility

- Figure root: `role="group"` with `aria-label` from `alt:`/`title:`.
- Expand button: `aria-haspopup="dialog"`; the shared diagram modal manages
  focus/close semantics.
- Steps are a real `<ol>`; reading order matches flow order without hover.
- ASCII toggle reuses the audited dual-view button (`aria-pressed`).

## Content rules

- All fence values are HTML-escaped; the payload JSON escapes `<` so a
  `</script>` sequence can never break out of the data block.
- `detail:` is one short sentence (compact view); `more:` is flyout-only depth.
  When both exist the modal shows `detail — more`.
- Enrichment is authored per page (fence metadata), so the same template key
  can carry different explanations in different contexts.

## Verification

- Unit tests: `forge-autodoc/tests/test_diagram_flow.py` (figure emission,
  hash markers, payload JSON, toggle presence, legacy fence regression,
  `src:` precedence).
- Consumer check: after a site build, raw HTML of an enriched page must
  contain both `hash="Flw"` and `data-ks-hash="Flw"`.
