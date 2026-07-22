#!/usr/bin/env python3
"""Copy Kitchen Sink static assets into a consumer site's ``website/assets/`` tree.

Shared by forgesdlc.com (product site) and blueprints.forgesdlc.com (handbook)
so copy lists stay aligned with the submodule layout.

**Product marketing pages** (``landing_page`` + ``render_product_landing_hero``): after
``sync_product_site_assets``, link CSS in this order in ``<head>``:

1. ``forge-theme.css`` (``theme_css_href`` on the layout)
2. ``forgesdlc-theme.css`` (``product_chrome_css_href`` on the layout — do not omit)
3. Site / brand overrides (``extra_css``, e.g. ``situ8-theme.css``)
"""
from __future__ import annotations

import shutil
from pathlib import Path


def copy_forge_theme_core(kitchensink_root: Path, dest_assets: Path) -> list[str]:
    """Copy ``forge-theme.css``, ``forge-light-theme.css``, and ``forge-theme.js`` if present.

    Returns warning lines for any missing file.
    """
    warnings: list[str] = []
    dest_assets.mkdir(parents=True, exist_ok=True)
    css = kitchensink_root / "css" / "forge-theme.css"
    if css.is_file():
        shutil.copy2(css, dest_assets / "forge-theme.css")
    else:
        warnings.append("forge-theme.css missing — handbook / product prose tokens incomplete")
    light_css = kitchensink_root / "css" / "forge-light-theme.css"
    if light_css.is_file():
        shutil.copy2(light_css, dest_assets / "forge-light-theme.css")
    else:
        warnings.append("forge-light-theme.css missing — light mode tokens incomplete")
    js = kitchensink_root / "js" / "forge-theme.js"
    if js.is_file():
        shutil.copy2(js, dest_assets / "forge-theme.js")
    else:
        warnings.append("forge-theme.js missing — theme behavior may be incomplete")
    for ks_js in (
        "diagram-modal-zoom.js",
        "ks-diagram-catalog.js",
        "ks-diagram-modal.js",
        "ks-diagram-view-toggle.js",
    ):
        p = kitchensink_root / "js" / ks_js
        if p.is_file():
            shutil.copy2(p, dest_assets / ks_js)
    return warnings


def copy_diagram_svgs(kitchensink_root: Path, dest_assets: Path) -> None:
    """Copy all ``assets/svg/**/*.svg`` from Kitchen Sink, preserving subpaths."""
    ks_svg = kitchensink_root / "assets" / "svg"
    if not ks_svg.is_dir():
        return
    dest_svg = dest_assets / "svg"
    dest_svg.mkdir(parents=True, exist_ok=True)
    for svg in sorted(ks_svg.rglob("*.svg")):
        rel = svg.relative_to(ks_svg)
        out = dest_svg / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(svg, out)


def sync_product_site_assets(
    kitchensink_root: Path,
    dest_assets: Path,
    *,
    forgesdlc_theme_src: Path | None = None,
    forgesdlc_theme_fallback: Path | None = None,
) -> list[str]:
    """Assets for ``forgesdlc.com`` static output.

    Copies ``forgesdlc-theme.css`` from *forgesdlc_theme_src* if it exists,
    otherwise from *forgesdlc_theme_fallback*, plus forge core + SVGs.

    Callers that use ``landing_page`` / ``render_product_landing_hero`` must still
    emit a ``<link>`` for the copied ``forgesdlc-theme.css`` (see module docstring).

    Returns human-readable warnings (print or log by caller).
    """
    warnings = copy_forge_theme_core(kitchensink_root, dest_assets)
    copy_diagram_svgs(kitchensink_root, dest_assets)

    css_out = dest_assets / "forgesdlc-theme.css"
    src = None
    if forgesdlc_theme_src and forgesdlc_theme_src.is_file():
        src = forgesdlc_theme_src
    elif forgesdlc_theme_fallback and forgesdlc_theme_fallback.is_file():
        src = forgesdlc_theme_fallback
    if src:
        shutil.copy2(src, css_out)
    else:
        warnings.append("forgesdlc-theme.css missing — product chrome incomplete")

    css_dir = kitchensink_root / "css"
    if css_dir.is_dir():
        for pack_css in sorted(css_dir.glob("forgesdlc-pack-*.css")):
            shutil.copy2(pack_css, dest_assets / pack_css.name)

    pres_js = kitchensink_root / "js" / "fs-presentation.js"
    if pres_js.is_file():
        shutil.copy2(pres_js, dest_assets / "fs-presentation.js")
    else:
        warnings.append("fs-presentation.js missing — presentation carousels/rails will not run")

    for site_js in (
        "fs-nav-dropdown.js",
        "fs-home-expand-tiles.js",
        "ks-pointer-depth.js",
        "ks-tilt-tiles.js",
        "ks-spatial-cube.js",
        "ks-spatial-rail.js",
        "ks-spatial-scroll.js",
    ):
        p = kitchensink_root / "js" / site_js
        if p.is_file():
            shutil.copy2(p, dest_assets / site_js)
        else:
            warnings.append(f"{site_js} missing — landing nav, home tiles, or tilt tiles may not work")

    for nav_js in (
        "ks-nav-shared.js",
        "ks-docs-toc-scrollspy.js",
        "ks-chapter-progress.js",
        "ks-mega-menu.js",
        "ks-segmented-control.js",
        "ks-stepper-wizard.js",
        "ks-split-pane.js",
        "ks-anchor-jump.js",
        "ks-tab-swimlane.js",
        "ks-command-palette.js",
        "ks-bottom-sheet.js",
        "ks-view-transitions.js",
        "ks-peek-rail.js",
    ):
        p = kitchensink_root / "js" / nav_js
        if p.is_file():
            shutil.copy2(p, dest_assets / nav_js)

    nrm_js = kitchensink_root / "js" / "nested-roadmap.js"
    if nrm_js.is_file():
        shutil.copy2(nrm_js, dest_assets / "nested-roadmap.js")
    else:
        warnings.append("nested-roadmap.js missing — nested roadmap drill-down will not run")

    for lb in ("ks-animated-backgrounds.js", "ks-living-motion.js"):
        p = kitchensink_root / "js" / lb
        if p.is_file():
            shutil.copy2(p, dest_assets / lb)
        else:
            warnings.append(f"{lb} missing — living background motion may not run")

    for lb_css in ("ks-animated-backgrounds.css", "ks-living-background.css", "ks-spatial.css", "ks-nav-layout.css"):
        p = kitchensink_root / "css" / lb_css
        if p.is_file():
            shutil.copy2(p, dest_assets / lb_css)
        else:
            warnings.append(f"{lb_css} missing — living background / spatial styles incomplete")

    nrm_css = kitchensink_root / "css" / "nested-roadmap.css"
    if nrm_css.is_file():
        shutil.copy2(nrm_css, dest_assets / "nested-roadmap.css")
    else:
        warnings.append("nested-roadmap.css missing — nested roadmap layout incomplete")

    for fa_css in ("forge-ambient.css", "forge-ambient-themes.css"):
        p = kitchensink_root / "css" / fa_css
        if p.is_file():
            shutil.copy2(p, dest_assets / fa_css)
    fa_js = kitchensink_root / "js" / "forge-ambient.js"
    if fa_js.is_file():
        shutil.copy2(fa_js, dest_assets / "forge-ambient.js")

    mp = kitchensink_root / "assets" / "motion-presets"
    if mp.is_dir():
        mp_out = dest_assets / "motion-presets"
        if mp_out.exists():
            shutil.rmtree(mp_out)
        shutil.copytree(mp, mp_out)

    return warnings


