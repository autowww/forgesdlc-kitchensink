"""Data charts — static JSON demos (Dcs)."""
from __future__ import annotations

from chart_showcase.common import (
    category_toc_entries,
    extra_css,
    extra_js_paths,
    render_catalog_body,
)
from chart_showcase.demos import CATEGORIES

PAGE = {
    "slug": "data-charts-static",
    "title": "Data charts (static JSON)",
    "intro": "Every chart kind with inline JSON and matching per-kind API mock.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 12,
    "hash": "Dcs",
    "toc": [("sec-dc-static", "Overview")],
}


def _build_toc() -> list[tuple[str, str]]:
    items = [("sec-dc-static", "Overview")]
    for cat_id, label, _slug in CATEGORIES:
        items.append((f"sec-dc-static-{cat_id}", label))
    return items


PAGE["toc"] = _build_toc()


def render() -> str:
    intro = """<section id="sec-dc-static" class="ks-section" hash="Dcs" data-ks-hash="Dcs" data-ks-name="data-charts-static">
  <h2 class="ks-section-title">Static + API mock pairs</h2>
  <p class="forge-support mb-4">Each kind is shown twice: inline <code>data-ks-chart-json</code> and
  <code>fetch</code> from <code>assets/data-charts-mocks/&lt;kind&gt;.json</code> (same payload shape as forge-lenses).
  <a href="data-charts.html">Hub</a> · <a href="data-charts-api.html">API catalog</a>.</p>
</section>"""
    return render_catalog_body(tier="static", page_hash="Dcs", intro_html=intro)
