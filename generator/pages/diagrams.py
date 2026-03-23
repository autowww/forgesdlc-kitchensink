"""Diagrams gallery page — all 24 SVG diagram templates."""
from __future__ import annotations

PAGE = {
    "slug": "diagrams",
    "title": "Diagram Templates",
    "intro": "24 SVG diagram archetypes across 6 families.",
    "family": "Patterns",
    "layout": "gallery",
    "order": 5,
}

_FAMILIES = [
    {
        "name": "Process & Flow",
        "desc": "How work moves through stages.",
        "items": [
            ("linear",   "template-linear-flow.svg", "linear-flow"),
            ("loop",     "template-loop-cycle.svg",  "loop-cycle"),
            ("gate",     "template-gate-chain.svg",  "gate-chain"),
            ("swimlane", "template-swimlane.svg",    "swimlane"),
            ("decision", "template-decision-flow.svg", "decision-flow"),
            ("funnel",   "template-funnel.svg",      "funnel"),
        ],
    },
    {
        "name": "Structural & Relational",
        "desc": "How things are organized or connected.",
        "items": [
            ("tree",      "template-tree.svg",          "tree"),
            ("board",     "template-board-columns.svg",  "board-columns"),
            ("checklist", "template-checklist.svg",      "checklist"),
            ("network",   "template-network.svg",        "network"),
            ("venn",      "template-venn.svg",           "venn"),
        ],
    },
    {
        "name": "Timeline & Scheduling",
        "desc": "Events or work spread across time.",
        "items": [
            ("gantt",    "template-gantt.svg",    "gantt"),
            ("timeline", "template-timeline.svg", "timeline"),
            ("roadmap",  "template-roadmap.svg",  "roadmap"),
        ],
    },
    {
        "name": "Data Charts",
        "desc": "Quantitative data visualization (Excel / Power BI territory).",
        "items": [
            ("bar",     "template-bar-chart.svg",   "bar-chart"),
            ("line",    "template-line-chart.svg",   "line-chart"),
            ("pie",     "template-pie-donut.svg",    "pie-donut"),
            ("stacked", "template-stacked-bar.svg",  "stacked-bar"),
            ("area",    "template-area-chart.svg",   "area-chart"),
            ("scatter", "template-scatter.svg",      "scatter"),
        ],
    },
    {
        "name": "Comparison & Status",
        "desc": "Current state, thresholds, or relative positioning.",
        "items": [
            ("quadrant", "template-quadrant.svg", "quadrant"),
            ("gauge",    "template-gauge.svg",    "gauge"),
            ("kpi",      "template-kpi-card.svg", "kpi-card"),
        ],
    },
    {
        "name": "Specialized",
        "desc": "Domain-specific visualization patterns.",
        "items": [
            ("heatmap", "template-heatmap.svg", "heatmap"),
        ],
    },
]


def extra_css() -> str:
    return """\
  <style>
    .ks-diagram-card { cursor: pointer; }
    .ks-diagram-card svg { width: 100%; height: auto; }
    .ks-thumb svg, .ks-thumb img { width: 100%; height: auto; }
    .diagram-modal-canvas .svg-node-zone { cursor: pointer; }
    .diagram-modal-canvas .svg-node-zone rect,
    .diagram-modal-canvas .svg-node-zone polygon,
    .diagram-modal-canvas .svg-node-zone circle {
      transition: filter 0.25s, stroke 0.25s, stroke-width 0.15s;
    }
    .diagram-modal-canvas .svg-node-zone.active rect,
    .diagram-modal-canvas .svg-node-zone.active polygon,
    .diagram-modal-canvas .svg-node-zone.active circle {
      stroke: var(--forge-cyan) !important;
      animation: node-breathe-stroke 2s ease-in-out infinite;
    }
    .diagram-modal-canvas .svg-node-zone.active {
      animation: node-breathe-glow 2s ease-in-out infinite;
    }
  </style>"""


def render() -> str:
    sections = []
    for fam in _FAMILIES:
        cards = []
        for key, svg_file, label in fam["items"]:
            cards.append(
                f'<div class="forge-diagram forge-diagram-trigger ks-diagram-card '
                f'p-2 text-center ks-thumb" '
                f'onclick="openDiagramWithDetail(this, \'{key}\')">'
                f'<img src="assets/svg/{svg_file}" alt="{label}">'
                f'<p class="section-label mt-2 mb-0">{label}</p></div>'
            )
        sections.append(
            f'<h4 class="mt-4 mb-1" style="color:var(--forge-amber)">'
            f'{fam["name"]}</h4>\n'
            f'<p class="forge-support mb-3" style="font-size:0.85rem">'
            f'{fam["desc"]}</p>\n'
            f'<div class="bento-grid bento-3 mb-4">\n'
            f'  {"".join(cards)}\n'
            f'</div>'
        )

    body = "\n\n".join(sections)
    return f"""\
<section id="sec-diagrams" class="ks-section">
  <h2 class="ks-section-title">SVG Diagram Type Templates</h2>
  <p class="forge-support mb-4">Reusable diagram archetypes from the Forge design system (24 templates across 6 families). Content-specific diagrams live in each project; these templates define the visual language. Click any card to expand with interactive node descriptions.</p>
{body}
</section>

<div id="diagramModal" class="diagram-modal-backdrop">
  <div class="diagram-modal">
    <div class="diagram-modal-header">
      <h3 id="diagramModalTitle" class="forge-gradient-text">Diagram</h3>
      <button class="diagram-modal-close" onclick="closeDiagramModal()" aria-label="Close">&times;</button>
    </div>
    <div class="diagram-modal-body">
      <div id="diagramModalCanvas" class="diagram-modal-canvas"></div>
      <div id="diagramModalDetail" class="diagram-modal-detail"></div>
    </div>
  </div>
</div>"""
