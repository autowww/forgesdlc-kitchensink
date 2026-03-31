"""Data charts — fetch same JSON bundle via URL (mirrors lenses API shape)."""
from __future__ import annotations

from components import render_ks_chart_mount

PAGE = {
    "slug": "data-charts-api",
    "title": "Data charts (API fetch)",
    "intro": "Same chart kinds as static page; data loaded with fetch from assets/data-charts-api-sample.json.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 13,
    "toc": [("sec-dc-api", "Overview"), ("sec-dc-api-kinds", "Fetched charts")],
}


def extra_css() -> str:
    return '<link rel="stylesheet" href="assets/forge-data-charts.css">'


def extra_js_paths() -> list[str]:
    return ["assets/forge-data-charts.js"]


def render() -> str:
    base = "assets/data-charts-api-sample.json"
    kinds = [
        ("commit_weekly", "Weekly commits"),
        ("commit_daily", "Daily commits"),
        ("loc_added_horizontal", "Lines added"),
        ("loc_total_bars", "Total LoC"),
        ("loc_share_donut", "LoC donut"),
        ("compliance_bars", "Compliance"),
        ("extension_heatmap", "Extensions"),
        ("contributors", "Contributors"),
        ("submodule_layout", "Submodule layout"),
    ]
    parts = [
        """<section id="sec-dc-api" class="ks-section">
  <h2 class="ks-section-title">API-shaped bundle</h2>
  <p class="forge-support mb-4">Each mount uses <code>data-ks-chart-url</code> pointing at a static JSON file
  with a <code>charts</code> object (same envelope as forge-lenses). In lenses, the URL is
  <code>/api/project/&lt;name&gt;/chart-data</code> or <code>/api/chart-data/overview</code>.
  See also <a href="data-charts-static.html">Data charts (static JSON)</a>.
  For static SVG diagram tiles and diagram-as-code samples, see <a href="diagrams.html">Diagram templates</a> and
  <a href="diagram-code-examples.html">Diagram-as-code examples</a>.</p>
</section>""",
        '<section id="sec-dc-api-kinds" class="ks-section">',
        '<h2 class="ks-section-title">Charts</h2>',
        '<div class="row g-4">',
    ]
    for kind, title in kinds:
        parts.append('<div class="col-12 col-xl-6">')
        parts.append(
            render_ks_chart_mount(
                chart_id="api-" + kind.replace("_", "-"),
                kind=kind,
                title=title,
                data_url=base,
            )
        )
        parts.append("</div>")
    parts.append("</div></section>")
    parts.append(
        """<script>
document.addEventListener('DOMContentLoaded', function() {
  if (window.ForgeDataCharts) { window.ForgeDataCharts.mountAll(document); }
});
</script>"""
    )
    return "\n".join(parts)
