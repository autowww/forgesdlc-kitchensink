"""Showcase — roadmap static, dynamic, editable tiers."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "components"))

from roadmap import (  # noqa: E402
    get_roadmap_demo_doc,
    render_roadmap_dynamic,
    render_roadmap_editable,
    render_roadmap_static,
)

ROADMAP_CSS = (
    '  <link rel="stylesheet" href="assets/nested-roadmap.css" />\n'
    '  <link rel="stylesheet" href="assets/ks-roadmap.css" />\n'
)
ROADMAP_JS = [
    "assets/ks-roadmap-layout.js",
    "assets/ks-roadmap.js",
    "assets/ks-roadmap-drag.js",
    "assets/ks-roadmap-editable.js",
]

PAGE = {
    "slug": "nested-roadmap",
    "title": "Nested roadmap",
    "intro": "Governed roadmap primitives — static SVG swimlane, dynamic drill-down, and editable drag with unified date table.",
    "family": "Components",
    "layout": "showcase",
    "order": 4.25,
    "include_diagram_expand_modal": True,
    "toc": [
        ("sec-nrm-intro", "Overview"),
        ("sec-nrm-contract", "Data contract v2"),
        ("sec-roadmap-static", "Static (printable)"),
        ("sec-roadmap-dynamic", "Dynamic (drill-down)"),
        ("sec-roadmap-editable-static", "Editable — static mode"),
        ("sec-roadmap-editable-api", "Editable — API demo"),
    ],
}


def extra_css() -> str:
    return ROADMAP_CSS


def extra_js_paths() -> list[str]:
    return list(ROADMAP_JS)


def render() -> str:
    demo = get_roadmap_demo_doc()
    static_block = render_roadmap_static(demo, mount_id="ks-rm-static")
    dynamic_block = render_roadmap_dynamic(
        demo, roadmap_id="showcase-nested-roadmap", include_modal_shell=True
    )
    editable_static = render_roadmap_editable(
        mode="static",
        mount_id="ks-rm-editable-static",
        doc=demo,
        save_demo=True,
        roadmap_id="demo-static",
    )
    editable_api = render_roadmap_editable(
        mode="dynamic",
        mount_id="ks-rm-editable-api",
        load_url="assets/roadmap-demo.json",
        save_url="",
        save_demo=True,
        roadmap_id="demo-api",
    )

    return f"""\
<section id="sec-nrm-intro" class="ks-section">
  <h2 class="ks-section-title">Overview</h2>
  <p class="forge-support mb-3">
    The <strong>Krm</strong> roadmap family shares JSON contract v2: swimlane grid
    (<code>columns</code>, <code>tracks</code>, <code>bars</code>) plus
    <code>date_rows</code> for ROADMAP.md epic dates. Three tiers:
    <strong>static</strong> (<code>Rms</code>), <strong>dynamic drill-down</strong>
    (<code>Rmd</code>), and <strong>editable</strong> (<code>Rme</code>) with bar
    move/resize along columns and a synced date table.
  </p>
</section>

<section id="sec-nrm-contract" class="ks-section">
  <h2 class="ks-section-title">Data contract v2</h2>
  <p class="forge-support mb-2">
    RoadmapDocument adds <code>roadmap_id</code>, <code>rel_path</code>, column
    <code>start</code>/<code>end</code> dates, and <code>date_rows</code> with
    Initial/Target fields. v1 Level configs upgrade automatically. Unified POST body
    documented in <code>docs/design/roadmap/API.md</code>.
  </p>
  <p class="forge-support mb-0">
    Python: <code>components/roadmap.py</code> —
    <code>render_roadmap_static</code>, <code>render_roadmap_dynamic</code>,
    <code>render_roadmap_editable</code>. Legacy <code>render_nested_roadmap</code>
    delegates to dynamic tier.
  </p>
</section>

<section id="sec-roadmap-static" class="ks-section">
  <h2 class="ks-section-title">Static (printable)</h2>
  <p class="forge-support mb-3">Server-rendered SVG swimlane — one level, print-friendly, modal zoom on click.</p>
  {static_block}
</section>

<section id="sec-roadmap-dynamic" class="ks-section">
  <h2 class="ks-section-title">Dynamic (drill-down)</h2>
  <p class="forge-support mb-3">
    Interactive grid with modal preview, tooltips, and breadcrumb navigation.
    Try <em>Reliability program</em> → <em>Cell architecture</em> for three levels.
  </p>
  {dynamic_block}
</section>

<section id="sec-roadmap-editable-static" class="ks-section">
  <h2 class="ks-section-title">Editable — static mode</h2>
  <p class="forge-support mb-3">Select bars, edit dates in the table; no drag. Save persists to <code>sessionStorage</code> (demo).</p>
  {editable_static}
</section>

<section id="sec-roadmap-editable-api" class="ks-section">
  <h2 class="ks-section-title">Editable — API demo</h2>
  <p class="forge-support mb-3">
    Loads <code>assets/roadmap-demo.json</code> via GET. Drag bars along columns; date table stays in sync. Save uses demo fallback.
  </p>
  {editable_api}
</section>"""
