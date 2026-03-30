"""Assemble a full handbook HTML page via Kitchensink ``handbook_page``."""

from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import TYPE_CHECKING

from forge_autodoc.ks_path import ensure_kitchensink_importable

if TYPE_CHECKING:
    pass


def assemble_handbook_page(
    *,
    kitchensink_root: Path,
    browser_title: str,
    handbook_name: str,
    page_title: str,
    intro: str,
    body_html: str,
    toc: list[tuple[str, str, int]],
    sidebar_html: str,
    offcanvas_html: str,
    prev_link: tuple[str, str] | None,
    next_link: tuple[str, str] | None,
    canonical_md: str,
    is_template: bool,
    has_ks_diagram: bool = False,
    build_date_iso: str | None = None,
    living_background: bool = False,
    living_background_global_href: str = "assets/svg/living/global/field-rails-01.svg",
) -> str:
    """Render fragments into a complete document using KS ``handbook_page``."""
    ensure_kitchensink_importable(kitchensink_root)

    from components import (
        render_canonical_note,
        render_footer,
        render_nav_buttons,
        render_template_banner,
        render_toc_sidebar,
    )
    from layouts import handbook_page

    toc_html = render_toc_sidebar(toc)
    tmpl_banner = render_template_banner() if is_template else ""
    canon_note = render_canonical_note(canonical_md)
    nav_btns = render_nav_buttons(prev_link, next_link)
    when = build_date_iso or date.today().isoformat()
    footer = render_footer(when)

    return handbook_page(
        browser_title=browser_title,
        handbook_name=handbook_name,
        page_title=page_title,
        intro=intro,
        body_html=body_html,
        toc_sidebar_html=toc_html,
        sidebar_html=sidebar_html,
        offcanvas_html=offcanvas_html,
        template_banner=tmpl_banner,
        canonical_note=canon_note,
        nav_buttons=nav_btns,
        footer_html=footer,
        has_mermaid=False,
        has_ks_diagram=has_ks_diagram,
        theme_css_href="assets/forge-theme.css",
        theme_js_href="assets/forge-theme.js",
        include_diagram_expand_modal=has_ks_diagram,
        living_background=living_background,
        living_background_global_href=living_background_global_href,
    )
