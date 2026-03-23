"""Page Layouts page — documents all available layout templates."""
from __future__ import annotations

PAGE = {
    "slug": "layouts",
    "title": "Page Layouts",
    "intro": "All available layout templates for building sites.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 7,
    "toc": [
        ("sec-showcase", "Showcase"),
        ("sec-landing", "Landing"),
        ("sec-gallery", "Gallery"),
        ("sec-split", "Split"),
        ("sec-handbook", "Handbook"),
        ("sec-chapter", "Chapter"),
        ("sec-product", "Product"),
    ],
}


def _layout_section(
    anchor: str,
    name: str,
    description: str,
    params: list[tuple[str, str, str]],
    used_by: str,
) -> str:
    rows = "".join(
        f"<tr><td><code>{p}</code></td><td>{t}</td><td>{d}</td></tr>"
        for p, t, d in params
    )
    return f"""\
<section id="{anchor}" class="ks-section">
  <h2 class="ks-section-title">{name}</h2>
  <p class="forge-support mb-3">{description}</p>
  <div class="forge-table-wrap mb-3">
    <table class="table table-striped mb-0">
      <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>{rows}</tbody>
    </table>
  </div>
  <div class="forge-callout forge-callout-surface">
    <p class="callout-label">Used by</p>
    <p class="mb-0">{used_by}</p>
  </div>
</section>"""


def render() -> str:
    return "\n".join([
        _layout_section(
            "sec-showcase", "showcase_page",
            "Documentation reference layout: unified sticky header + sidebar + content + optional right-rail ToC. "
            "This is the primary layout for component documentation sites.",
            [
                ("browser_title", "str", "HTML &lt;title&gt; value"),
                ("page_title", "str", "Visible H1 in header bar"),
                ("sidebar_html", "str", "Sidebar navigation markup"),
                ("body_html", "str", "Main content area HTML"),
                ("toc_html", "str", "Right-rail table of contents (optional)"),
                ("extra_css", "str", "Additional inline &lt;style&gt; block"),
                ("extra_js", "list[str]", "Paths to extra JS files"),
            ],
            "Kitchen Sink showcase mini-site (this site)",
        ),
        _layout_section(
            "sec-landing", "landing_page",
            "Full-width hero page with no sidebar. Ideal for homepages and overview pages.",
            [
                ("browser_title", "str", "HTML &lt;title&gt; value"),
                ("hero_html", "str", "Hero section content"),
                ("body_html", "str", "Body content below hero"),
                ("nav_links_html", "str", "Top navigation bar links"),
                ("footer_html", "str", "Footer HTML (optional)"),
            ],
            "Kitchen Sink landing page",
        ),
        _layout_section(
            "sec-gallery", "gallery_page",
            "Sidebar + card grid content area, no right-rail ToC. Good for catalogs and asset browsers.",
            [
                ("browser_title", "str", "HTML &lt;title&gt; value"),
                ("page_title", "str", "Visible H1 in header bar"),
                ("sidebar_html", "str", "Sidebar navigation markup"),
                ("body_html", "str", "Grid content area HTML"),
            ],
            "Kitchen Sink diagram gallery",
        ),
        _layout_section(
            "sec-split", "split_page",
            "Sidebar + two-panel content: live example on the left, documentation on the right. Stacks vertically on mobile.",
            [
                ("browser_title", "str", "HTML &lt;title&gt; value"),
                ("page_title", "str", "Visible H1 in header bar"),
                ("sidebar_html", "str", "Sidebar navigation markup"),
                ("left_html", "str", "Left panel (example / preview)"),
                ("right_html", "str", "Right panel (description / code)"),
            ],
            "Available for component detail pages",
        ),
        _layout_section(
            "sec-handbook", "handbook_page",
            "Auto-generated handbook page with 3-column layout (sidebar, content, ToC). Used by blueprints-website.",
            [
                ("browser_title", "str", "HTML &lt;title&gt; value"),
                ("page_title", "str", "Visible H1"),
                ("sidebar_html", "str", "Sidebar navigation markup"),
                ("body_html", "str", "Main content (from Markdown)"),
                ("toc_html", "str", "Right-rail ToC"),
            ],
            "blueprints-website (bpw)",
        ),
        _layout_section(
            "sec-chapter", "chapter_page",
            "Hand-crafted methodology chapter layout with JS-driven sidebar. Uses docs-theme.css.",
            [
                ("browser_title", "str", "HTML &lt;title&gt; value"),
                ("page_title", "str", "Visible H1"),
                ("sidebar_html", "str", "Chapter sidebar markup"),
                ("body_html", "str", "Chapter content"),
            ],
            "blueprints-website methodology chapters",
        ),
        _layout_section(
            "sec-product", "product_page",
            "Product / marketing layout with tier-grouped sidebar. Uses forgesdlc-theme.css with fs-* classes.",
            [
                ("browser_title", "str", "HTML &lt;title&gt; value"),
                ("page_title", "str", "Visible H1"),
                ("sidebar_html", "str", "Product tier navigation"),
                ("body_html", "str", "Product page content"),
            ],
            "forgesdlc.com (forge)",
        ),
    ])
