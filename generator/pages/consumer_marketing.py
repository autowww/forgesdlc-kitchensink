"""Consumer marketing primitives — Squarespace-inspired sections demo."""
from __future__ import annotations

from components import render_breadcrumbs
from consumer_marketing import (
    render_alternating_features_section,
    render_centered_display_hero,
    render_media_showcase_grid,
    render_steps_band,
)

PAGE = {
    "slug": "consumer-marketing",
    "title": "Consumer marketing",
    "intro": "Centered hero, steps band, zigzag features, and media showcase grid.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 8.4,
    "toc": [
        ("sec-cm-hero", "Centered hero"),
        ("sec-cm-steps", "Steps band"),
        ("sec-cm-zigzag", "Alternating features"),
        ("sec-cm-showcase", "Media showcase"),
        ("sec-cm-docs", "Docs"),
    ],
}


def extra_css() -> str:
    return (
        '  <link rel="stylesheet" href="assets/forgesdlc-theme.css" />\n'
        '  <link rel="stylesheet" href="assets/forgesdlc-pack-consumer.css" />\n'
    )


def render() -> str:
    bc = render_breadcrumbs([("index.html", "Home"), (None, "Consumer marketing")])
    hero = render_centered_display_hero(
        kicker="Consumer marketing",
        title="Spacious, typography-led landing sections",
        body="Squarespace-inspired patterns for product sites — centered heroes, numbered steps, zigzag features, and linked media cards.",
        primary_cta_label="View layouts",
        primary_cta_href="layouts.html",
        secondary_cta_label="Enterprise marketing",
        secondary_cta_href="enterprise-marketing.html",
        background="scrim",
    )
    steps = render_steps_band(
        [
            ("Choose your focus", "Pick leadership competencies and cycle timing."),
            ("Collect feedback", "Invite raters with clear privacy boundaries."),
            ("Act on insight", "Turn patterns into development actions and evidence."),
        ],
        section_title="How it works",
    )
    zigzag = render_alternating_features_section(
        [
            {
                "title": "Strategy and execution",
                "body": "Connect roadmap trade-offs to team delivery with role-relevant questions.",
                "image_src": "assets/svg/template-linear-flow.svg",
                "cta_label": "Explore competencies",
                "cta_href": "presentation.html",
            },
            {
                "title": "Developer experience",
                "body": "Measure investment in sustainable delivery and psychological safety.",
                "image_src": "assets/svg/template-loop-cycle.svg",
                "reverse": True,
            },
        ],
        section_title="Built for engineering leaders",
    )
    showcase = render_media_showcase_grid(
        [
            {
                "title": "Sample report",
                "subtitle": "Interactive leadership feedback summary",
                "href": "presentation.html",
                "image_src": "assets/svg/template-linear-flow.svg",
            },
            {
                "title": "Product tour",
                "subtitle": "Walk through a full feedback cycle",
                "href": "enterprise-marketing.html",
                "image_src": "assets/svg/template-loop-cycle.svg",
            },
            {
                "title": "Methodology",
                "subtitle": "Adaptive feedback framework overview",
                "href": "layouts.html",
                "image_src": "assets/svg/template-hub-spoke.svg",
            },
        ],
        section_title="See it in action",
    )
    docs = (
        '<section id="sec-cm-docs" class="mt-4 pt-3 border-top border-secondary border-opacity-25">'
        '<h2 class="h5 text-cyan mb-2">Docs</h2>'
        '<p class="forge-support mb-0">Python: <code>components/consumer_marketing.py</code>. '
        "CSS: <code>forgesdlc-pack-consumer.css</code> (<code>fs-consumer-*</code>).</p>"
        "</section>"
    )
    return (
        f'<div class="fs-main fs-main--product-wide"><article class="p-3 p-lg-4">'
        f"{bc}"
        '<header class="mb-4 pb-3 border-bottom border-secondary border-opacity-25">'
        '<p class="section-label text-cyan mb-2">Patterns</p>'
        '<h1 class="font-display h3 mb-2">Consumer marketing primitives</h1>'
        '<p class="forge-support mb-0">Squarespace-inspired sections for spacious consumer product sites.</p>'
        "</header>"
        f'<div id="sec-cm-hero">{hero}</div>'
        f'<div id="sec-cm-steps" class="mt-2">{steps}</div>'
        f'<div id="sec-cm-zigzag" class="mt-2">{zigzag}</div>'
        f'<div id="sec-cm-showcase" class="mt-2">{showcase}</div>'
        f"{docs}</article></div>"
    )
