"""Shared helpers for data chart showcase pages."""
from __future__ import annotations

from components import render_ks_chart_mount
from chart_showcase.demos import (
    API_SAMPLE_URL,
    CATEGORIES,
    CHART_CSS,
    CHART_JS,
    all_chart_demos,
    chart_mount_script,
    demos_by_category,
)

CHART_HASHES: dict[str, str] = {
    "commit_weekly": "Ch1",
    "commit_daily": "Ch2",
    "loc_added_horizontal": "Ch3",
    "loc_total_bars": "Ch4",
    "loc_share_donut": "Ch5",
    "compliance_bars": "Ch6",
    "extension_heatmap": "Ch7",
    "matrix_heatmap": "Ch8",
    "contributors": "Ch9",
    "submodule_layout": "C10",
    "column_clustered": "C11",
    "column_stacked": "C12",
    "column_stacked_100": "C13",
    "bar_stacked": "C14",
    "bar_stacked_100": "C15",
    "line": "C16",
    "area": "C17",
    "area_stacked": "C18",
    "combo_line_column": "C19",
    "ribbon": "C20",
    "pie": "C21",
    "donut": "C22",
    "treemap": "C23",
    "histogram": "C24",
    "box_plot": "C25",
    "waterfall": "C26",
    "funnel": "C27",
    "scatter": "C28",
    "bubble": "C29",
    "kpi_card": "C30",
    "gauge": "C31",
    "bullet": "C32",
    "sparkline": "C33",
    "table": "C34",
    "matrix": "C35",
    "slicer_list": "C36",
    "slicer_dropdown": "C37",
    "slicer_date_range": "C38",
}


def extra_css() -> str:
    return CHART_CSS


def extra_js_paths() -> list[str]:
    return CHART_JS


def api_mock_url(kind: str) -> str:
    return f"assets/data-charts-mocks/{kind}.json"


def _mount_id(kind: str, *, tier: str) -> str:
    return f"ks-{kind.replace('_', '-')}-{tier}"


def render_demo_mount(
    demo: dict,
    *,
    tier: str = "static",
    chart_id: str | None = None,
) -> str:
    """Render one chart mount (static inline JSON or per-kind API mock)."""
    kind = demo["kind"]
    cid = chart_id or _mount_id(kind, tier=tier)
    kwargs: dict = {
        "chart_id": cid,
        "kind": kind,
        "title": demo.get("title", kind),
        "insight": demo.get("insight", ""),
        "ks_hash": CHART_HASHES.get(kind, ""),
    }
    if demo.get("group"):
        kwargs["group"] = demo["group"]
    if tier == "api":
        kwargs["data_url"] = api_mock_url(kind)
    else:
        kwargs["data"] = demo["data"]
    return render_ks_chart_mount(**kwargs)


def render_tier_pair_inner(demo: dict) -> str:
    """Static + API mock columns (no section wrapper)."""
    kind = demo["kind"]
    mock_path = api_mock_url(kind)
    static = render_demo_mount(demo, tier="static")
    if kind.startswith("slicer_"):
        api_block = (
            '<p class="forge-support small mb-0">Slicers are client-only; see filters page for API chart mocks.</p>'
        )
    else:
        api_block = (
            f'<p class="forge-support small mb-2">Fetch: <code>{mock_path}</code></p>'
            + render_demo_mount(demo, tier="api")
        )
    return f"""<div class="forge-card p-3 mb-4">
    <div class="row g-4">
      <div class="col-lg-6">
        <p class="card-label text-cyan mb-2">Static JSON</p>
        {static}
      </div>
      <div class="col-lg-6">
        <p class="card-label text-amber mb-2">API mock</p>
        {api_block}
      </div>
    </div>
  </div>"""


def render_tier_pair(demo: dict) -> str:
    """Static + API mock with per-kind TOC anchor."""
    kind = demo["kind"]
    anchor = f"sec-dc-kind-{kind.replace('_', '-')}"
    return f"""<section id="{anchor}" class="ks-section ks-chart-demo-section">
  <h3 class="h5 mb-3">{demo.get("title", kind)} <code class="small">{kind}</code></h3>
  {render_tier_pair_inner(demo)}
</section>"""


def chart_kind_toc(demos: list[dict]) -> list[tuple[str, str]]:
    return [
        (f"sec-dc-kind-{d['kind'].replace('_', '-')}", d.get("title", d["kind"]))
        for d in demos
    ]


def render_category_body(
    *,
    title: str,
    intro: str,
    category: str,
    page_hash: str,
) -> str:
    demos = demos_by_category(category)
    parts = [
        f'<section id="sec-dc-cat" class="ks-section" hash="{page_hash}" data-ks-hash="{page_hash}">',
        f'<h2 class="ks-section-title">{title}</h2>',
        f'<p class="forge-support mb-4">{intro} '
        f'<a href="data-charts.html">Hub</a> · '
        f'<a href="data-charts-static.html">Static catalog</a> · '
        f'<a href="data-charts-api.html">API catalog</a>.</p>',
        f'<p class="forge-support mb-0"><strong>{len(demos)}</strong> kinds — each block shows '
        f'inline JSON and a per-kind fetch mock under <code>assets/data-charts-mocks/</code>.</p>',
        "</section>",
    ]
    for demo in demos:
        parts.append(render_tier_pair(demo))
    parts.append(chart_mount_script())
    return "\n".join(parts)


def render_catalog_body(*, tier: str, page_hash: str, intro_html: str) -> str:
    """Full catalog grouped by BI category (static-only or api-only tier pages)."""
    parts = [intro_html]
    by_cat: dict[str, list] = {}
    for demo in all_chart_demos():
        if tier == "api" and demo["kind"].startswith("slicer_"):
            continue
        by_cat.setdefault(demo.get("category", "other"), []).append(demo)

    for cat_id, label, cat_slug in CATEGORIES:
        if tier == "api" and cat_id == "filters":
            continue
        demos = by_cat.get(cat_id, [])
        if not demos:
            continue
        parts.append(f'<section id="sec-dc-{tier}-{cat_id}" class="ks-section">')
        parts.append(
            f'<h2 class="ks-section-title">{label} '
            f'<a class="small ms-2" href="{cat_slug}.html">category page</a></h2>'
        )
        for demo in demos:
            if tier == "static":
                parts.append(render_tier_pair_inner(demo))
            else:
                parts.append(
                    f'<section id="sec-dc-kind-{demo["kind"].replace("_", "-")}" class="ks-section">'
                    f'<h3 class="h5">{demo["title"]} <code>{demo["kind"]}</code></h3>'
                    f'<div class="forge-card p-3 mb-4">'
                    f'<p class="forge-support small mb-2">Bundle: <code>{API_SAMPLE_URL}</code> · '
                    f'Mock: <code>{api_mock_url(demo["kind"])}</code></p>'
                    f'{render_demo_mount(demo, tier="api")}'
                    f'</div></section>'
                )
        parts.append("</section>")
    parts.append(chart_mount_script())
    return "\n".join(parts)


def category_toc_entries() -> list[tuple[str, str]]:
    items: list[tuple[str, str]] = [("sec-dc-overview", "Overview"), ("sec-dc-contract", "Contract")]
    for cat_id, label, _slug in CATEGORIES:
        items.append((f"sec-dc-preview-{cat_id}", label))
    items.append(("sec-dc-tiers", "Catalog tiers"))
    return items
