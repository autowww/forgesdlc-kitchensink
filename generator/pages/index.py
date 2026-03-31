"""Landing page — Forge Design System overview with hero + family cards."""
from __future__ import annotations

from pages._diagram_gallery import diagram_template_count

PAGE = {
    "slug": "index",
    "title": "Forge Design System",
    "family": None,
    "layout": "landing",
    "order": 0,
}


def nav_links(pages: list[dict]) -> str:
    links = []
    for p in pages:
        if p["slug"] == "index":
            continue
        links.append(
            f'<a href="{p["slug"]}.html">{p["title"]}</a>'
        )
    return "\n    ".join(links)


def hero_html() -> str:
    return """\
<p class="forge-brand mb-3" style="font-size:1.8rem">
  <span class="brand-icon" style="font-size:2rem">F</span>
  <span class="text-amber">Forge Design System</span>
</p>
<h1 class="font-display forge-gradient-text" style="font-size:clamp(2rem,5vw,3.5rem)">
  Kitchen Sink Showcase
</h1>
<p class="forge-support" style="font-size:1.1rem;max-width:36rem;margin:0 auto">
  A living reference for every component, token, and layout template in the
  Forge design system. Browse the catalogue or dive into individual pages.
</p>"""


def body_html(pages: list[dict]) -> str:
    cards = []
    family_colors = {
        "Foundation": "cyan",
        "Components": "amber",
        "Diagrams & charts": "emerald",
        "Patterns": "emerald",
    }
    for p in pages:
        if p["slug"] == "index":
            continue
        fam = p.get("family") or "Foundation"
        color = family_colors.get(fam, "cyan")
        cls = "forge-card breathe-link" if color == "cyan" else f"forge-card card-{color} breathe-link"
        if color == "emerald":
            cls = "forge-card breathe-link"
        cards.append(
            f'<div class="col-md-6 col-lg-4">'
            f'<a class="{cls}" href="{p["slug"]}.html">'
            f'<p class="card-label">{fam}</p>'
            f'<h5 class="mt-2 mb-1">{p["title"]}</h5>'
            f'<p class="forge-support mb-0">{p.get("intro", "")}</p>'
            f'</a></div>'
        )
    n_diagrams = diagram_template_count()
    return f"""\
<h2 class="font-display text-center mb-4" style="font-size:1.5rem">Explore components</h2>
<div class="row g-3 mb-5">
  {"".join(cards)}
</div>

<div class="bento-grid bento-3 mb-4">
  <div class="glass p-4 forge-stat">
    <div class="stat-value text-amber">{n_diagrams}</div>
    <div class="stat-label">Diagram templates</div>
  </div>
  <div class="glass p-4 forge-stat">
    <div class="stat-value text-cyan">7</div>
    <div class="stat-label">Page layouts</div>
  </div>
  <div class="glass p-4 forge-stat">
    <div class="stat-value" style="color:var(--forge-emerald)">11</div>
    <div class="stat-label">Color tokens</div>
  </div>
</div>"""
