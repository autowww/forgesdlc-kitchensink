"""Diagrams gallery page — SVG diagram template catalog plus Mermaid parallels."""
from __future__ import annotations

from pages._diagram_gallery import (
    EXTRA_CSS,
    _FAMILIES,
    diagram_template_count,
    family_section_id,
    render_body,
)
from pages._diagram_mermaid_parallels import render_mermaid_parallels_html

_DIAGRAM_TEMPLATE_COUNT = diagram_template_count()

PAGE = {
    "slug": "diagrams",
    "title": "Diagram Templates",
    "intro": (
        f"{_DIAGRAM_TEMPLATE_COUNT} SVG diagram archetypes across {len(_FAMILIES)} families."
    ),
    "family": "Patterns",
    "layout": "gallery",
    "order": 5,
    "has_mermaid": True,
    "toc": [("sec-diagrams", "Overview")]
    + [(family_section_id(f), f["name"]) for f in _FAMILIES]
    + [("sec-diagram-mermaid", "Mermaid parallels")],
}


def extra_css() -> str:
    return EXTRA_CSS


def render() -> str:
    intro = f"""\
<section id="sec-diagrams" class="ks-section">
  <h2 class="ks-section-title">SVG Diagram Type Templates</h2>
  <p class="forge-support mb-4"><strong>{_DIAGRAM_TEMPLATE_COUNT} static SVG</strong> archetypes (Forge palette: cyan / amber / slate surfaces), extensible over time — aligned with how we use <strong>Mermaid</strong> in the same design system: each family explains the closest native Mermaid grammars, and each card lists matching types (e.g. flowchart, gantt, <code>xychart-beta</code>). Click a card for the modal legend. Scroll to <a href="#sec-diagram-mermaid">Mermaid parallels</a> for live diagram-as-code per template key, or <a href="mermaid-examples.html">Mermaid diagram examples</a> for the full <code>mermaid@10</code> catalog (sequence, state, class, ER, C4, Git graph, …).</p>
</section>"""
    return render_body(intro_section_html=intro, include_diagram_modal=True) + "\n\n" + render_mermaid_parallels_html()
