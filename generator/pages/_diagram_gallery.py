"""Shared SVG diagram template catalog and HTML for showcase + for-agents pages.

Taxonomy (how this catalog relates to Mermaid and content):

- **Pattern** — What the diagram means (flow, hierarchy, time, chart, status). Families group patterns.
- **Presentation** — How much metadata each node carries (e.g. generic ``tree`` vs people **orgchart** cards with avatar, name, title).
- **Tier 1 (here)** — Static ``template-*.svg`` archetypes for slides, handbooks, and modal thumbs.
- **Tier 2** — ``_diagram_mermaid_parallels.py``: diagram-as-code samples keyed to each template.
- **Tier 3** — ``mermaid-examples.html``: full ``mermaid@10`` grammar catalog; not every grammar needs an SVG twin.

Adding a template: new SVG under ``assets/svg/``, one ``items`` dict in ``_FAMILIES``, matching
``DIAGRAM_DETAILS`` in ``js/showcase.js`` (``node`` strings ↔ optional ``data-node`` on SVG groups),
optional ``_MERMAID`` entry in ``_diagram_mermaid_parallels.py``, run ``apply_diagram_svg_palette.py``.

**Phase C/D (optional growth):** sequence lifeline strip, small state-machine, C4-style context SVGs;
if the catalog grows past ~30 entries, consider a single JSON/YAML manifest to generate Python + JS metadata.
"""
from __future__ import annotations

from components import e, e_content


def _fam_section_id(name: str) -> str:
    """Stable fragment id derived from a section title (legacy helper)."""
    return "fam-" + (
        name.lower()
        .replace(" & ", "-")
        .replace(" ", "-")
        .replace(",", "")
    )


def family_section_id(fam: dict) -> str:
    """Stable section anchor; explicit ``section_id`` overrides derived id."""
    sid = fam.get("section_id")
    if sid:
        return str(sid)
    return _fam_section_id(str(fam["name"]))


def _mermaid_tags_line(types: list[str]) -> str:
    if not types:
        return "Mermaid: <span class='text-dim'>(no direct grammar — use SVG or other tools)</span>"
    joined = " · ".join(e(t) for t in types)
    return f"Mermaid: <span class='text-cyan'>{joined}</span>"