def sync_handbook_ks_assets(kitchensink_root: Path, dest_assets: Path) -> None:
    """Kitchen-Sink–sourced assets for blueprint handbooks (forge + docs themes, JS, SVGs)."""
    dest_assets.mkdir(parents=True, exist_ok=True)
    ks_css = kitchensink_root / "css"
    ks_js = kitchensink_root / "js"

    for css_name in ("forge-theme.css", "forge-light-theme.css", "docs-theme.css", "nested-roadmap.css"):
        src = ks_css / css_name
        if src.is_file():
            shutil.copy2(src, dest_assets / css_name)

    for js_name in (
        "forge-theme.js",
        "portal-nav.js",
        "docs-nav.js",
        "diagram-modal-zoom.js",
        "ks-diagram-catalog.js",
        "ks-diagram-modal.js",
        "ks-diagram-view-toggle.js",
        "nested-roadmap.js",
    ):
        src = ks_js / js_name
        if src.is_file():
            shutil.copy2(src, dest_assets / js_name)

    for lb in ("ks-animated-backgrounds.js", "ks-living-motion.js"):
        p = ks_js / lb
        if p.is_file():
            shutil.copy2(p, dest_assets / lb)

    for lb_css in ("ks-animated-backgrounds.css", "ks-living-background.css", "ks-spatial.css", "ks-nav-layout.css"):
        p = kitchensink_root / "css" / lb_css
        if p.is_file():
            shutil.copy2(p, dest_assets / lb_css)

    for spatial_js in (
        "ks-pointer-depth.js",
        "ks-tilt-tiles.js",
        "ks-spatial-cube.js",
        "ks-spatial-rail.js",
        "ks-spatial-scroll.js",
    ):
        src = ks_js / spatial_js
        if src.is_file():
            shutil.copy2(src, dest_assets / spatial_js)

    for nav_js in (
        "ks-nav-shared.js",
        "ks-docs-toc-scrollspy.js",
        "ks-chapter-progress.js",
        "ks-mega-menu.js",
        "ks-segmented-control.js",
        "ks-stepper-wizard.js",
        "ks-split-pane.js",
        "ks-anchor-jump.js",
        "ks-tab-swimlane.js",
        "ks-command-palette.js",
        "ks-bottom-sheet.js",
        "ks-view-transitions.js",
        "ks-peek-rail.js",
    ):
        src = ks_js / nav_js
        if src.is_file():
            shutil.copy2(src, dest_assets / nav_js)

    for fa_css in ("forge-ambient.css", "forge-ambient-themes.css"):
        p = kitchensink_root / "css" / fa_css
        if p.is_file():
            shutil.copy2(p, dest_assets / fa_css)
    fa_js = kitchensink_root / "js" / "forge-ambient.js"
    if fa_js.is_file():
        shutil.copy2(fa_js, dest_assets / "forge-ambient.js")

    mp = kitchensink_root / "assets" / "motion-presets"
    if mp.is_dir():
        mp_out = dest_assets / "motion-presets"
        if mp_out.exists():
            shutil.rmtree(mp_out)
        shutil.copytree(mp, mp_out)

    copy_diagram_svgs(kitchensink_root, dest_assets)
