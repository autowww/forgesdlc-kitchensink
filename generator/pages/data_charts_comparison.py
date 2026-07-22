"""Data charts — comparison category (Dcc)."""
from __future__ import annotations

from chart_showcase.common import (
    chart_kind_toc,
    extra_css,
    extra_js_paths,
    render_category_body,
)
from chart_showcase.demos import demos_by_category

_CATEGORY = "comparison"
_DEMOS = demos_by_category(_CATEGORY)

PAGE = {
    "slug": "data-charts-comparison",
    "title": "Comparison charts",
    "intro": "Clustered and stacked bar/column charts.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 14,
    "hash": "Dcc",
    "toc": [("sec-dc-cat", "Overview"), *chart_kind_toc(_DEMOS)],
}


def render() -> str:
    return render_category_body(
        title="Comparison charts",
        intro="Clustered and stacked bar/column charts for comparing categories.",
        category=_CATEGORY,
        page_hash="Dcc",
    )
