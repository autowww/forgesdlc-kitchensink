"""Page Layouts page — documents all available layout templates."""
from __future__ import annotations

import html

PAGE = {
    "slug": "layouts",
    "title": "Page Layouts",
    "intro": "All available layout templates for building sites.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 8,
    "include_diagram_expand_modal": True,
    "toc": [
        ("sec-layout-intro", "Overview"),
        ("sec-showcase", "Showcase"),
        ("sec-landing", "Landing"),
        ("sec-gallery", "Gallery"),
        ("sec-split", "Split"),
        ("sec-handbook", "Handbook"),
        ("sec-chapter", "Chapter"),
        ("sec-product", "Product"),
    ],
}


def extra_css() -> str:
    return """\
  <style>
    .ks-layout-visual img {
      border: 1px solid var(--forge-border);
      border-radius: 8px;
      display: block;
    }
    .ks-layout-wireframe-fallback {
      margin-top: 0.5rem;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px dashed var(--forge-border);
      color: var(--forge-text-3);
    }
    .layout-preview-iframe {
      display: block;
      width: 100%;
      min-height: min(72vh, 780px);
      height: 72vh;
      border: 1px solid var(--forge-border);
      border-radius: 8px;
      background: var(--forge-bg);
    }
    .ks-layout-preview-hint {
      font-size: 0.8rem;
      color: var(--forge-text-3);
    }
  </style>"""


def _layout_section(
    anchor: str,
    name: str,
    description: str,
    params: list[tuple[str, str, str]],
    used_by: str,
    layout_key: str,
    svg_file: str,
    structure_bullets: list[str],
) -> str:
    rows = "".join(
        f"<tr><td><code>{html.escape(p)}</code></td><td>{html.escape(t)}</td><td>{html.escape(d)}</td></tr>"
        for p, t, d in params
    )
    bullets = "".join(f"<li>{html.escape(b)}</li>" for b in structure_bullets)
    live_label = f"Open live HTML preview for {name}"
    return f"""\
<section id="{html.escape(anchor)}" class="ks-section">
  <h2 class="ks-section-title">{html.escape(name)}</h2>
  <p class="forge-support mb-3">{html.escape(description)}</p>
  <div class="forge-callout forge-callout-surface mb-3">
    <p class="callout-label">How the regions connect</p>
    <ul class="forge-support mb-0 small" style="line-height:1.55">{bullets}</ul>
    <div class="ks-layout-visual mt-3 mb-2">
      <img src="./assets/svg/{html.escape(svg_file)}" alt="Static schematic: {html.escape(name)}" width="400" height="260" loading="lazy" class="w-100" decoding="async" onerror="this.style.display='none';var f=this.nextElementSibling;if(f) f.hidden=false;">
      <p class="ks-layout-wireframe-fallback mb-0" hidden>Wireframe SVG did not load (missing <code>assets/svg/</code> copy or wrong page URL). Use <strong>Open live preview</strong> below for the real layout.</p>
    </div>
    <button type="button" class="btn btn-forge btn-sm" onclick="openLayoutPreview('{html.escape(layout_key)}')" aria-label="{html.escape(live_label)}">Open live preview</button>
    <span class="ks-layout-preview-hint d-block mt-2">Embeds a real example page in the modal (iframe). Diagram above is a static wireframe only.</span>
  </div>
  <div class="forge-table-wrap mb-3">
    <table class="table table-striped mb-0">
      <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>{rows}</tbody>
    </table>
  </div>
  <div class="forge-callout forge-callout-surface">
    <p class="callout-label">Used by</p>
    <p class="mb-0">{html.escape(used_by)}</p>
  </div>
</section>"""