_FAMILIES: list[dict] = [
    {
        "section_id": "fam-process-flow",
        "name": "Process & flow",
        "desc": "How work moves through stages — same visual language as Mermaid flowcharts and journey-style narratives.",
        "family_mermaid_html": (
            '<p class="forge-support small mb-2">Primary Mermaid parallels: '
            '<strong>flowchart</strong> (<code>LR</code>/<code>TD</code>, decisions, subgraph swimlanes) and '
            '<strong>journey</strong>. Volume narrowing is approximated with <strong>sankey-beta</strong> on the '
            '<a class="text-cyan" href="mermaid-examples.html" style="text-decoration:none">Mermaid examples</a> page.</p>'
        ),
        "items": [
            {
                "key": "linear",
                "svg": "template-linear-flow.svg",
                "label": "linear-flow",
                "mermaid": ["flowchart", "journey"],
            },
            {
                "key": "loop",
                "svg": "template-loop-cycle.svg",
                "label": "loop-cycle",
                "mermaid": ["flowchart"],
            },
            {
                "key": "gate",
                "svg": "template-gate-chain.svg",
                "label": "gate-chain",
                "mermaid": ["flowchart"],
            },
            {
                "key": "swimlane",
                "svg": "template-swimlane.svg",
                "label": "swimlane",
                "mermaid": ["flowchart", "subgraph"],
            },
            {
                "key": "decision",
                "svg": "template-decision-flow.svg",
                "label": "decision-flow",
                "mermaid": ["flowchart"],
            },
            {
                "key": "funnel",
                "svg": "template-funnel.svg",
                "label": "funnel",
                "mermaid": ["flowchart", "sankey-beta"],
            },
        ],
    },
    {
        "section_id": "fam-structural-relational",
        "name": "Structural & relational",
        "desc": "Hierarchy, boards, and relationships — align with Mermaid flowchart, mindmap, and (for networks) graph edges. Tree = generic node boxes; org chart = people cards (avatar, name, title, team line).",
        "family_mermaid_html": (
            '<p class="forge-support small mb-2">Maps to <strong>flowchart</strong> trees and org-style TD layouts, '
            '<strong>mindmap</strong>, and dense links similar to flowchart <code>---</code> / <code>--></code> edges. '
            '<strong>classDiagram</strong> / <strong>erDiagram</strong> cover typed relations on '
            '<a class="text-cyan" href="mermaid-examples.html" style="text-decoration:none">Mermaid examples</a>.</p>'
        ),
        "items": [
            {
                "key": "tree",
                "svg": "template-tree.svg",
                "label": "tree",
                "mermaid": ["flowchart", "mindmap"],
            },
            {
                "key": "orgchart",
                "svg": "template-org-chart.svg",
                "label": "org-chart",
                "mermaid": ["flowchart"],
            },
            {
                "key": "board",
                "svg": "template-board-columns.svg",
                "label": "board-columns",
                "mermaid": ["flowchart", "block-beta"],
            },
            {
                "key": "checklist",
                "svg": "template-checklist.svg",
                "label": "checklist",
                "mermaid": ["flowchart"],
            },
            {
                "key": "network",
                "svg": "template-network.svg",
                "label": "network",
                "mermaid": ["flowchart"],
            },
            {
                "key": "venn",
                "svg": "template-venn.svg",
                "label": "venn",
                "mermaid": [],
            },
        ],
    },
    {
        "section_id": "fam-timeline-scheduling",
        "name": "Timeline & scheduling",
        "desc": "Time-based views — pair with Mermaid gantt and timeline grammars.",
        "family_mermaid_html": (
            '<p class="forge-support small mb-2">Direct Mermaid: <strong>gantt</strong> and <strong>timeline</strong>. '
            'Roadmaps often combine both; see <a class="text-cyan" href="mermaid-examples.html" style="text-decoration:none">Mermaid examples</a>.</p>'
        ),
        "items": [
            {"key": "gantt", "svg": "template-gantt.svg", "label": "gantt", "mermaid": ["gantt"]},
            {"key": "timeline", "svg": "template-timeline.svg", "label": "timeline", "mermaid": ["timeline"]},
            {
                "key": "roadmap",
                "svg": "template-roadmap.svg",
                "label": "roadmap",
                "mermaid": ["timeline", "gantt"],
            },
        ],
    },
    {
        "section_id": "fam-data-charts",
        "name": "Data charts",
        "desc": "Quantitative views — Mermaid covers pie and xychart-beta; area/stack/scatter use XY or quadrant patterns.",
        "family_mermaid_html": (
            '<p class="forge-support small mb-2">Mermaid: <strong>pie</strong>, <strong>xychart-beta</strong> (bar/line), '
            'and <strong>quadrantChart</strong> for scatter-like placement. See '
            '<a class="text-cyan" href="mermaid-examples.html" style="text-decoration:none">Mermaid examples</a>.</p>'
        ),
        "items": [
            {"key": "bar", "svg": "template-bar-chart.svg", "label": "bar-chart", "mermaid": ["xychart-beta"]},
            {"key": "line", "svg": "template-line-chart.svg", "label": "line-chart", "mermaid": ["xychart-beta"]},
            {"key": "pie", "svg": "template-pie-donut.svg", "label": "pie-donut", "mermaid": ["pie"]},
            {
                "key": "stacked",
                "svg": "template-stacked-bar.svg",
                "label": "stacked-bar",
                "mermaid": ["xychart-beta"],
            },
            {
                "key": "area",
                "svg": "template-area-chart.svg",
                "label": "area-chart",
                "mermaid": ["xychart-beta"],
            },
            {
                "key": "scatter",
                "svg": "template-scatter.svg",
                "label": "scatter",
                "mermaid": ["quadrantChart"],
            },
        ],
    },
    {
        "section_id": "fam-comparison-status",
        "name": "Comparison & status",
        "desc": "Quadrants, gauges, KPI tiles — quadrant charts in Mermaid; gauges/KPIs are usually custom SVG or BI exports.",
        "family_mermaid_html": (
            '<p class="forge-support small mb-2"><strong>quadrantChart</strong> is native; gauges and KPI cards have no stock Mermaid type — keep these templates or embed from analytics tools.</p>'
        ),
        "items": [
            {
                "key": "quadrant",
                "svg": "template-quadrant.svg",
                "label": "quadrant",
                "mermaid": ["quadrantChart"],
            },
            {"key": "gauge", "svg": "template-gauge.svg", "label": "gauge", "mermaid": []},
            {"key": "kpi", "svg": "template-kpi-card.svg", "label": "kpi-card", "mermaid": []},
        ],
    },
    {
        "section_id": "fam-specialized",
        "name": "Specialized",
        "desc": "Heatmaps and other dense matrices — not in default Mermaid 10 bundle as first-class grammars.",
        "family_mermaid_html": (
            '<p class="forge-support small mb-2">No default <code>mermaid@10</code> heatmap grammar; use this SVG archetype or external charting. Other specialized diagrams (e.g. <strong>requirementDiagram</strong>, <strong>gitGraph</strong>, <strong>C4</strong>) live on '
            '<a class="text-cyan" href="mermaid-examples.html" style="text-decoration:none">Mermaid examples</a>.</p>'
        ),
        "items": [
            {"key": "heatmap", "svg": "template-heatmap.svg", "label": "heatmap", "mermaid": []},
        ],
    },
]


