"""Data charts hub — BI-standard catalog index (Dch)."""
from __future__ import annotations

from chart_showcase.common import (
    api_mock_url,
    category_toc_entries,
    chart_mount_script,
    demos_by_category,
    extra_css,
    extra_js_paths,
    render_demo_mount,
)
from chart_showcase.demos import CATEGORIES

PAGE = {
    "slug": "data-charts",
    "title": "Data charts",
    "intro": "BI-standard analytical charts — static JSON, per-kind API mocks, and bundle fetch.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 11,
    "hash": "Dch",
    "toc": category_toc_entries(),
}


def render() -> str:
    parts = [
        """<section id="sec-dc-overview" class="ks-section" hash="Dch" data-ks-hash="Dch" data-ks-name="data-charts">
  <h2 class="ks-section-title">Overview</h2>
  <p class="forge-support mb-3">Three showcase tiers mirror forge-lenses integration:</p>
  <ul class="forge-support mb-4">
    <li><strong>Static</strong> — inline <code>data-ks-chart-json</code> (printable, no network)</li>
    <li><strong>API mock</strong> — <code>fetch</code> per kind from <code>assets/data-charts-mocks/&lt;kind&gt;.json</code></li>
    <li><strong>Bundle</strong> — single <code>assets/data-charts-api-sample.json</code> (overview / dashboard shape)</li>
  </ul>
</section>""",
        """<section id="sec-dc-contract" class="ks-section">
  <h2 class="ks-section-title">Contract v2</h2>
  <p class="forge-support mb-3">Top-level envelope (see <code>js/forge-data-charts.md</code>):</p>
  <pre class="forge-support small p-3 mb-0" style="background:var(--forge-surface-2);border-radius:8px;overflow:auto"><code>{"version":2,"scope":"mock","charts":{"&lt;kind&gt;":{...}},"slicers":{},"groups":{}}</code></pre>
  <p class="forge-support mt-3 mb-0">Legacy forge-lenses kinds remain under the same <code>charts</code> object.</p>
</section>""",
    ]

    for cat_id, label, slug in CATEGORIES:
        demos = demos_by_category(cat_id)
        if not demos:
            continue
        preview = demos[0]
        parts.append(f'<section id="sec-dc-preview-{cat_id}" class="ks-section">')
        parts.append(
            f'<h2 class="ks-section-title">{label} '
            f'<span class="badge bg-secondary ms-2">{len(demos)} kinds</span></h2>'
        )
        parts.append(
            f'<p class="forge-support mb-3">Representative preview — full set on '
            f'<a href="{slug}.html">{slug.replace("-", " ")}</a>.</p>'
        )
        parts.append('<div class="forge-card p-3 mb-3">')
        parts.append(render_demo_mount(preview, tier="static"))
        if not preview["kind"].startswith("slicer_"):
            parts.append(
                f'<p class="forge-support small mt-2 mb-0">API mock: '
                f'<code>{api_mock_url(preview["kind"])}</code></p>'
            )
        parts.append("</div>")
        kinds = ", ".join(f'<code>{d["kind"]}</code>' for d in demos)
        parts.append(f'<p class="forge-support small mb-0">Kinds: {kinds}</p>')
        parts.append("</section>")

    parts.append("""<section id="sec-dc-tiers" class="ks-section">
  <h2 class="ks-section-title">Full catalogs</h2>
  <div class="row g-3">
    <div class="col-md-4">
      <a class="forge-card p-3 d-block text-decoration-none h-100" href="data-charts-static.html">
        <span class="card-label">Dcs · Static + API pairs</span>
        <p class="mb-0 forge-support">Every kind with side-by-side static JSON and per-kind mock fetch.</p>
      </a>
    </div>
    <div class="col-md-4">
      <a class="forge-card p-3 d-block text-decoration-none h-100" href="data-charts-api.html">
        <span class="card-label">Dca · API catalog</span>
        <p class="mb-0 forge-support">All kinds via <code>assets/data-charts-api-sample.json</code> and per-kind mocks.</p>
      </a>
    </div>
    <div class="col-md-4">
      <a class="forge-card p-3 d-block text-decoration-none h-100" href="data-charts-filters.html">
        <span class="card-label">Dcf · Slicers</span>
        <p class="mb-0 forge-support">Cross-filter dashboard demo.</p>
      </a>
    </div>
  </div>
</section>""")
    parts.append(chart_mount_script())
    return "\n".join(parts)
