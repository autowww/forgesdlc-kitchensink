"""Data charts — tables category (Dtb)."""
from __future__ import annotations

from chart_showcase.common import chart_kind_toc, extra_css, extra_js_paths, render_category_body
from chart_showcase.demos import demos_by_category

_CATEGORY = "tables"
_DEMOS = demos_by_category(_CATEGORY)

PAGE = {
    "slug": "data-charts-tables",
    "title": "Tables & heatmaps",
    "intro": "Data tables, pivot matrices, and heatmaps.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 20,
    "hash": "Dtb",
    "toc": [("sec-dc-cat", "Overview"), *chart_kind_toc(_DEMOS)],
}


def render() -> str:
    return render_category_body(
        title="Tables & heatmaps",
        intro="Data tables, pivot matrices, and heatmaps.",
        category=_CATEGORY,
        page_hash="Dtb",
    )
