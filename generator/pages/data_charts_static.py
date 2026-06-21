"""Data charts — static JSON demos (same kinds as API-driven charts)."""
from __future__ import annotations

from components import render_ks_chart_mount

PAGE = {
    "slug": "data-charts-static",
    "title": "Data charts (static JSON)",
    "intro": "Forge data charts rendered client-side from inline JSON (no fetch).",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 12,
    "toc": [
        ("sec-dc-static", "Overview"),
        ("sec-dc-kinds", "Chart kinds"),
    ],
}


def extra_css() -> str:
    return '<link rel="stylesheet" href="assets/forge-data-charts.css">'


def extra_js_paths() -> list[str]:
    return ["assets/forge-data-charts.js"]


def render() -> str:
    blocks = [
        """<section id="sec-dc-static" class="ks-section">
  <h2 class="ks-section-title">Static JSON payloads</h2>
  <p class="forge-support mb-4">Each block uses <code>data-ks-chart-json</code> with the same shapes as
  <code>GET /api/project/&lt;name&gt;/chart-data</code> and <code>GET /api/chart-data/overview</code> in forge-lenses.
  Compare with <a href="data-charts-api.html">Data charts (API fetch)</a>.
  Static SVG diagram <em>archetypes</em> for handbooks live on <a href="diagrams.html">Diagram templates</a>;
  full diagram-as-code coverage is on <a href="diagram-code-examples.html">Diagram-as-code examples</a>.</p>
</section>""",
        '<section id="sec-dc-kinds" class="ks-section">',
        '<h2 class="ks-section-title">Chart kinds</h2>',
        '<div class="row g-4">',
    ]
    col = '<div class="col-12 col-xl-6">'

    blocks.append(col)
    blocks.append(
        render_ks_chart_mount(
            chart_id="ks-cw",
            kind="commit_weekly",
            title="Weekly commits",
            data={
                "series": [
                    {"week": "2025-W09", "count": 4},
                    {"week": "2025-W10", "count": 7},
                    {"week": "2025-W11", "count": 3},
                ]
            },
        )
    )
    blocks.append(
        render_ks_chart_mount(
            chart_id="ks-cd",
            kind="commit_daily",
            title="Daily commits",
            data={
                "series": [
                    {"day": "2025-03-28", "count": 3},
                    {"day": "2025-03-29", "count": 1},
                    {"day": "2025-03-30", "count": 2},
                ]
            },
        )
    )
    blocks.append("</div>")
    blocks.append(col)
    blocks.append(
        render_ks_chart_mount(
            chart_id="ks-loc",
            kind="loc_added_horizontal",
            title="Lines added (horizontal)",
            data={"rows": [{"name": "repo-a", "value": 120}, {"name": "repo-b", "value": 45}]},
        )
    )
    blocks.append(
        render_ks_chart_mount(
            chart_id="ks-ltb",
            kind="loc_total_bars",
            title="Total LoC bars",
            data={"rows": [{"name": "repo-a", "value": 42000}, {"name": "repo-b", "value": 12000}]},
        )
    )
    blocks.append("</div>")
    blocks.append('<div class="col-12">')
    blocks.append(
        render_ks_chart_mount(
            chart_id="ks-donut",
            kind="loc_share_donut",
            title="LoC share donut",
            data={
                "rows": [
                    {"name": "repo-a", "value": 42000},
                    {"name": "repo-b", "value": 12000},
                    {"name": "repo-c", "value": 8000},
                ],
                "top_n": 8,
            },
        )
    )
    blocks.append("</div>")
    blocks.append(col)
    blocks.append(
        render_ks_chart_mount(
            chart_id="ks-comp",
            kind="compliance_bars",
            title="Compliance scores",
            data={"rows": [["alpha", 88], ["beta", 62], ["gamma", 40]]},
        )
    )
    blocks.append(
        render_ks_chart_mount(
            chart_id="ks-ext",
            kind="extension_heatmap",
            title="Extension heatmap",
            data={"extensions": [[".py", 40], [".ts", 22]], "tracked_files": 120},
        )
    )
    blocks.append(
        render_ks_chart_mount(
            chart_id="ks-matrix",
            kind="matrix_heatmap",
            title="Layout × component matrix",
            data={
                "rows": ["article", "form", "listing"],
                "cols": ["footer", "hero", "form_block"],
                "cells": [[4, 4, 0], [9, 9, 9], [1, 1, 0]],
                "ariaLabel": "Layout archetype by component co-occurrence",
            },
        )
    )
    blocks.append("</div>")
    blocks.append(col)
    blocks.append(
        render_ks_chart_mount(
            chart_id="ks-contrib",
            kind="contributors",
            title="Contributors",
            data={"rows": [["42", "Ada"], ["12", "Bob"]]},
        )
    )
    blocks.append(
        render_ks_chart_mount(
            chart_id="ks-sub",
            kind="submodule_layout",
            title="Submodule layout (SVG fragment)",
            data={
                "svg_fragment": (
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 120" role="img" '
                    'style="width:100%;max-width:520px;height:auto">'
                    '<rect width="100%" height="100%" fill="transparent"/>'
                    '<text x="260" y="60" text-anchor="middle" fill="var(--forge-muted,#94a3b8)" '
                    'font-size="12">Sample submodule SVG</text></svg>'
                )
            },
        )
    )
    blocks.append("</div>")
    blocks.append("</div></section>")
    blocks.append(
        """<script>
document.addEventListener('DOMContentLoaded', function() {
  if (window.ForgeDataCharts) { window.ForgeDataCharts.mountAll(document); }
});
</script>"""
    )
    return "\n".join(blocks)
