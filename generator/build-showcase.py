#!/usr/bin/env python3
"""Build the Kitchen Sink showcase mini-site.

Collects page definitions from generator/pages/, builds sidebar navigation,
dispatches to layout functions in components/layouts.py, and writes the
generated HTML into the showcase/ directory.

**Canonical documentation shell:** the default path in ``_render_page`` uses
``showcase_page`` with the ``common`` kwargs pattern—this is the reference
implementation for other static-site generators embedding this design system.
See README.md ("Canonical documentation shell").

Usage (from the forgesdlc-kitchensink repo root):
    python3 generator/build-showcase.py
"""
from __future__ import annotations

import importlib
import os
import shutil
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parent.parent
PAGES_PKG = REPO_ROOT / "generator" / "pages"
OUTPUT_DIR = REPO_ROOT / "showcase"

sys.path.insert(0, str(REPO_ROOT / "components"))
sys.path.insert(0, str(REPO_ROOT / "generator"))

from components import e  # noqa: E402
from layout_previews import write_layout_preview_pages  # noqa: E402
from ks_catalog_hashes import page_main_attrs  # noqa: E402
from layouts import (  # noqa: E402
    gallery_page,
    landing_page,
    listing_page,
    showcase_page,
    split_page,
)

# ---------------------------------------------------------------------------
# Discover page modules
# ---------------------------------------------------------------------------

def _load_pages() -> list[dict]:
    pages: list[dict] = []
    for py in sorted(PAGES_PKG.glob("*.py")):
        if py.name.startswith("_"):
            continue
        mod = importlib.import_module(f"pages.{py.stem}")
        page = dict(mod.PAGE)
        page["_module"] = mod
        pages.append(page)
    pages.sort(key=lambda p: p.get("order", 99))
    return pages


# ---------------------------------------------------------------------------
# Sidebar builder
# ---------------------------------------------------------------------------

_CHEVRON_SVG = (
    '<svg class="doc-sidebar-chevron" width="14" height="14" viewBox="0 0 16 16" '
    'fill="currentColor"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 '
    '.708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 '
    '2.354a.5.5 0 0 1 0-.708z"/></svg>'
)


def _build_sidebar(pages: list[dict], current_slug: str) -> str:
    """Build sidebar HTML mirroring the 3-level nav from test.html.

    Groups pages by family; pages without family become top-level links.
    Within-page sections come from the ``toc`` field if the page is current.
    """
    lines: list[str] = []
    lines.append('<p class="nav-section-label">Sections</p>')
    lines.append('<div class="nav-rail" id="ks-sidebar-nav">')

    families: dict[str, list[dict]] = {}
    top_level: list[dict] = []
    for p in pages:
        if p["slug"] == "index":
            continue
        fam = p.get("family")
        if fam:
            families.setdefault(fam, []).append(p)
        else:
            top_level.append(p)

    for p in top_level:
        active = " active" if p["slug"] == current_slug else ""
        lines.append(
            f'<a class="doc-sidebar-link{active}" href="{p["slug"]}.html">'
            f'{e(p["title"])}</a>'
        )

    family_order = ["Foundation", "Components", "Diagrams & charts", "Patterns"]
    for fam in family_order:
        fam_pages = families.get(fam)
        if not fam_pages:
            continue
        fam_id = fam.lower().replace(" ", "-").replace("&", "and")
        any_active = any(p["slug"] == current_slug for p in fam_pages)
        expanded = "true" if any_active else "false"
        show = " show" if any_active else ""

        lines.append('<div class="doc-sidebar-group">')
        lines.append('  <div class="doc-sidebar-row">')
        lines.append(
            f'    <button type="button" class="doc-sidebar-toggle doc-sidebar-toggle--full" '
            f'data-bs-toggle="collapse" data-bs-target="#nav-{fam_id}" '
            f'aria-expanded="{expanded}" aria-controls="nav-{fam_id}" '
            f'aria-label="Toggle {e(fam)} section">{_CHEVRON_SVG}'
            f'<span class="doc-sidebar-heading doc-sidebar-heading--label">{e(fam)}</span>'
            f'</button>'
        )
        lines.append('  </div>')
        lines.append(f'  <div class="collapse{show}" id="nav-{fam_id}">')
        lines.append('    <div class="doc-sidebar-children">')

        for p in fam_pages:
            active = " active" if p["slug"] == current_slug else ""
            lines.append(
                f'      <a class="doc-sidebar-sublink{active}" '
                f'href="{p["slug"]}.html">{e(p["title"])}</a>'
            )

            if p["slug"] == current_slug and p.get("toc"):
                for anchor, label in p["toc"]:
                    lines.append(
                        f'      <a class="doc-sidebar-sublink" '
                        f'href="#{anchor}" style="padding-left:2rem;font-size:0.72rem">'
                        f'{e(label)}</a>'
                    )

        lines.append('    </div>')
        lines.append('  </div>')
        lines.append('</div>')

    lines.append('</div>')
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# ToC builder (right-rail)
# ---------------------------------------------------------------------------