def diagram_template_count() -> int:
    """Number of static SVG diagram templates in the catalog (not fixed; grows with ``_FAMILIES``)."""
    return sum(len(f["items"]) for f in _FAMILIES)


EXTRA_CSS = """\
  <style>
    .ks-diagram-card { cursor: pointer; }
    .ks-diagram-canvas {
      background: var(--forge-surface);
      border: 1px solid var(--forge-border);
      border-radius: 10px;
      padding: 0.45rem;
    }
    .ks-diagram-canvas img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 6px;
    }
    .ks-diagram-mermaid-tags {
      font-family: var(--font-label);
      font-size: 0.58rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--forge-text-4);
      line-height: 1.35;
    }
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
      - ``showcase``: ids from ``family_section_id``; ``h4`` titles (diagrams gallery page).
      - ``for_agents``: ids prefixed ``ag-``; ``h3`` titles (embedded in for-agents spec).
    """
    sections: list[str] = []
    for fam in _FAMILIES:
        cards: list[str] = []
        for item in fam["items"]:
            key = item["key"]
            svg_file = item["svg"]
            label = item["label"]
            tags_html = _mermaid_tags_line(item.get("mermaid") or [])
            cards.append(
                f'<div class="forge-diagram forge-diagram-trigger ks-diagram-card '
                f'text-center ks-thumb" '
                f'onclick="openDiagramWithDetail(this, \'{key}\')">'
                f'<div class="ks-diagram-canvas">'
                f'<img src="assets/svg/{svg_file}" alt="{e(label)}">'
                f"</div>"
                f'<p class="section-label mt-2 mb-0">{e_content(label)}</p>'
                f'<p class="ks-diagram-mermaid-tags mt-1 mb-0 px-1">{tags_html}</p></div>'
            )
        sec_id = family_section_id(fam)
        if variant == "for_agents":
            sec_id = f"ag-{sec_id}"
            title_open = (
                '<h3 class="font-display mt-2 mb-1" '
                'style="font-size:1.35rem;color:var(--forge-amber)">'
            )
            title_close = "</h3>"
            desc_cls = 'class="forge-support mb-2" style="font-size:0.9rem"'
            bento_mb = "mb-2"
        else:
            title_open = '<h4 class="mt-4 mb-1" style="color:var(--forge-amber)">'
            title_close = "</h4>"
            desc_cls = 'class="forge-support mb-2" style="font-size:0.85rem"'
            bento_mb = "mb-4"

        fam_note = fam.get("family_mermaid_html") or ""
        sections.append(
            f'<section id="{sec_id}" class="ks-section">\n'
            f"  {title_open}{e_content(fam['name'])}{title_close}\n"
            f"  <p {desc_cls}>{e_content(fam['desc'])}</p>\n"
            f"  {fam_note}\n"
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
