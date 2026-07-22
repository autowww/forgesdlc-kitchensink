"""Central demo registry for KS data charts (Dcs, Dca, category pages)."""
from __future__ import annotations

from typing import Any

CHART_CSS = '<link rel="stylesheet" href="assets/forge-data-charts.css">\n'
CHART_JS = [
    "assets/charts/core.js",
    "assets/charts/legacy.js",
    "assets/charts/comparison.js",
    "assets/charts/trend.js",
    "assets/charts/part-to-whole.js",
    "assets/charts/distribution.js",
    "assets/charts/flow.js",
    "assets/charts/correlation.js",
    "assets/charts/kpi.js",
    "assets/charts/table.js",
    "assets/charts/slicer.js",
    "assets/forge-data-charts.js",
]

API_SAMPLE_URL = "assets/data-charts-api-sample.json"


def chart_mount_script() -> str:
    return """<script>
document.addEventListener('DOMContentLoaded', function() {
  if (window.ForgeDataCharts) { window.ForgeDataCharts.mountAll(document); }
});
</script>"""


# Legacy kinds (forge-lenses compatible)
_LEGACY_DEMOS: list[dict[str, Any]] = [
    {
        "kind": "commit_weekly",
        "title": "Weekly commits",
        "insight": "Commit volume peaked in week 10 before tapering.",
        "category": "comparison",
        "data": {
            "series": [
                {"week": "2025-W09", "count": 4},
                {"week": "2025-W10", "count": 7},
                {"week": "2025-W11", "count": 3},
            ]
        },
    },
    {
        "kind": "commit_daily",
        "title": "Daily commits",
        "insight": "Seven-day window shows steady mid-week activity.",
        "category": "comparison",
        "data": {
            "series": [
                {"day": "2025-03-28", "count": 3},
                {"day": "2025-03-29", "count": 1},
                {"day": "2025-03-30", "count": 2},
            ]
        },
    },
    {
        "kind": "loc_added_horizontal",
        "title": "Lines added (horizontal)",
        "insight": "Repo alpha leads new line additions.",
        "category": "comparison",
        "data": {"rows": [{"name": "repo-a", "value": 120}, {"name": "repo-b", "value": 45}]},
    },
    {
        "kind": "loc_total_bars",
        "title": "Total LoC bars",
        "insight": "Total footprint skews toward repo-a.",
        "category": "comparison",
        "data": {"rows": [{"name": "repo-a", "value": 42000}, {"name": "repo-b", "value": 12000}]},
    },
    {
        "kind": "loc_share_donut",
        "title": "LoC share donut",
        "insight": "Top two repos account for most lines of code.",
        "category": "part_to_whole",
        "data": {
            "rows": [
                {"name": "repo-a", "value": 42000},
                {"name": "repo-b", "value": 12000},
                {"name": "repo-c", "value": 8000},
            ],
            "top_n": 8,
        },
    },
    {
        "kind": "compliance_bars",
        "title": "Compliance scores",
        "insight": "Alpha passes threshold; gamma needs remediation.",
        "category": "comparison",
        "data": {"rows": [["alpha", 88], ["beta", 62], ["gamma", 40]]},
    },
    {
        "kind": "extension_heatmap",
        "title": "Extension heatmap",
        "insight": "Python files dominate tracked extensions.",
        "category": "tables",
        "data": {"extensions": [[".py", 40], [".ts", 22]], "tracked_files": 120},
    },
    {
        "kind": "matrix_heatmap",
        "title": "Layout × component matrix",
        "insight": "Article and form layouts share hero and footer components.",
        "category": "tables",
        "data": {
            "rows": ["article", "form", "listing"],
            "cols": ["footer", "hero", "form_block"],
            "cells": [[4, 4, 0], [9, 9, 9], [1, 1, 0]],
            "ariaLabel": "Layout archetype by component co-occurrence",
        },
    },
    {
        "kind": "contributors",
        "title": "Contributors",
        "insight": "Ada leads commit count in this sample window.",
        "category": "tables",
        "data": {"rows": [["42", "Ada"], ["12", "Bob"]]},
    },
    {
        "kind": "submodule_layout",
        "title": "Submodule layout (SVG fragment)",
        "insight": "Server-rendered SVG escape hatch for custom diagrams.",
        "category": "tables",
        "data": {
            "svg_fragment": (
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 120" role="img" '
                'style="width:100%;max-width:520px;height:auto">'
                '<rect width="100%" height="100%" fill="transparent"/>'
                '<text x="260" y="60" text-anchor="middle" fill="var(--forge-muted,#94a3b8)" '
                'font-size="12">Sample submodule SVG</text></svg>'
            )
        },
    },
]

