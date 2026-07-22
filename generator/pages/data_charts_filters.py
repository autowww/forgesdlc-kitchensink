"""Data charts — filters & cross-filter dashboard (Dcf)."""
from __future__ import annotations

from chart_showcase.common import (
    chart_kind_toc,
    chart_mount_script,
    extra_css,
    extra_js_paths,
    render_tier_pair,
)
from chart_showcase.demos import demos_by_category
from components import render_ks_chart_mount

_SLICERS = demos_by_category("filters")

PAGE = {
    "slug": "data-charts-filters",
    "title": "Chart filters (slicers)",
    "intro": "List, dropdown, and date-range slicers with client-side cross-filter.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 21,
    "hash": "Dcf",
    "toc": [
        ("sec-dc-filters", "Overview"),
        *chart_kind_toc(_SLICERS),
        ("sec-dc-dashboard", "Cross-filter dashboard"),
    ],
}


def render() -> str:
    parts = [
        """<section id="sec-dc-filters" class="ks-section" hash="Dcf" data-ks-hash="Dcf">
  <h2 class="ks-section-title">Slicers</h2>
  <p class="forge-support mb-4">Static-first cross-filter via <code>ForgeDataCharts.SlicerBus</code>.
  Slicers use <code>data-ks-chart-group</code> to filter linked charts on the same page.
  <a href="data-charts.html">Hub</a>.</p>
</section>""",
    ]
    for demo in _SLICERS:
        parts.append(render_tier_pair(demo))

    parts.append("""<section id="sec-dc-dashboard" class="ks-section">
  <h2 class="ks-section-title">Cross-filter dashboard</h2>
  <p class="forge-support mb-3" data-chart-summary>Change the region slicer to re-render linked charts (group <code>dashboard-demo</code>).</p>
  <div class="forge-card p-3 mb-4">
    <div class="row g-4">
      <div class="col-12 col-md-4">""")
    parts.append(
        render_ks_chart_mount(
            chart_id="dash-slicer-region",
            kind="slicer_list",
            title="Region slicer",
            insight="Select regions to filter linked charts.",
            data={"field": "region", "values": ["North", "South", "East"], "selected": ["North", "South"]},
            group="dashboard-demo",
            ks_hash="C36",
        )
    )
    parts.append("""</div>
      <div class="col-12 col-xl-4">""")
    parts.append(
        render_ks_chart_mount(
            chart_id="dash-line",
            kind="line",
            title="Latency (API mock)",
            insight="Fetched from per-kind mock on change.",
            data_url="assets/data-charts-mocks/line.json",
            group="dashboard-demo",
            ks_hash="C16",
        )
    )
    parts.append("""</div>
      <div class="col-12 col-xl-4">""")
    parts.append(
        render_ks_chart_mount(
            chart_id="dash-column",
            kind="column_clustered",
            title="Revenue (API mock)",
            insight="Companion chart in the same filter group.",
            data_url="assets/data-charts-mocks/column_clustered.json",
            group="dashboard-demo",
            ks_hash="C11",
        )
    )
    parts.append("</div></div></div></section>")
    parts.append(chart_mount_script())
    return "\n".join(parts)