def render() -> str:
    intro = """\
<section id="sec-layout-intro" class="ks-section">
  <h2 class="ks-section-title">Reading the layouts</h2>
  <p class="forge-support mb-3">Each template below is a <strong>Python function</strong> in <code>components/layouts.py</code> that assembles a full HTML page from fragments (headers, sidebars, <code>body_html</code>, etc.). Names like <code>showcase_page</code> map to those functions.</p>
  <div class="forge-callout forge-callout-cyan mb-3">
    <p class="callout-label">Canonical doc shell</p>
    <p class="forge-support mb-0"><code>showcase_page</code> is the <strong>canonical layout</strong> for generated static documentation in sibling projects. Use <code>generator/build-showcase.py</code> as the reference for how to call it. The other layouts below are <strong>legacy or specialized</strong> (landing/hero, gallery grids, split panels, blueprint handbook/chapter/product shells)—use them only when you have a specific need.</p>
  </div>
  <div class="forge-callout forge-callout-surface mb-0">
    <p class="callout-label">What the schematic shows</p>
    <ul class="forge-support mb-0 small" style="line-height:1.55">
      <li><strong>Wireframe diagrams</strong> (below each section) are static SVGs — they only illustrate region names.</li>
      <li><strong>Open live preview</strong> loads a real built page inside an <strong>iframe</strong> in the modal, with a short region legend on the right.</li>
      <li>Showcase, landing, and gallery reuse existing pages (<code>tokens.html</code>, <code>index.html</code>, <code>diagrams.html</code>); split, handbook, chapter, and product use generated <code>preview-*.html</code> files from the build.</li>
    </ul>
  </div>
</section>"""

    sections = [
        _layout_section(
            "sec-showcase",
            "showcase_page",
            "Documentation reference layout: unified sticky header + sidebar + content + optional right-rail ToC. "
            "This is the primary layout for component documentation sites.",
            [
                ("browser_title", "str", "HTML <title> value"),
                ("page_title", "str", "Visible H1 in header bar"),
                ("sidebar_html", "str", "Sidebar navigation markup"),
                ("body_html", "str", "Main content area HTML"),
                ("toc_html", "str", "Right-rail table of contents (optional)"),
                ("extra_css", "str", "Additional inline <style> block"),
                ("extra_js", "list[str]", "Paths to extra JS files"),
            ],
            "Kitchen Sink showcase mini-site (this site) — canonical reference for external generators",
            "layout-showcase",
            "layout-schematic-showcase.svg",
            [
                "Top: sticky site header (brand + breadcrumb + page title).",
                "Left: scrollable sidebar below the header.",
                "Center: main article column (body_html).",
                "Right: optional ToC (toc_html); omit for two-column layouts like gallery.",
            ],
        ),
        _layout_section(
            "sec-landing",
            "landing_page",
            "Full-width hero page with no sidebar. Ideal for homepages and overview pages.",
            [
                ("browser_title", "str", "HTML <title> value"),
                ("hero_html", "str", "Hero section content"),
                ("body_html", "str", "Body content below hero"),
                ("nav_links_html", "str", "Top navigation bar links"),
                ("footer_html", "str", "Footer HTML (optional)"),
            ],
            "Kitchen Sink landing page",
            "layout-landing",
            "layout-schematic-landing.svg",
            [
                "Vertical stack: no left sidebar; content uses full width.",
                "Nav is a single top bar; hero and body are separate slots.",
            ],
        ),
        _layout_section(
            "sec-gallery",
            "gallery_page",
            "Sidebar + card grid content area, no right-rail ToC. Good for catalogs and asset browsers.",
            [
                ("browser_title", "str", "HTML <title> value"),
                ("page_title", "str", "Visible H1 in header bar"),
                ("sidebar_html", "str", "Sidebar navigation markup"),
                ("body_html", "str", "Grid content area HTML"),
            ],
            "Kitchen Sink diagram gallery",
            "layout-gallery",
            "layout-schematic-gallery.svg",
            [
                "Same outer shell as showcase (header + sidebar).",
                "Main column is wider — intended for card grids or diagram thumbnails, not a ToC column.",
            ],
        ),
        _layout_section(
            "sec-split",
            "split_page",
            "Sidebar + two-panel content: live example on the left, documentation on the right. Stacks vertically on mobile.",
            [
                ("browser_title", "str", "HTML <title> value"),
                ("page_title", "str", "Visible H1 in header bar"),
                ("sidebar_html", "str", "Sidebar navigation markup"),
                ("left_html", "str", "Left panel (example / preview)"),
                ("right_html", "str", "Right panel (description / code)"),
            ],
            "Available for component detail pages",
            "layout-split",
            "layout-schematic-split.svg",
            [
                "After the shared header + sidebar, the main area splits into two columns.",
                "Left: demo / preview; right: prose or API docs.",
            ],
        ),
        _layout_section(
            "sec-handbook",
            "handbook_page",
            "Auto-generated handbook page with 3-column layout (sidebar, content, ToC). Used by blueprints-website.",
            [
                ("browser_title", "str", "HTML <title> value"),
                ("page_title", "str", "Visible H1"),
                ("sidebar_html", "str", "Sidebar navigation markup"),
                ("body_html", "str", "Main content (from Markdown)"),
                ("toc_html", "str", "Right-rail ToC"),
            ],
            "blueprints-website (bpw)",
            "layout-handbook",
            "layout-schematic-handbook.svg",
            [
                "No separate “site header” band: sidebar and main start at the top of the viewport.",
                "Three columns: nav | article | section ToC.",
            ],
        ),
        _layout_section(
            "sec-chapter",
            "chapter_page",
            "Hand-crafted methodology chapter layout with JS-driven sidebar. Uses docs-theme.css.",
            [
                ("browser_title", "str", "HTML <title> value"),
                ("page_title", "str", "Visible H1"),
                ("sidebar_html", "str", "Chapter sidebar markup"),
                ("body_html", "str", "Chapter content"),
            ],
            "blueprints-website methodology chapters",
            "layout-chapter",
            "layout-schematic-handbook.svg",
            [
                "Same 3-column grid as handbook; the schematic is shared.",
                "Difference: sidebar markup is filled by client-side JS (nav JSON), not only server HTML.",
            ],
        ),
        _layout_section(
            "sec-product",
            "product_page",
            "Product / marketing layout with tier-grouped sidebar. Uses forgesdlc-theme.css with fs-* classes.",
            [
                ("browser_title", "str", "HTML <title> value"),
                ("page_title", "str", "Visible H1"),
                ("sidebar_html", "str", "Product tier navigation"),
                ("body_html", "str", "Product page content"),
            ],
            "forgesdlc.com (forge)",
            "layout-product",
            "layout-schematic-product.svg",
            [
                "Mobile-first: optional top bar triggers offcanvas on small screens.",
                "Desktop: tier-grouped sidebar + wide article column (different theme classes than Forge docs).",
            ],
        ),
    ]

    modal = """\
<div id="diagramModal" class="diagram-modal-backdrop">
  <div class="diagram-modal">
    <div class="diagram-modal-header">
      <h3 id="diagramModalTitle" class="forge-gradient-text">Layout</h3>
      <button type="button" class="diagram-modal-close" onclick="closeDiagramModal()" aria-label="Close">&times;</button>
    </div>
    <div class="diagram-modal-body">
      <div id="diagramModalCanvas" class="diagram-modal-canvas"></div>
      <div id="diagramModalDetail" class="diagram-modal-detail"></div>
    </div>
  </div>
</div>"""

    return intro + "\n" + "\n".join(sections) + "\n" + modal
