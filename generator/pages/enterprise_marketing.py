"""Enterprise marketing primitives — mega footer, tabs, FAQ, listing helpers, listing_page demo."""
from __future__ import annotations

from components import render_breadcrumbs

from enterprise_marketing import (
    MegaFooterColumn,
    render_faq_section,
    render_listing_pagination,
    render_mega_footer,
    render_tab_panel,
)

PAGE = {
    "slug": "enterprise-marketing",
    "title": "Enterprise marketing",
    "intro": "Mega footer, tab panels, FAQ accordion, and listing_page shell (Figma-aligned patterns).",
    "family": "Patterns",
    "layout": "listing",
    "order": 8.35,
    "toc": [
        ("sec-em-intro", "Overview"),
        ("sec-em-tabs", "Tab panel"),
        ("sec-em-cards", "Sample listing cards"),
        ("sec-em-faq", "FAQ"),
        ("sec-em-docs", "Docs"),
    ],
}


def filter_sidebar_html() -> str:
    return (
        '<p class="small text-muted mb-3">Static filter demo. Mobile shows this column first.</p>'
        '<div class="d-flex flex-column gap-2">'
        '<div class="form-check">'
        '<input class="form-check-input" type="checkbox" id="em-f1" checked disabled />'
        '<label class="form-check-label forge-support" for="em-f1">Insights</label>'
        "</div>"
        '<div class="form-check">'
        '<input class="form-check-input" type="checkbox" id="em-f2" disabled />'
        '<label class="form-check-label forge-support" for="em-f2">Events</label>'
        "</div>"
        '<div class="form-check">'
        '<input class="form-check-input" type="checkbox" id="em-f3" disabled />'
        '<label class="form-check-label forge-support" for="em-f3">Press</label>'
        "</div>"
        "</div>"
    )


def listing_footer_html() -> str:
    return render_mega_footer(
        [
            MegaFooterColumn("Product", [("#sec-em-intro", "Overview"), ("layouts.html", "Layouts")]),
            MegaFooterColumn(
                "Resources",
                [("for-agents.html", "For agents"), ("presentation.html", "Presentation")],
            ),
            MegaFooterColumn(
                "Legal",
                [("https://forgesdlc.com", "Forge SDLC"), ("index.html", "Showcase home")],
            ),
        ],
        brand_line_html=(
            '<p class="fs-mega-footer__brand-line forge-support mb-0">'
            "<strong>Kitchen Sink</strong> — demo <code>render_mega_footer</code> "
            "for enterprise-style footers.</p>"
        ),
        legal_html=(
            '<p class="mb-0">© Demo only. Links are illustrative.</p>'
        ),
    )


def extra_css() -> str:
    return ""


def render() -> str:
    bc = render_breadcrumbs([("index.html", "Home"), (None, "Enterprise marketing")])
    tabs = render_tab_panel(
        [
            (
                "overview",
                "Overview",
                "<p class=\"mb-0\">Tabbed sections for services, industries, or pricing blocks — "
                "<code>render_tab_panel</code> with Bootstrap tabs.</p>",
            ),
            (
                "detail",
                "Detail",
                "<p class=\"mb-0\">Second panel: any HTML (grids, CTAs, metrics).</p>",
            ),
        ],
        panel_id_prefix="em-demo-tabs",
        aria_label="Demo tabs",
    )
    cards = (
        '<section id="sec-em-cards" class="mt-4">'
        '<h2 class="h5 text-cyan mb-3">Sample cards</h2>'
        '<div class="row g-3">'
        '<div class="col-md-6">'
        '<div class="p-3 rounded border border-secondary border-opacity-25 h-100">'
        '<p class="small text-uppercase text-muted mb-1">Article</p>'
        '<h3 class="h6 mb-2">Composable delivery at scale</h3>'
        '<p class="forge-support small mb-0">Card body placeholder for insights listing.</p>'
        "</div></div>"
        '<div class="col-md-6">'
        '<div class="p-3 rounded border border-secondary border-opacity-25 h-100">'
        '<p class="small text-uppercase text-muted mb-1">Case study</p>'
        '<h3 class="h6 mb-2">Platform modernization</h3>'
        '<p class="forge-support small mb-0">Second tile in the main listing column.</p>'
        "</div></div>"
        "</div>"
        f"{render_listing_pagination(prev_href=None, next_href='enterprise-marketing.html', current_label='Page 1 of 3')}"
        "</section>"
    )
    faq = render_faq_section(
        [
            (
                "What is listing_page?",
                "<p class=\"mb-0\">A marketing interior layout with optional filter sidebar and a primary "
                "column for cards or article lists. See <code>components/layouts.py</code>.</p>",
            ),
            (
                "Where is the taxonomy documented?",
                "<p class=\"mb-0\">See <code>docs/PAGE-LAYOUT-TAXONOMY.md</code> and the backlog in "
                "<code>docs/BACKLOG-layouts-components.md</code>.</p>",
            ),
        ],
        section_title="FAQ",
        section_id="sec-em-faq",
        accordion_id="em-faq-acc",
    )
    docs = (
        '<section id="sec-em-docs" class="mt-4 pt-3 border-top border-secondary border-opacity-25">'
        '<h2 class="h5 text-cyan mb-2">Docs</h2>'
        "<p class=\"forge-support mb-0\">Python: <code>components/enterprise_marketing.py</code>, "
        "layout: <code>listing_page</code>. CSS: <code>forgesdlc-theme.css</code> "
        "(<code>fs-mega-footer</code>, <code>fs-tab-panel</code>, listing).</p>"
        "</section>"
    )
    return (
        f'<div class="fs-main fs-main--product-wide"><article class="p-3 p-lg-4">'
        f"{bc}"
        '<header class="mb-4 pb-3 border-bottom border-secondary border-opacity-25">'
        '<p class="section-label text-cyan mb-2">Patterns</p>'
        '<h1 class="font-display h3 mb-2">Enterprise marketing primitives</h1>'
        '<p class="forge-support mb-0" id="sec-em-intro">Mega footer, tabs, FAQ, and '
        "<code>listing_page</code> (this page). Maps to Figma “Business” and “SaaS” template sections.</p>"
        "</header>"
        f'<section id="sec-em-tabs" class="mb-2">{tabs}</section>'
        f"{cards}{faq}{docs}</article></div>"
    )
