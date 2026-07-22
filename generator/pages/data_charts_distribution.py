"""Data charts — distribution & flow category (Dcd)."""
from __future__ import annotations

from chart_showcase.common import chart_kind_toc, extra_css, extra_js_paths, render_category_body
from chart_showcase.demos import demos_by_category

_CATEGORY = "distribution"
_DEMOS = demos_by_category(_CATEGORY)

PAGE = {
    "slug": "data-charts-distribution",
    "title": "Distribution & flow",
    "intro": "Histogram, box, waterfall, and funnel charts.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 17,
    "hash": "Dcd",
    "toc": [("sec-dc-cat", "Overview"), *chart_kind_toc(_DEMOS)],
}


def render() -> str:
    return render_category_body(
        title="Distribution & flow",
        intro="Histogram, box plot, waterfall, and funnel charts.",
        category=_CATEGORY,
        page_hash="Dcd",
    )
