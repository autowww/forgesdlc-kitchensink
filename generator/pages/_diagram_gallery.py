"""Shared SVG diagram template catalog and HTML for showcase + for-agents pages."""
from __future__ import annotations

from components import e, e_content


def _fam_section_id(name: str) -> str:
    """Stable fragment id for each diagram family section."""
    return "fam-" + (
        name.lower()
        .replace(" & ", "-")
        .replace(" ", "-")
        .replace(",", "")
    )


_FAMILIES = [
    {
        "name": "Process & Flow",
        "desc": "How work moves through stages.",
        "items": [
            ("linear", "template-linear-flow.svg", "linear-flow"),
            ("loop", "template-loop-cycle.svg", "loop-cycle"),
            ("gate", "template-gate-chain.svg", "gate-chain"),
            ("swimlane", "template-swimlane.svg", "swimlane"),
            ("decision", "template-decision-flow.svg", "decision-flow"),
            ("funnel", "template-funnel.svg", "funnel"),
        ],
    },
    {
        "name": "Structural & Relational",
        "desc": "How things are organized or connected.",
        "items": [
            ("tree", "template-tree.svg", "tree"),
            ("board", "template-board-columns.svg", "board-columns"),
            ("checklist", "template-checklist.svg", "checklist"),
            ("network", "template-network.svg", "network"),
            ("venn", "template-venn.svg", "venn"),
        ],
    },
    {
        "name": "Timeline & Scheduling",
        "desc": "Events or work spread across time.",
        "items": [
            ("gantt", "template-gantt.svg", "gantt"),
            ("timeline", "template-timeline.svg", "timeline"),
            ("roadmap", "template-roadmap.svg", "roadmap"),
        ],
    },
    {
        "name": "Data Charts",
        "desc": "Quantitative data visualization (Excel / Power BI territory).",
        "items": [
            ("bar", "template-bar-chart.svg", "bar-chart"),
            ("line", "template-line-chart.svg", "line-chart"),
            ("pie", "template-pie-donut.svg", "pie-donut"),
            ("stacked", "template-stacked-bar.svg", "stacked-bar"),
            ("area", "template-area-chart.svg", "area-chart"),
            ("scatter", "template-scatter.svg", "scatter"),
        ],
    },
    {
        "name": "Comparison & Status",
        "desc": "Current state, thresholds, or relative positioning.",
        "items": [
            ("quadrant", "template-quadrant.svg", "quadrant"),
            ("gauge", "template-gauge.svg", "gauge"),
            ("kpi", "template-kpi-card.svg", "kpi-card"),
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

EXTRA_CSS = """\
  <style>
    .ks-diagram-card { cursor: pointer; }
  </style>"""


def render_diagram_modal_html() -> str:
    """Lightbox shell used by showcase.js openDiagramWithDetail."""
    return """\
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


def render_family_sections_html(*, variant: str = "showcase") -> str:
    """One ks-section per family with clickable SVG thumbs.

    variant:
      - ``showcase``: ids like ``fam-process-flow``; ``h4`` titles (diagrams gallery page).
      - ``for_agents``: ids prefixed ``ag-``; ``h3`` titles (embedded in for-agents spec).
    """
    sections: list[str] = []
    for fam in _FAMILIES:
        cards: list[str] = []
        for key, svg_file, label in fam["items"]:
            cards.append(
                f'<div class="forge-diagram forge-diagram-trigger ks-diagram-card '
                f'text-center ks-thumb" '
                f'onclick="openDiagramWithDetail(this, \'{key}\')">'
                f'<div class="ks-diagram-canvas">'
                f'<img src="assets/svg/{svg_file}" alt="{e(label)}">'
                f"</div>"
                f'<p class="section-label mt-2 mb-0">{e_content(label)}</p></div>'
            )
        base_id = _fam_section_id(fam["name"])
        if variant == "for_agents":
            sec_id = f"ag-{base_id}"
            title_open = (
                '<h3 class="font-display mt-2 mb-1" '
                'style="font-size:1.35rem;color:var(--forge-amber)">'
            )
            title_close = "</h3>"
            desc_cls = 'class="forge-support mb-3" style="font-size:0.9rem"'
            bento_mb = "mb-2"
        else:
            sec_id = base_id
            title_open = '<h4 class="mt-4 mb-1" style="color:var(--forge-amber)">'
            title_close = "</h4>"
            desc_cls = 'class="forge-support mb-3" style="font-size:0.85rem"'
            bento_mb = "mb-4"

        sections.append(
            f'<section id="{sec_id}" class="ks-section">\n'
            f"  {title_open}{e_content(fam['name'])}{title_close}\n"
            f"  <p {desc_cls}>{e_content(fam['desc'])}</p>\n"
            f'  <div class="bento-grid bento-3 {bento_mb}">\n'
            f'    {"".join(cards)}\n'
            f"  </div>\n"
            f"</section>"
        )
    return "\n\n".join(sections)


def render_body(*, intro_section_html: str, include_diagram_modal: bool = True) -> str:
    """Full page body: intro block + family grids + optional diagram modal."""
    families = render_family_sections_html(variant="showcase")
    modal = render_diagram_modal_html() if include_diagram_modal else ""
    parts = [intro_section_html.strip(), families]
    if modal:
        parts.append(modal)
    return "\n\n".join(parts)
