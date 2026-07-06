# ASCII art → Kitchen Sink diagram templates

This document is **authoring guidance** for humans and tools. Kitchen Sink does **not** parse ASCII shapes and infer a catalog `key` automatically—you choose a template key (or omit it) when using the `blueprint-diagram-ascii` fence or when pairing ASCII with a `blueprint-diagram` SVG tile.

## Fence recap

In Markdown (handbook / product site HTML pipeline via `apply_all`):

- ` ```blueprint-diagram-ascii ` — monospace ASCII in a Forge diagram shell; optional metadata prefix lines: `key:`, `alt:`, `caption:`, `expand:`.
- Legacy alias: ` ```ks-diagram-ascii `.

Metadata lines must appear as a **consecutive prefix** at the top of the fence. The **first line that does not** match `key:` / `alt:` / `caption:` / `expand:` begins the ASCII art (so labels containing `:` in the drawing are safe).

See [README.md](../README.md) and the **ASCII diagrams** section on the showcase **Diagram templates** page for live examples.

## Heuristic mapping (intent → catalog `key`)

Use the closest [diagram template gallery](../generator/pages/_diagram_gallery.py) archetype:

| ASCII intent | Suggested `key` | Notes |
|--------------|-----------------|--------|
| Left-to-right stages, one row of boxes and arrows | `linear` | Straight process |
| Cycle or feedback edge to the start | `loop` | Iteration |
| Stages separated by diamond checkpoints | `gate` | Approval / quality gates |
| One root branching to children | `tree` | Hierarchy |
| Horizontal lanes with labeled rows | `swimlane` | Actor / team handoffs |
| Kanban-style columns | `board` | Work states |
| Many nodes and crossing links | `network` | Relationship mesh |
| Overlapping regions | `venn` | Set overlap |
| Time or milestones on an axis | `timeline` or `roadmap` | Pick by horizon length |

Charts (bars, lines, pies, etc.) map to the **Charts & metrics** and related families in the same catalog (`bar`, `line`, `gantt`, …).

## Side-by-side example

**Dual-view fence with content SVG** (`src:` — SVG default, **ASCII view** toggle):

````markdown
```blueprint-diagram
src: sdlc/docs/assets/my-labeled-flow.svg
alt: Three-step handoff
fallback_ascii: |
  +------+     +------+     +------+
  |  A   | --> |  B   | --> |  C   |
  +------+     +------+     +------+
```
````

**Labeled flow without content SVG** (`fallback_ascii` only, optional `key:` for `expand:` modal):

Catalog template tiles are **not** shown when `src:` is omitted — readers see the labeled monospace flow in the diagram shell. Add a content SVG under your repo `docs/assets/` when the primary view should be graphical.

````markdown
```blueprint-diagram
key: linear
alt: Three-step handoff
fallback_ascii: |
  +------+     +------+     +------+
  |  A   | --> |  B   | --> |  C   |
  +------+     +------+     +------+
```
````

Dual-view toggle (`ks-diagram-view-toggle.js`) loads only when a fence has **both** `src:` and `fallback_ascii`. With `src:` alone, only the content SVG tile is emitted.

**ASCII-only fence** (sketch in monospace, no SVG):

````markdown
```blueprint-diagram-ascii
key: linear
alt: Three-step handoff
caption: ASCII sketch — same key as the SVG tile below
+------+     +------+     +------+
|  A   | --> |  B   | --> |  C   |
+------+     +------+     +------+
```
````

**Content SVG** (polished figure for slides or print):

````markdown
```blueprint-diagram
src: sdlc/docs/assets/my-labeled-flow.svg
alt: Three-step handoff
```
````

A fence with only `key:` (no `src:` and no `fallback_ascii`) is **not** rendered in handbook HTML — catalog template tiles are placeholders for the showcase gallery, not reader-facing figures.

## Enriched flow fences (`node:` / `detail:` / `more:`)

A `blueprint-diagram` fence (no `src:`) may carry **per-node enrichment**. When at
least one `node:` line is present, the fence renders as the **enriched flow
figure** (`figure.forge-diagram-flow`, hash `Flw`) instead of the generated
inline SVG: an HTML step list where every step shows its label plus a one-line
`detail:`, with an **Expand** button that opens a flyout (shared diagram modal)
showing the flow beside a per-step deep-dive panel (`more:` text).

Metadata fields (all optional except `node:`):

| Field | Where it appears |
|---|---|
| `title:` | Compact figure heading + flyout modal title |
| `summary:` | One-liner under the title; intro paragraph in the flyout |
| `node:` | Starts a flow step; value is the step label |
| `detail:` | One short sentence under the owning `node:` label (compact + flyout) |
| `more:` | Deeper explanation, flyout detail panel only |
| `fallback_ascii:` | Keeps the ASCII toggle panel (recommended for agent readers) |

`detail:` and `more:` attach to the **most recent** `node:` line. Values are
single logical lines (no wrapping continuation).

````markdown
```blueprint-diagram
key: linear
alt: RAG answer flow from question to cited answer
title: RAG answer flow
summary: How a question becomes a governed, cited answer.
node: rag_query_plan
detail: Optional planner that decomposes the question.
more: Emits targeted sub-queries so retrieval covers every aspect of the ask.
node: Retriever
detail: Collects ranked chunks into an EvidencePack.
more: Default adapter wraps build_context_pack (repo scan + rank + trim) — no vector DB required.
node: answer_from_evidence
detail: Drafts the answer strictly from retrieved evidence.
fallback_ascii: |
  rag_query_plan
      |
      v
  Retriever
      |
      v
  answer_from_evidence
```
````

Enrichment is **per page**: the same flow can carry different `detail:`/`more:`
text on different pages, matching the surrounding context. When `src:` is
present the enrichment fields are ignored (content SVG stays primary).
