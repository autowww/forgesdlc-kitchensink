"""Data charts — correlation category (Dco)."""
from __future__ import annotations

from chart_showcase.common import chart_kind_toc, extra_css, extra_js_paths, render_category_body
from chart_showcase.demos import demos_by_category

_CATEGORY = "correlation"
_DEMOS = demos_by_category(_CATEGORY)

PAGE = {
    "slug": "data-charts-correlation",
    "title": "Correlation charts",
    "intro": "Scatter and bubble plots.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 18,
    "hash": "Dco",
    "toc": [("sec-dc-cat", "Overview"), *chart_kind_toc(_DEMOS)],
}


def render() -> str:
    return render_category_body(
        title="Correlation charts",
        intro="Scatter and bubble plots for relationship analysis.",
        category=_CATEGORY,
        page_hash="Dco",
    )
