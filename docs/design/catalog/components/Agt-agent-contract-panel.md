# Agt — Agent contract panel

**Hash:** `Agt` · **Type:** component · **Family:** forge-autodoc · **Status:** active

Rendered by `forge_autodoc.agent_contract.render_agent_contract_panel` from the
page-contract `agent_contract` frontmatter block (Forge page contract v1,
`forge.doc_page_frontmatter.v1`). Appended after the page body on handbook pages
whose frontmatter declares the block.

## Purpose

Give automated consumers (agents, retrieval pipelines) an explicit, visible
statement of what they may do with a page — allowed actions, safe inferences,
prohibited inferences, and key artifacts — while showing human readers that the
page is agent-consumable by design.

## Expected look

- A Bootstrap `card` with `border-info-subtle`, full content width, `my-4`
  spacing, directly after the article body and before related-page navigation.
- Header: `bg-info-subtle` strip with a robot icon (`bi-robot`) and the
  `h6`-sized heading **"Agent contract"** (`h2` element for landmark order).
- Body: a two-column grid (`col-12 col-md-6`, collapsing to one column below
  the `md` breakpoint). Each cell has a small uppercase semibold label with a
  contextual Bootstrap icon (`bi-check2-circle`, `bi-lightbulb`,
  `bi-slash-circle`, `bi-file-earmark-code`) and a compact `small` bullet list.
- Footer line inside the body: one `small text-body-secondary` sentence
  explaining the panel's provenance (frontmatter-driven).
- Renders nothing when the block is absent or has no list content — no empty
  chrome.

## Root element

```html
<section class="forge-agent-contract card border-info-subtle my-4"
         hash="Agt" data-ks-hash="Agt"
         data-ks-type="component" data-ks-name="agent-contract-panel">
```

## Accessibility

- `aria-labelledby="agent-contract-heading"` on the section root.
- All icons `aria-hidden="true"`; content is meaningful without them.
- List semantics (`ul`/`li`) preserved for screen-reader enumeration.

## Content rules

- Values come verbatim from frontmatter and are HTML-escaped — the panel never
  invents guidance.
- Section order is fixed: allowed actions → safe to infer → do not infer →
  key artifacts; missing sections are skipped without placeholders.

## Verification

- Unit tests: `forge-autodoc/tests/test_agent_contract.py` (hash markers,
  section rendering, escaping, empty-block suppression).
- Consumer check: after a site build, raw HTML of a page with `agent_contract`
  frontmatter must contain both `hash="Agt"` and `data-ks-hash="Agt"`.
