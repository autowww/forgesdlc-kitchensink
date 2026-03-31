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

**ASCII fence** (sketch in monospace):

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

**SVG tile** (polished figure for slides or print):

````markdown
```blueprint-diagram
key: linear
alt: Three-step handoff
```
````

Both use the same catalog `key: linear` so the optional `expand: true` path opens the same legend modal for the template.