def _build_toc(page: dict) -> str:
    toc_items = page.get("toc")
    if not toc_items:
        return ""
    return "\n".join(
        f'<a class="nav-link" href="#{anchor}">{e(label)}</a>'
        for anchor, label in toc_items
    )


# ---------------------------------------------------------------------------
# Breadcrumb
# ---------------------------------------------------------------------------

def _breadcrumb(page: dict) -> str:
    return (
        '<nav aria-label="breadcrumb">'
        '<ol class="breadcrumb mb-1" style="font-size:0.75rem">'
        '<li class="breadcrumb-item">'
        '<a href="index.html" class="text-cyan" style="text-decoration:none">Home</a>'
        '</li>'
        f'<li class="breadcrumb-item active text-dim" aria-current="page">'
        f'{e(page["title"])}</li>'
        '</ol></nav>'
    )


# ---------------------------------------------------------------------------
# Render a single page
# ---------------------------------------------------------------------------
# Default branch: showcase_page — canonical doc shell for consumers (see README).


def _render_page(page: dict, all_pages: list[dict]) -> str:
    mod = page["_module"]
    layout = page.get("layout", "showcase")
    ks_p = page_main_attrs(page["slug"])

    if layout == "landing":
        from pages.index import body_html as index_body_html
        from pages.index import hero_html as index_hero_html
        from pages.index import nav_links

        if page["slug"] == "index":
            hero_h = index_hero_html()
            body_h = index_body_html(all_pages)
        else:
            hero_h = mod.hero_html()
            body_h = mod.body_html(all_pages)
        return landing_page(
            browser_title=f'{page["title"]} — Forge Design System',
            hero_html=hero_h,
            body_html=body_h,
            nav_links_html=nav_links(all_pages),
            footer_html=_footer(),
            theme_css_href="assets/forge-theme.css",
            theme_js_href="assets/forge-theme.js",
            living_background=bool(page.get("living_background")),
            ks_page_attrs=ks_p,
        )

    if layout == "listing":
        from pages.index import nav_links

        listing_sidebar = mod.filter_sidebar_html() if hasattr(mod, "filter_sidebar_html") else ""
        listing_body = mod.render()
        listing_foot = (
            mod.listing_footer_html()
            if hasattr(mod, "listing_footer_html")
            else '<p class="forge-support small text-center py-3 mb-0">footer_html</p>'
        )
        extra_css_listing = ""
        if hasattr(mod, "extra_css"):
            extra_css_listing = mod.extra_css()
        has_m = bool(page.get("has_mermaid", False))
        has_ks = bool(page.get("has_ks_diagram", False))
        inc_modal = bool(
            page.get(
                "include_diagram_expand_modal",
                has_m or has_ks,
            )
        )
        return listing_page(
            browser_title=f'{page["title"]} — Forge Design System',
            brand_name="Kitchen Sink",
            brand_accent="Preview",
            nav_links_html=nav_links(all_pages),
            filter_sidebar_html=listing_sidebar,
            body_html=listing_body,
            footer_html=listing_foot,
            theme_css_href="assets/forge-theme.css",
            product_chrome_css_href="assets/forgesdlc-theme.css",
            extra_css=extra_css_listing,
            has_mermaid=has_m,
            has_ks_diagram=has_ks,
            include_diagram_expand_modal=inc_modal,
            ks_page_attrs=ks_p,
        )

    sidebar_html = _build_sidebar(all_pages, page["slug"])

    extra_css = ""
    extra_js: list[str] = ["assets/showcase.js"]
    if hasattr(mod, "extra_css"):
        extra_css = mod.extra_css()
    if hasattr(mod, "extra_js_paths"):
        extra_js.extend(mod.extra_js_paths())

    body = mod.render()

    has_m = bool(page.get("has_mermaid", False))
    has_ks = bool(page.get("has_ks_diagram", False))
    inc_modal = bool(
        page.get(
            "include_diagram_expand_modal",
            has_m or has_ks,
        )
    )
    common = dict(
        browser_title=f'{page["title"]} — Forge Design System',
        brand_name="Kitchen Sink",
        brand_subtitle="Design system",
        page_title=page["title"],
        breadcrumb_html=_breadcrumb(page),
        sidebar_html=sidebar_html,
        footer_html=_footer(),
        extra_css=extra_css,
        extra_js=extra_js,
        theme_css_href="assets/forge-theme.css",
        theme_js_href="assets/forge-theme.js",
        has_mermaid=has_m,
        has_ks_diagram=has_ks,
        include_diagram_expand_modal=inc_modal,
        ks_page_attrs=ks_p,
    )
    if "content_max_width" in page:
        common["content_max_width"] = page["content_max_width"]

    if layout == "gallery":
        toc = _build_toc(page)
        return gallery_page(body_html=body, toc_html=toc, **common)
    elif layout == "split":
        left = body
        right = "<p class='forge-support'>Documentation panel</p>"
        if hasattr(mod, "render_right"):
            right = mod.render_right()
        del common["extra_js"]
        return split_page(
            left_html=left,
            right_html=right,
            extra_js=extra_js,
            **common,
        )
    else:
        toc = _build_toc(page)
        return showcase_page(body_html=body, toc_html=toc, **common)


