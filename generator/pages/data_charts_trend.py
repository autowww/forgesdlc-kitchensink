"""Data charts — trend category (Dct)."""
from __future__ import annotations

from chart_showcase.common import chart_kind_toc, extra_css, extra_js_paths, render_category_body
from chart_showcase.demos import demos_by_category

_CATEGORY = "trend"
_DEMOS = demos_by_category(_CATEGORY)

PAGE = {
    "slug": "data-charts-trend",
    "title": "Trend charts",
    "intro": "Line, area, combo, and ribbon charts.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 15,
    "hash": "Dct",
    "toc": [("sec-dc-cat", "Overview"), *chart_kind_toc(_DEMOS)],
}


def render() -> str:
    return render_category_body(
        title="Trend charts",
        intro="Line, area, combo, and ribbon charts for time series.",
        category=_CATEGORY,
        page_hash="Dct",
    )
