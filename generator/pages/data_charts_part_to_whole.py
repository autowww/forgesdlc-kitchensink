"""Data charts — part-to-whole category (Dcp)."""
from __future__ import annotations

from chart_showcase.common import chart_kind_toc, extra_css, extra_js_paths, render_category_body
from chart_showcase.demos import demos_by_category

_CATEGORY = "part_to_whole"
_DEMOS = demos_by_category(_CATEGORY)

PAGE = {
    "slug": "data-charts-part-to-whole",
    "title": "Part-to-whole charts",
    "intro": "Pie, donut, and treemap visuals.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 16,
    "hash": "Dcp",
    "toc": [("sec-dc-cat", "Overview"), *chart_kind_toc(_DEMOS)],
}


def render() -> str:
    return render_category_body(
        title="Part-to-whole charts",
        intro="Pie, donut, and treemap visuals for composition.",
        category=_CATEGORY,
        page_hash="Dcp",
    )
