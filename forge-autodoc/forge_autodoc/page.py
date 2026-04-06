"""Assemble a full handbook HTML page via Kitchensink ``handbook_page``."""

from __future__ import annotations

import inspect
from datetime import date
from pathlib import Path
from typing import TYPE_CHECKING, Mapping

from forge_autodoc.chrome_bundle import load_chrome_bundle
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
    asset_href_prefix: str = "",
    locale: str = "en",
    chrome_overrides: Mapping[str, str] | None = None,
    show_canonical_note: bool = True,
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

    ap = asset_href_prefix
    chrome = load_chrome_bundle(kitchensink_root, locale, overrides=chrome_overrides)
    _hp_sig = inspect.signature(handbook_page)

    toc_html = render_toc_sidebar(
        toc,
        nav_title=chrome.get("toc.on_this_page", "On this page"),
        nav_aria_label=chrome.get("toc.on_this_page", "On this page"),
    )
    tmpl_banner = render_template_banner() if is_template else ""
    canon_note = render_canonical_note(canonical_md) if show_canonical_note else ""
    nav_btns = render_nav_buttons(
        prev_link,
        next_link,
        aria_label=chrome.get("nav.chapter_navigation", "Chapter navigation"),
    )
    when = build_date_iso or date.today().isoformat()
    footer = render_footer(
        when,
        label=chrome.get("footer.generated_label", "Generated from blueprint Markdown"),
        stack_note=chrome.get(
            "footer.stack_note",
            (
                "Bootstrap 5.3 dark mode + Forge design tokens. "
                "Fonts: Proxima Nova Black, Open Sans, Courier New."
            ),
        ),
    )

    theme_css = f"{ap}assets/forge-theme.css"
    theme_js = f"{ap}assets/forge-theme.js"
    living_href = f"{ap}{living_background_global_href}"

    hp_kwargs = dict(
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
        theme_css_href=theme_css,
        theme_js_href=theme_js,
        include_diagram_expand_modal=has_ks_diagram,
        living_background=living_background,
        living_background_global_href=living_href,
        asset_href_prefix=ap,
        html_lang=locale,
        handbook_section_label=chrome.get("handbook.section_label", "Handbook"),
        skip_link_label=chrome.get("a11y.skip_to_content", "Skip to content"),
        open_nav_aria_label=chrome.get("a11y.open_navigation", "Open navigation"),
    )
    filtered_hp = {k: v for k, v in hp_kwargs.items() if k in _hp_sig.parameters}
    return handbook_page(**filtered_hp)
