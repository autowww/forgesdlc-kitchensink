"""Consolidated machine-oriented reference — all showcase elements on one page."""
from __future__ import annotations

from pages._for_agents_content import render_body

PAGE = {
    "slug": "for-agents",
    "title": "Design system (for agents)",
    "intro": "Single-page spec: tokens, surfaces, controls, nav, diagrams, motion, layouts, Python API, JS, product theme.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 8,
    "toc": [
        ("ag-intro", "Intro · How to use this page"),
        ("ag-tokens-colors", "Tokens · Color palette"),
        ("ag-tokens-type", "Tokens · Typography"),
        ("ag-tokens-spacing", "Tokens · Spacing"),
        ("ag-surf-glass", "Surfaces · Glass"),
        ("ag-surf-cards", "Surfaces · Cards"),
        ("ag-surf-bento", "Surfaces · Bento"),
        ("ag-surf-tables", "Surfaces · Tables"),
        ("ag-surf-dividers", "Surfaces · Dividers"),
        ("ag-ctrl-buttons", "Controls · Buttons"),
        ("ag-ctrl-badges", "Controls · Badges"),
        ("ag-ctrl-callouts", "Controls · Callouts"),
        ("ag-ctrl-code", "Controls · Code blocks"),
        ("ag-nav-sidebar", "Nav · Sidebar patterns"),
        ("ag-nav-flow", "Nav · Flow diagram"),
        ("ag-nav-chrome", "Nav · Breadcrumbs & chrome"),
        ("ag-python-api", "Python · components.py API"),
        ("ag-transforms", "Transforms · Markdown HTML"),
        ("ag-diag-svg", "Diagrams · SVG templates"),
        ("ag-diag-mermaid", "Diagrams · Mermaid"),
        ("ag-diag-js", "Diagrams · Modal & JS"),
        ("ag-motion-pulse", "Motion · Pulse"),
        ("ag-motion-breathe", "Motion · Breathe"),
        ("ag-motion-stats", "Motion · Stat counters"),
        ("ag-layout-overview", "Layouts · Overview"),
        ("ag-layout-showcase", "Layouts · showcase_page"),
        ("ag-layout-landing", "Layouts · landing_page"),
        ("ag-layout-gallery", "Layouts · gallery_page"),
        ("ag-layout-split", "Layouts · split_page"),
        ("ag-layout-handbook", "Layouts · handbook_page"),
        ("ag-layout-chapter", "Layouts · chapter_page"),
        ("ag-layout-product", "Layouts · product_page"),
        ("ag-js-theme", "JS · forge-theme.js"),
        ("ag-js-showcase", "JS · showcase.js"),
        ("ag-product-theme", "Product · forgesdlc-theme.css"),
    ],
}


def extra_css() -> str:
    return """\
  <style>
    .ag-spec dt { font-weight: 600; color: var(--forge-text-2); margin-top: 0.5rem; }
    .ag-spec dd { margin-left: 0; margin-bottom: 0.25rem; color: var(--forge-text-3); font-size: 0.9rem; }
    .ag-spec { margin-bottom: 0; }
  </style>"""


def render() -> str:
    return render_body()
