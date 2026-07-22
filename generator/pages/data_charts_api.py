"""Data charts — fetch JSON bundle (Dca)."""
from __future__ import annotations

from chart_showcase.common import extra_css, extra_js_paths, render_catalog_body
from chart_showcase.demos import API_SAMPLE_URL, CATEGORIES

PAGE = {
    "slug": "data-charts-api",
    "title": "Data charts (API fetch)",
    "intro": "Charts loaded via fetch — per-kind mocks and full bundle.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 13,
    "hash": "Dca",
    "toc": [("sec-dc-api", "Overview")],
}


def _build_toc() -> list[tuple[str, str]]:
    items = [("sec-dc-api", "Overview"), ("sec-dc-api-bundle", "Bundle demo")]
    for cat_id, label, _slug in CATEGORIES:
        if cat_id == "filters":
            continue
        items.append((f"sec-dc-api-{cat_id}", label))
    return items


PAGE["toc"] = _build_toc()


def render() -> str:
    intro = f"""<section id="sec-dc-api" class="ks-section" hash="Dca" data-ks-hash="Dca" data-ks-name="data-charts-api">
  <h2 class="ks-section-title">API fetch catalog</h2>
  <p class="forge-support mb-4">Mocks mirror <code>GET /api/project/&lt;name&gt;/chart-data</code> in forge-lenses.
  <a href="data-charts.html">Hub</a> · <a href="data-charts-static.html">Static pairs</a>.</p>
</section>
<section id="sec-dc-api-bundle" class="ks-section">
  <h2 class="ks-section-title">Full bundle</h2>
  <p class="forge-support mb-3">Single fetch returns all chart payloads — use for overview dashboards.</p>
  <p class="forge-support small mb-0"><code>{API_SAMPLE_URL}</code></p>
</section>"""
    return render_catalog_body(tier="api", page_hash="Dca", intro_html=intro)
