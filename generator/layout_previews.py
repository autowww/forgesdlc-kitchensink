"""Minimal full-page HTML examples for layout iframe previews (build-showcase)."""
from __future__ import annotations

from pathlib import Path

from ks_catalog_hashes import page_main_attrs
from components import render_product_footer, render_product_landing_hero
from enterprise_marketing import MegaFooterColumn, render_mega_footer

from layouts import (
    chapter_page,
    handbook_page,
    landing_page,
    listing_page,
    marketing_page,
    product_page,
    split_page,
)


def write_layout_preview_pages(out_dir: Path) -> None:
    """Write preview-*.html next to other showcase pages (same asset paths)."""
    out_dir.mkdir(parents=True, exist_ok=True)

    mini_sidebar = """
<div class="nav-rail">
  <p class="nav-section-label">Preview</p>
  <span class="doc-sidebar-sublink text-dim" style="pointer-events:none">Demo only</span>
</div>
"""

    split_html = split_page(
        browser_title="Split layout preview — Forge Design System",
        brand_name="Kitchen Sink",
        brand_subtitle="Design system",
        page_title="Split layout",
        breadcrumb_html=(
            '<nav aria-label="breadcrumb"><ol class="breadcrumb mb-1" style="font-size:0.75rem">'
            '<li class="breadcrumb-item"><a href="index.html" class="text-cyan" style="text-decoration:none">Home</a></li>'
            '<li class="breadcrumb-item active text-dim" aria-current="page">Split preview</li>'
            "</ol></nav>"
        ),
        sidebar_html=mini_sidebar,
        left_html=(
            '<div class="p-4 rounded border" style="border-color:var(--forge-border)!important">'
            '<p class="section-label text-cyan mb-2">Example panel</p>'
            "<p class=\"forge-support mb-0\">This column is <code>left_html</code> — live demo, component, or nested iframe.</p>"
            "</div>"
        ),
        right_html=(
            '<div class="p-4">'
            '<p class="section-label text-amber mb-2">Docs panel</p>'
            "<p class=\"forge-support mb-0\">This column is <code>right_html</code> — API, props, or prose.</p>"
            "</div>"
        ),
        footer_html="",
        extra_js=["assets/showcase.js"],
        theme_css_href="assets/forge-theme.css",
        theme_js_href="assets/forge-theme.js",
        ks_page_attrs=page_main_attrs("preview-split"),
    )

    hb_sidebar = """
<div class="nav-rail">
  <a class="doc-sidebar-sublink" href="#main">Sample chapter</a>
  <span class="doc-sidebar-sublink text-dim" style="pointer-events:none">Another chapter</span>
</div>
"""

    hb_toc = """    <div class="col-lg-4 col-xl-3 order-1 order-lg-2">
      <nav class="forge-toc" aria-label="On this page">
        <p class="toc-title mb-2">On this page</p>
        <a class="nav-link" href="#sec-sample">Sample section</a>
      </nav>
    </div>"""

    hb_body = """<section id="sec-sample">
  <p class="forge-support">This is the handbook <strong>body_html</strong> column (Markdown output in real sites).</p>
</section>"""

    handbook_html = handbook_page(
        browser_title="Handbook layout preview",
        handbook_name="Preview",
        page_title="Handbook sample page",
        intro="Minimal preview of handbook_page (server-rendered sidebar + article + ToC).",
        body_html=hb_body,
        toc_sidebar_html=hb_toc,
        sidebar_html=hb_sidebar,
        offcanvas_html=hb_sidebar,
        template_banner="",
        canonical_note="",
        nav_buttons="",
        footer_html='<p class="forge-support small mb-0">footer_html</p>',
        has_mermaid=False,
        theme_css_href="assets/forge-theme.css",
        theme_js_href="assets/forge-theme.js",
        ks_page_attrs=page_main_attrs("preview-handbook"),
    )

    ch_header = """<header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
  <p class="section-label text-cyan mb-2">Methodology</p>
  <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Chapter sample</h1>
  <p class="forge-support mt-2 mb-0">chapter_page uses docs-theme.css and optional client-side nav.</p>
</header>"""

    ch_main = """<section id="sec-sample">
  <p class="forge-support">This is <code>main_sections</code> — chapter content. The sidebar is normally filled by JS (<code>#doc-sidebar-nav</code>).</p>
</section>"""

    ch_toc = """<nav class="forge-toc" aria-label="On this page">
  <p class="toc-title mb-2">On this page</p>
  <a class="nav-link" href="#sec-sample">Sample section</a>
</nav>"""

    chapter_html = chapter_page(
        browser_title="Chapter layout preview",
        handbook_name="Preview",
        handbook_subtitle="Chapter · demo",
        header_html=ch_header,
        main_sections=ch_main,
        toc_sidebar_html=ch_toc,
        canonical_note="",
        nav_buttons="",
        footer_html="",
        has_mermaid=False,
        extra_scripts=None,
        theme_css_href="assets/docs-theme.css",
        theme_js_href="assets/forge-theme.js",
        ks_page_attrs=page_main_attrs("preview-chapter"),
    )

    fs_nav = """
<p class="small text-uppercase mb-2" style="color:var(--forge-text-3);letter-spacing:0.08em">Product tier</p>
<nav class="nav flex-column gap-1">
  <a class="nav-link py-1" href="#main">Overview</a>
  <a class="nav-link py-1" href="#main">Details</a>
</nav>
"""

    product_hero = render_product_landing_hero(
        title="Product layout preview",
        tagline="Live fragments: render_product_landing_hero (includes render_landing_signal_field), "
        "then main copy. product_page wraps body_html in .fs-main > article — use wrap_product_site_article "
        "for landing_page bodies (see for-agents · Product theme).",
        kicker="Kitchen Sink",
        primary_cta_href="#main",
        primary_cta_label="Primary CTA",
        secondary_cta_href="tokens.html",
        secondary_cta_label="Secondary",
    )
    product_html = product_page(
        browser_title="Product layout preview",
        brand_name="Forge",
        brand_accent="Preview",
        body_html=(
            product_hero
            + '<p class="forge-support p-3 p-lg-4 mb-0">Body column: plain HTML after the hero. '
            "<code>render_product_footer()</code> is passed as <code>footer_html</code> below the article.</p>"
        ),
        nav_html=fs_nav,
        footer_html=render_product_footer(),
        theme_css_href="assets/forge-theme.css",
        extra_css='  <link rel="stylesheet" href="assets/forgesdlc-theme.css" />\n',
        ks_page_attrs=page_main_attrs("preview-product"),
    )

    marketing_html = marketing_page(
        browser_title="Marketing layout preview",
        brand_name="Kitchen Sink",
        brand_accent="Preview",
        nav_links_html=(
            '<a class="landing-nav-link" href="index.html">Home</a>'
            '<a class="landing-nav-link" href="layouts.html">Layouts</a>'
        ),
        announcement_html=(
            '<span class="forge-support">Optional <code>announcement_html</code> strip above the header.</span>'
        ),
        body_html=(
            '<div class="p-4 p-lg-5">'
            "<p class=\"section-label text-cyan mb-2\">marketing_page</p>"
            "<p class=\"forge-support mb-0\">Single-column interior: collapsible Bootstrap navbar, no hero band. "
            "Use with <code>forgesdlc-theme.css</code> for product typography and spacing.</p>"
            "</div>"
        ),
        footer_html='<p class="forge-support small text-center py-3 mb-0">footer_html</p>',
        theme_css_href="assets/forge-theme.css",
        product_chrome_css_href="assets/forgesdlc-theme.css",
        ks_page_attrs=page_main_attrs("preview-marketing"),
    )

    listing_html = listing_page(
        browser_title="Listing layout preview",
        brand_name="Kitchen Sink",
        brand_accent="Preview",
        nav_links_html=(
            '<a class="landing-nav-link" href="index.html">Home</a>'
            '<a class="landing-nav-link" href="layouts.html">Layouts</a>'
        ),
        filter_sidebar_html=(
            '<p class="small text-muted mb-2">filter_sidebar_html</p>'
            '<p class="forge-support small mb-0">Optional column for facets or categories.</p>'
        ),
        body_html=(
            '<div class="p-3 p-lg-4">'
            "<p class=\"section-label text-cyan mb-2\">listing_page</p>"
            "<p class=\"forge-support mb-3\">Primary column for cards or article lists. "
            "Leave <code>filter_sidebar_html</code> empty for a single full-width column.</p>"
            f"{render_mega_footer([MegaFooterColumn('Demo', [('index.html', 'Home')])], legal_html='<p class=\"mb-0 small\">Mini mega-footer inside body demo.</p>')}"
            "</div>"
        ),
        footer_html='<p class="forge-support small text-center py-3 mb-0">footer_html below article</p>',
        theme_css_href="assets/forge-theme.css",
        product_chrome_css_href="assets/forgesdlc-theme.css",
        ks_page_attrs=page_main_attrs("preview-listing"),
    )

    landing_hero = render_product_landing_hero(
        title="Landing layout preview",
        tagline="Hero band from render_product_landing_hero; body in fs-landing-body-shell.",
        kicker="Kitchen Sink",
        primary_cta_href="#main",
        primary_cta_label="Primary CTA",
        visual_column_extra_class="landing-hero-visual--cover",
    )
    landing_html = landing_page(
        browser_title="Landing layout preview",
        brand_name="Kitchen Sink",
        brand_accent="Preview",
        brand_href="index.html",
        nav_links_html=(
            '<a class="landing-nav-link" href="index.html">Home</a>'
            '<a class="landing-nav-link" href="layouts.html">Layouts</a>'
        ),
        hero_html=landing_hero,
        body_html=(
            '<div class="p-4 p-lg-5">'
            "<p class=\"section-label text-cyan mb-2\">landing_page</p>"
            "<p class=\"forge-support mb-0\">Full-width band + product chrome CSS stack "
            "(<code>product_chrome_css_href</code>). Optional <code>hero_band_extra_class</code> "
            "e.g. <code>fs-hero-band--scrim</code>.</p>"
            "</div>"
        ),
        footer_html='<p class="forge-support small py-3 mb-0">footer_html</p>',
        theme_css_href="assets/forge-theme.css",
        product_chrome_css_href="assets/forgesdlc-theme.css",
        hero_band_extra_class="fs-hero-band--scrim",
        include_theme_toggle=False,
        use_collapsible_nav=True,
        ks_page_attrs=page_main_attrs("preview-landing"),
    )
    (out_dir / "preview-split.html").write_text(split_html, encoding="utf-8")
    (out_dir / "preview-handbook.html").write_text(handbook_html, encoding="utf-8")
    (out_dir / "preview-chapter.html").write_text(chapter_html, encoding="utf-8")
    (out_dir / "preview-product.html").write_text(product_html, encoding="utf-8")
    (out_dir / "preview-marketing.html").write_text(marketing_html, encoding="utf-8")
    (out_dir / "preview-listing.html").write_text(listing_html, encoding="utf-8")
    (out_dir / "preview-landing.html").write_text(landing_html, encoding="utf-8")
