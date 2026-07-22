"""Section swimlanes — scroll-driven title dock demo."""
from __future__ import annotations

from components import render_breadcrumbs

PAGE = {
    "slug": "section-swimlanes",
    "title": "Section swimlanes",
    "intro": "Garage-door section titles that collapse into a stacked dock under the site header.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 8.45,
    "toc": [
        ("sec-swim-demo", "Live demo"),
        ("sec-swim-docs", "Docs"),
    ],
}


def extra_css() -> str:
    return (
        '  <link rel="stylesheet" href="assets/forgesdlc-theme.css" />\n'
        '  <link rel="stylesheet" href="assets/fs-section-swimlanes.css" />\n'
        '  <style>\n'
        "    .swim-demo-header { position: sticky; top: 0; z-index: 100; "
        "background: rgba(255,255,255,.95); border-bottom: 1px solid rgba(15,23,42,.1); "
        "min-height: 3.5rem; display: flex; align-items: center; padding: 0 1.5rem; }\n"
        "    .swim-demo-section { min-height: 70vh; padding: 2rem 1.5rem 4rem; "
        "border-bottom: 1px solid rgba(15,23,42,.08); }\n"
        "    .swim-demo-section:nth-child(even) { background: rgba(10,85,85,.04); }\n"
        "    .swim-demo-section h2 { font-size: 1.35rem; margin-bottom: 1rem; }\n"
        "    .swim-demo-hero { min-height: 55vh; padding: 3rem 1.5rem 4rem; "
        "border-bottom: 1px solid rgba(15,23,42,.08); background: linear-gradient(180deg, "
        "rgba(10,85,85,.06), transparent); }\n"
        "    .swim-demo-hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); margin: 0 0 1rem; "
        "font-weight: 700; line-height: 1.15; }\n"
        "    body.cap-landing-swimlanes .swim-demo-hero h1 { transition: transform 280ms ease, "
        "opacity 280ms ease; transform-origin: top center; }\n"
        "  </style>\n"
    )


def extra_js_paths() -> list[str]:
    return ["assets/ks-section-swimlanes.js"]


def _hero_section() -> str:
    return (
        '<section class="swim-demo-hero cap-hero" data-fs-section-lane '
        'data-fs-lane-heading="h1" data-fs-lane-title="Hero headline morph" '
        'aria-labelledby="swim-hero-title">'
        '<h1 class="cap-hero__title fs-section-lane-title" id="swim-hero-title">Hero headline morph</h1>'
        "<p class=\"forge-support\">Scroll past this <code>h1</code> — it morphs into the first "
        "swimlane slot (same pipeline as Capablio landing heroes).</p></section>"
    )


def _demo_section(section_id: str, title: str, body: str) -> str:
    return (
        f'<section class="swim-demo-section" id="{section_id}" data-fs-section-lane '
        f'data-fs-lane-title="{title}" aria-labelledby="{section_id}-title">'
        f'<h2 class="cap-section__title fs-section-lane-title" id="{section_id}-title">{title}</h2>'
        f"<p class=\"forge-support\">{body}</p></section>"
    )


def render() -> str:
    bc = render_breadcrumbs([("index.html", "Home"), (None, "Section swimlanes")])
    sections = (
        _hero_section()
        + _demo_section(
            "swim-sec-one",
            "Why section swimlanes",
            "Scroll past this heading — it collapses into the dock under the mock site header "
            "(garage-door transition). Up to three recent section titles stay visible.",
        )
        + _demo_section(
            "swim-sec-two",
            "Intersection-driven behavior",
            "Each lane is clickable and scrolls back to the section. "
            "Reduced motion disables animation.",
        )
        + _demo_section(
            "swim-sec-three",
            "Cap at three lanes",
            "Older lanes drop off when a fourth section scrolls past the dock.",
        )
        + _demo_section(
            "swim-sec-four",
            "Consumer landing pages",
            "Capablio marketing uses this primitive on all layout: landing pages.",
        )
        + _demo_section(
            "swim-sec-five",
            "Kitchen Sink primitive",
            "CSS: fs-section-swimlanes.css · JS: ks-section-swimlanes.js",
        )
    )
    docs = (
        '<section id="sec-swim-docs" class="ks-section mt-4 pt-3 border-top border-secondary border-opacity-25">'
        '<h2 class="ks-section-title">Docs</h2>'
        '<p class="forge-support mb-0">'
        "Mark sections with <code>data-fs-section-lane</code> and a visible heading "
        "(<code>h2</code> or <code>h1</code> via <code>data-fs-lane-heading</code>). "
        "Inject <code>#fsSectionSwimlanes</code> after the site header. "
        "Call <code>ForgeSectionSwimlanes.init({ maxLanes: 3 })</code>.</p>"
        "</section>"
    )
    init_script = (
        "<script>document.addEventListener('DOMContentLoaded',function(){"
        "if(window.ForgeSectionSwimlanes){"
        "document.body.classList.add('cap-landing-swimlanes');"
        "ForgeSectionSwimlanes.init({maxLanes:3,headerSelector:'.swim-demo-header',"
        "dockSelector:'#fsSectionSwimlanes'});}});</script>"
    )
    return (
        f'<div class="fs-main fs-main--product-wide"><article class="p-0">'
        f"{bc}"
        '<header class="swim-demo-header" hash="Fsw" data-ks-hash="Fsw" '
        'data-ks-type="component" data-ks-name="fs-section-swimlanes">'
        "<strong>Mock site header</strong> — scroll the sections below</header>"
        '<div class="fs-section-swimlanes" id="fsSectionSwimlanes" role="navigation" '
        'aria-label="Page sections" hidden></div>'
        f'<div id="sec-swim-demo">{sections}</div>'
        f'<div class="p-3 p-lg-4">{docs}</div>'
        f"{init_script}</article></div>"
    )
