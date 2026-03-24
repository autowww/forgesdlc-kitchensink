#!/usr/bin/env python3
"""Copy Kitchen Sink static assets into a consumer site's ``website/assets/`` tree.

Shared by forgesdlc.com (product site) and blueprints.forgesdlc.com (handbook)
so copy lists stay aligned with the submodule layout.
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

    return warnings


def sync_handbook_ks_assets(kitchensink_root: Path, dest_assets: Path) -> None:
    """Kitchen-Sink–sourced assets for blueprint handbooks (forge + docs themes, JS, SVGs)."""
    dest_assets.mkdir(parents=True, exist_ok=True)
    ks_css = kitchensink_root / "css"
    ks_js = kitchensink_root / "js"

    for css_name in ("forge-theme.css", "forge-light-theme.css", "docs-theme.css"):
        src = ks_css / css_name
        if src.is_file():
            shutil.copy2(src, dest_assets / css_name)

    for js_name in ("forge-theme.js", "portal-nav.js", "docs-nav.js"):
        src = ks_js / js_name
        if src.is_file():
            shutil.copy2(src, dest_assets / js_name)

    copy_diagram_svgs(kitchensink_root, dest_assets)