_BI_DEMOS: list[dict[str, Any]] = [
    {
        "kind": "column_clustered",
        "title": "Clustered column",
        "insight": "Q1 leads revenue across regions in the demo series.",
        "category": "comparison",
        "data": {
            "categories": ["Q1", "Q2", "Q3"],
            "series": [
                {"name": "North", "values": [42, 38, 51]},
                {"name": "South", "values": [28, 35, 40]},
            ],
        },
    },
    {
        "kind": "column_stacked",
        "title": "Stacked column",
        "insight": "Stacked segments show product mix by quarter.",
        "category": "comparison",
        "data": {
            "categories": ["Q1", "Q2", "Q3"],
            "series": [
                {"name": "Core", "values": [30, 28, 32]},
                {"name": "Add-on", "values": [12, 18, 19]},
            ],
        },
    },
    {
        "kind": "column_stacked_100",
        "title": "100% stacked column",
        "insight": "Share of mix shifts toward add-ons in Q3.",
        "category": "comparison",
        "data": {
            "categories": ["Q1", "Q2", "Q3"],
            "series": [
                {"name": "Core", "values": [30, 28, 32]},
                {"name": "Add-on", "values": [12, 18, 19]},
            ],
        },
    },
    {
        "kind": "bar_stacked",
        "title": "Stacked bar",
        "insight": "Horizontal stacks compare teams by initiative.",
        "category": "comparison",
        "data": {
            "categories": ["Team A", "Team B"],
            "series": [
                {"name": "Done", "values": [18, 22]},
                {"name": "WIP", "values": [6, 4]},
            ],
        },
    },
    {
        "kind": "bar_stacked_100",
        "title": "100% stacked bar",
        "insight": "Completion share is higher on Team B.",
        "category": "comparison",
        "data": {
            "categories": ["Team A", "Team B"],
            "series": [
                {"name": "Done", "values": [18, 22]},
                {"name": "WIP", "values": [6, 4]},
            ],
        },
    },
    {
        "kind": "line",
        "title": "Line chart",
        "insight": "Latency trend improves after week 3.",
        "category": "trend",
        "data": {
            "categories": ["W1", "W2", "W3", "W4"],
            "series": [{"name": "p95 ms", "values": [120, 110, 95, 88]}],
        },
    },
    {
        "kind": "area",
        "title": "Area chart",
        "insight": "Active users grow steadily through the period.",
        "category": "trend",
        "data": {
            "categories": ["Jan", "Feb", "Mar", "Apr"],
            "series": [{"name": "Users", "values": [100, 130, 155, 180]}],
        },
    },
    {
        "kind": "area_stacked",
        "title": "Stacked area",
        "insight": "Organic channel drives most of the stacked growth.",
        "category": "trend",
        "data": {
            "categories": ["Jan", "Feb", "Mar"],
            "series": [
                {"name": "Organic", "values": [40, 55, 70]},
                {"name": "Paid", "values": [20, 25, 30]},
            ],
        },
    },
    {
        "kind": "combo_line_column",
        "title": "Line and column combo",
        "insight": "Volume rises while error rate falls.",
        "category": "trend",
        "data": {
            "categories": ["W1", "W2", "W3", "W4"],
            "columns": [{"name": "Requests", "values": [1000, 1200, 1400, 1600]}],
            "lines": [{"name": "Error %", "values": [2.1, 1.8, 1.4, 1.1]}],
        },
    },
    {
        "kind": "ribbon",
        "title": "Ribbon chart",
        "insight": "Rank order shifts between categories over time.",
        "category": "trend",
        "data": {
            "categories": ["T1", "T2", "T3"],
            "series": [
                {"name": "A", "values": [3, 1, 2]},
                {"name": "B", "values": [1, 2, 3]},
                {"name": "C", "values": [2, 3, 1]},
            ],
        },
    },
    {
        "kind": "pie",
        "title": "Pie chart",
        "insight": "Segment A is the largest share of the whole.",
        "category": "part_to_whole",
        "data": {"rows": [{"name": "A", "value": 45}, {"name": "B", "value": 30}, {"name": "C", "value": 25}]},
    },
    {
        "kind": "donut",
        "title": "Donut chart",
        "insight": "Donut shows same shares as pie with center cutout.",
        "category": "part_to_whole",
        "data": {
            "rows": [{"name": "A", "value": 45}, {"name": "B", "value": 30}, {"name": "C", "value": 25}],
            "top_n": 8,
        },
    },
    {
        "kind": "treemap",
        "title": "Treemap",
        "insight": "Larger rectangles represent higher values in the hierarchy.",
        "category": "part_to_whole",
        "data": {
            "rows": [
                {"name": "Platform", "value": 50},
                {"name": "Product", "value": 30},
                {"name": "Ops", "value": 20},
            ]
        },
    },
    {
        "kind": "histogram",
        "title": "Histogram",
        "insight": "Most samples fall in the 10–20 bin.",
        "category": "distribution",
        "data": {"bins": [{"label": "0-10", "count": 5}, {"label": "10-20", "count": 12}, {"label": "20-30", "count": 7}]},
    },
    {
        "kind": "box_plot",
        "title": "Box plot",
        "insight": "Team B shows a wider spread than Team A.",
        "category": "distribution",
        "data": {
            "boxes": [
                {"name": "Team A", "min": 10, "q1": 20, "median": 28, "q3": 35, "max": 42},
                {"name": "Team B", "min": 5, "q1": 15, "median": 22, "q3": 38, "max": 50},
            ]
        },
    },
    {
        "kind": "waterfall",
        "title": "Waterfall",
        "insight": "Net change is positive after costs and adjustments.",
        "category": "distribution",
        "data": {
            "steps": [
                {"label": "Start", "value": 100, "type": "total"},
                {"label": "Revenue", "value": 40, "type": "increase"},
                {"label": "Cost", "value": -25, "type": "decrease"},
                {"label": "End", "value": 115, "type": "total"},
            ]
        },
    },
    {
        "kind": "funnel",
        "title": "Funnel",
        "insight": "Largest drop-off occurs between trial and paid.",
        "category": "distribution",
        "data": {
            "stages": [
                {"label": "Visit", "value": 1000},
                {"label": "Signup", "value": 400},
                {"label": "Trial", "value": 200},
                {"label": "Paid", "value": 80},
            ]
        },
    },
    {
        "kind": "scatter",
        "title": "Scatter plot",
        "insight": "Points show positive correlation between x and y.",
        "category": "correlation",
        "data": {
            "points": [
                {"x": 1, "y": 2, "label": "a"},
                {"x": 2, "y": 4, "label": "b"},
                {"x": 3, "y": 5, "label": "c"},
                {"x": 4, "y": 7, "label": "d"},
            ]
        },
    },
    {
        "kind": "bubble",
        "title": "Bubble chart",
        "insight": "Bubble size encodes a third metric.",
        "category": "correlation",
        "data": {
            "points": [
                {"x": 2, "y": 3, "size": 10},
                {"x": 4, "y": 6, "size": 25},
                {"x": 6, "y": 5, "size": 15},
            ]
        },
    },
    {
        "kind": "kpi_card",
        "title": "KPI card",
        "insight": "Single metric with delta vs prior period.",
        "category": "kpi",
        "data": {"label": "Active users", "value": "1,240", "delta": "+8.2%", "trend": "up"},
    },
    {
        "kind": "gauge",
        "title": "Gauge",
        "insight": "SLO attainment is in the green band.",
        "category": "kpi",
        "data": {"label": "SLO", "value": 92, "min": 0, "max": 100, "target": 95},
    },
    {
        "kind": "bullet",
        "title": "Bullet chart",
        "insight": "Actual exceeds poor threshold but below target.",
        "category": "kpi",
        "data": {"label": "Revenue", "actual": 72, "poor": 50, "satisfactory": 70, "good": 90},
    },
    {
        "kind": "sparkline",
        "title": "Sparkline",
        "insight": "Micro trend for inline table cells.",
        "category": "kpi",
        "data": {"values": [3, 5, 4, 7, 6, 8, 9]},
    },
    {
        "kind": "table",
        "title": "Data table",
        "insight": "Generic tabular data with column headers.",
        "category": "tables",
        "data": {
            "columns": ["Region", "Revenue", "Growth"],
            "rows": [["North", "120k", "8%"], ["South", "95k", "5%"]],
        },
    },
    {
        "kind": "matrix",
        "title": "Matrix (pivot)",
        "insight": "Pivot table with row and column headers.",
        "category": "tables",
        "data": {
            "row_headers": ["2024", "2025"],
            "col_headers": ["Q1", "Q2"],
            "cells": [[10, 12], [14, 16]],
        },
    },
]

