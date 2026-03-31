"""Diagrams gallery page — SVG diagram template catalog plus diagram-as-code parallels."""
from __future__ import annotations

from pages._diagram_gallery import (
    EXTRA_CSS,
    _FAMILIES,
    diagram_template_count,
    family_section_id,
    render_body,
)
from pages._diagram_mermaid_parallels import render_mermaid_parallels_html
from transforms import render_ascii_diagram_fence

_DIAGRAM_TEMPLATE_COUNT = diagram_template_count()

_DIAGRAM_ASCII_STATIC = render_ascii_diagram_fence(
    """key: linear
alt: ASCII linear flow example
caption: Same catalog key as the SVG linear template
+------+     +------+     +------+
|  A   | --> |  B   | --> |  C   |
+------+     +------+     +------+"""
)

_DIAGRAM_ASCII_EXPAND = render_ascii_diagram_fence(
    """key: linear
alt: Click to open the catalog legend for the linear template
expand: true
+------+     +------+
|  A   | --> |  B   |
+------+     +------+"""
)

PAGE = {
    "slug": "diagrams",
    "title": "Diagram Templates",
    "intro": (
        f"{_DIAGRAM_TEMPLATE_COUNT} SVG diagram archetypes across {len(_FAMILIES)} families."
    ),
    "family": "Diagrams & charts",
    "layout": "gallery",
    "order": 10,
    "has_mermaid": True,
    "toc": [("sec-diagrams", "Overview")]
    + [("sec-diagram-ascii", "ASCII diagrams")]
    + [(family_section_id(f), f["name"]) for f in _FAMILIES]
    + [("sec-diagram-parallels", "Diagram-as-code parallels")],
}


def extra_css() -> str:
    return EXTRA_CSS


def render() -> str:
    intro = f"""\
<section id="sec-diagrams" class="ks-section">
  <h2 class="ks-section-title">SVG Diagram Type Templates</h2>
  <p class="forge-support mb-3"><strong>{_DIAGRAM_TEMPLATE_COUNT} static SVG</strong> archetypes (Forge palette: cyan / amber / slate surfaces), extensible over time — aligned with diagram-as-code in the same design system: each family explains the closest native grammars, and each card lists matching types (e.g. flowchart, gantt, <code>xychart-beta</code>). Click a card for the modal legend. Scroll to <a href="#sec-diagram-parallels">diagram-as-code parallels</a> for live samples per template key, or <a href="diagram-code-examples.html">Diagram-as-code examples</a> for the full <code>mermaid@10</code> catalog (sequence, state, class, ER, C4, Git graph, …).</p>
  <p class="forge-support mb-4">For <strong>JSON-driven metrics charts</strong> (same <code>charts</code> envelope as forge-lenses), see <a href="data-charts-static.html">Data charts (static JSON)</a> and <a href="data-charts-api.html">Data charts (API fetch)</a>.</p>
</section>"""
    ascii_section = f"""\
<section id="sec-diagram-ascii" class="ks-section">
  <h2 class="ks-section-title">ASCII diagrams</h2>
  <p class="forge-support mb-3">In Markdown, the <code>```blueprint-diagram-ascii</code> fence (alias <code>```ks-diagram-ascii</code>) renders box-drawing in the same <code>.forge-diagram</code> shell as Mermaid and SVG tiles. Optional <code>key:</code>, <code>alt:</code>, <code>caption:</code>, and <code>expand:</code> lines form a prefix; the first line that does not match begins the art. With a valid catalog <code>key:</code> and <code>expand: true</code>, the figure opens the same legend modal as static SVG tiles. Heuristics for choosing <code>key:</code> from ASCII intent are in <code>docs/ascii-to-ks-diagrams.md</code> in the repository.</p>
  <p class="section-label text-cyan mb-2">Example (static)</p>
  {_DIAGRAM_ASCII_STATIC}
  <p class="section-label text-cyan mb-2 mt-4">Example (expand — click figure)</p>
  {_DIAGRAM_ASCII_EXPAND}
</section>"""
    return (
        render_body(
            intro_section_html=intro + "\n\n" + ascii_section,
            include_diagram_modal=True,
        )
        + "\n\n"
        + render_mermaid_parallels_html()
    )