def _footer() -> str:
    return (
        '<hr class="forge-divider">'
        '<footer class="text-center pb-4">'
        '<p class="forge-support">'
        'forgesdlc-kitchensink &middot; Forge design system showcase'
        '</p></footer>'
    )


# ---------------------------------------------------------------------------
# Asset copy
# ---------------------------------------------------------------------------

def _copy_react_primitives_built() -> None:
    """Copy Vite IIFE + public/ JSON from ``showcase-react-app/dist`` into the showcase output."""
    dist = REPO_ROOT / "showcase-react-app" / "dist"
    if not dist.is_dir():
        print(
            "[showcase] skip react-primitives bundle — no showcase-react-app/dist. "
            "Build with: (cd showcase-react-app && npm ci && npm run build)"
        )
        return
    js = dist / "react-primitives-demo.js"
    if not js.is_file():
        # Older Vite lib naming
        alt = list(dist.glob("react-primitives-demo*.js"))
        if alt:
            js = alt[0]
    if not js.is_file():
        print("[showcase] skip react-primitives — dist has no react-primitives-demo.js")
        return
    out_assets = OUTPUT_DIR / "assets"
    out_assets.mkdir(parents=True, exist_ok=True)
    shutil.copy2(js, out_assets / "react-primitives-demo.js")
    data_in = dist / "data"
    if data_in.is_dir():
        out_data = OUTPUT_DIR / "data"
        if out_data.exists():
            shutil.rmtree(out_data)
        shutil.copytree(data_in, out_data)
    print("[showcase] Copied live React bundle + data/ from showcase-react-app/dist/")


def _copy_assets():
    """Copy CSS, JS, and SVG assets into showcase/assets/."""
    assets_out = OUTPUT_DIR / "assets"
    assets_out.mkdir(parents=True, exist_ok=True)

    for css in (REPO_ROOT / "css").glob("*.css"):
        shutil.copy2(css, assets_out / css.name)

    for js in (REPO_ROOT / "js").glob("*.js"):
        shutil.copy2(js, assets_out / js.name)

    assets_misc = REPO_ROOT / "assets"
    if assets_misc.is_dir():
        for aj in assets_misc.glob("*.json"):
            shutil.copy2(aj, assets_out / aj.name)

    svg_out = assets_out / "svg"
    svg_src = REPO_ROOT / "assets" / "svg"
    if svg_src.is_dir():
        if svg_out.exists():
            shutil.rmtree(svg_out)
        shutil.copytree(svg_src, svg_out)

    mp_src = REPO_ROOT / "assets" / "motion-presets"
    if mp_src.is_dir():
        mp_out = assets_out / "motion-presets"
        if mp_out.exists():
            shutil.rmtree(mp_out)
        shutil.copytree(mp_src, mp_out)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    pages = _load_pages()
    print(f"[showcase] Found {len(pages)} pages")

    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True)

    _copy_assets()
    print("[showcase] Assets copied")
    _copy_react_primitives_built()

    for page in pages:
        slug = page["slug"]
        filename = f"{slug}.html"
        html = _render_page(page, pages)
        (OUTPUT_DIR / filename).write_text(html, encoding="utf-8")
        print(f"  ✓ {filename}")

    write_layout_preview_pages(OUTPUT_DIR)
    for name in (
        "preview-split.html",
        "preview-handbook.html",
        "preview-chapter.html",
        "preview-product.html",
    ):
        print(f"  ✓ {name}")

    print(f"[showcase] Done — {len(pages)} pages + layout previews written to {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
