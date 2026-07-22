"""Data charts — KPI category (Dck)."""
from __future__ import annotations

from chart_showcase.common import chart_kind_toc, extra_css, extra_js_paths, render_category_body
from chart_showcase.demos import demos_by_category

_CATEGORY = "kpi"
_DEMOS = demos_by_category(_CATEGORY)

PAGE = {
    "slug": "data-charts-kpi",
    "title": "KPI charts",
    "intro": "Cards, gauges, bullets, and sparklines.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 19,
    "hash": "Dck",
    "toc": [("sec-dc-cat", "Overview"), *chart_kind_toc(_DEMOS)],
}


def render() -> str:
    return render_category_body(
        title="KPI charts",
        intro="Cards, gauges, bullets, and sparklines for key metrics.",
        category=_CATEGORY,
        page_hash="Dck",
    )