_FILTER_DEMOS: list[dict[str, Any]] = [
    {
        "kind": "slicer_list",
        "title": "List slicer",
        "insight": "Filter charts by region selection.",
        "category": "filters",
        "data": {
            "field": "region",
            "values": ["North", "South", "East"],
            "selected": ["North", "South"],
        },
        "group": "dashboard-demo",
    },
    {
        "kind": "slicer_dropdown",
        "title": "Dropdown slicer",
        "insight": "Single-select product filter.",
        "category": "filters",
        "data": {
            "field": "product",
            "values": ["Core", "Add-on", "All"],
            "selected": "Core",
        },
        "group": "dashboard-demo",
    },
    {
        "kind": "slicer_date_range",
        "title": "Date range slicer",
        "insight": "Filter time series by start/end dates.",
        "category": "filters",
        "data": {"field": "day", "start": "2025-03-28", "end": "2025-03-30"},
        "group": "dashboard-demo",
    },
]


def all_chart_demos() -> list[dict[str, Any]]:
    return _LEGACY_DEMOS + _BI_DEMOS + _FILTER_DEMOS


def demos_by_category(category: str) -> list[dict[str, Any]]:
    return [d for d in all_chart_demos() if d.get("category") == category]


def api_sample_bundle() -> dict[str, Any]:
    charts: dict[str, Any] = {}
    for d in all_chart_demos():
        if d["kind"].startswith("slicer_"):
            continue
        charts[d["kind"]] = d["data"]
    return {
        "version": 2,
        "scope": "sample",
        "charts": charts,
        "slicers": {
            "region": {
                "type": "list",
                "field": "region",
                "values": ["North", "South", "East"],
            }
        },
        "groups": {
            "dashboard-demo": [
                "line",
                "column_clustered",
                "pie",
            ]
        },
    }


CATEGORIES = [
    ("comparison", "Comparison", "data-charts-comparison"),
    ("trend", "Trend", "data-charts-trend"),
    ("part_to_whole", "Part-to-whole", "data-charts-part-to-whole"),
    ("distribution", "Distribution & flow", "data-charts-distribution"),
    ("correlation", "Correlation", "data-charts-correlation"),
    ("kpi", "KPI", "data-charts-kpi"),
    ("tables", "Tables", "data-charts-tables"),
    ("filters", "Filters", "data-charts-filters"),
]
