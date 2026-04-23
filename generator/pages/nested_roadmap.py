"""Showcase — nested drill-down roadmap component."""
from __future__ import annotations

from nested_roadmap import get_nested_roadmap_demo_config, render_nested_roadmap

PAGE = {
    "slug": "nested-roadmap",
    "title": "Nested roadmap",
    "intro": "Drill-down roadmap bars with modal preview, tooltips, and breadcrumb navigation.",
    "family": "Components",
    "layout": "showcase",
    "order": 4.25,
    "include_diagram_expand_modal": False,
    "toc": [
        ("sec-nrm-intro", "Overview"),
        ("sec-nrm-contract", "Data contract"),
        ("sec-nrm-demo", "Live demo"),
    ],
}


def extra_css() -> str:
    return '  <link rel="stylesheet" href="assets/nested-roadmap.css" />\n'


def extra_js_paths() -> list[str]:
    return ["assets/nested-roadmap.js"]


def render() -> str:
    demo = render_nested_roadmap(
        config=get_nested_roadmap_demo_config(),
        roadmap_id="showcase-nested-roadmap",
    )
    return f"""\
<section id="sec-nrm-intro" class="ks-section">
  <h2 class="ks-section-title">Overview</h2>
  <p class="forge-support mb-3">
    Interactive roadmap grid: bars that contain another roadmap show a nested icon and cyan-forward border.
    Hover to preview child titles. Click to open a dialog with summary, optional HTML detail, and a read-only
    mini-map of the next level; use <strong>Open nested roadmap</strong> to drill in. Move back with
    <strong>Up one level</strong>, <strong>Reset to root</strong>, or any breadcrumb segment.
  </p>
</section>
<section id="sec-nrm-contract" class="ks-section">
  <h2 class="ks-section-title">Data contract</h2>
  <p class="forge-support mb-2">
    Each level is JSON <code>version</code> 1 with <code>title</code>, <code>columns</code>, <code>tracks</code>, and <code>bars</code>.
    A bar is drillable when <code>child</code> is present and <code>child.bars</code> is non-empty.
    Optional <code>summary</code> (plain text) and <code>detailHtml</code> (trusted server HTML only) appear in the modal.
  </p>
  <p class="forge-support mb-0">
    Python: <code>render_nested_roadmap(config=…)</code> in
    <code>components/nested_roadmap.py</code>. Assets: <code>nested-roadmap.css</code>, <code>nested-roadmap.js</code>.
  </p>
</section>
<section id="sec-nrm-demo" class="ks-section">
  <h2 class="ks-section-title">Live demo</h2>
  <p class="forge-support mb-3">
    Try <em>Reliability program</em> → <em>Cell architecture</em> for three levels; try <em>Launch track</em> for two levels; compare <em>Hardening window</em> (leaf).
  </p>
  {demo}
</section>
"""
