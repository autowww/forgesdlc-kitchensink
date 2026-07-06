"""Assemble a full handbook HTML page via Kitchensink ``handbook_page``."""

from __future__ import annotations

import inspect
from datetime import date
from pathlib import Path
from typing import TYPE_CHECKING, Mapping

from forge_autodoc.chrome_bundle import load_chrome_bundle
from forge_autodoc.ks_path import ensure_kitchensink_importable
from forge_autodoc.text import strip_duplicate_handbook_hero_from_body

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
    has_ks_diagram_dual: bool = False,
    build_date_iso: str | None = None,
    living_background: bool = False,
    living_background_global_href: str = "assets/svg/living/global/field-rails-01.svg",
    asset_href_prefix: str = "",
    locale: str = "en",
    chrome_overrides: Mapping[str, str] | None = None,
    show_canonical_note: bool = True,
    sidebar_chapters_label: str = "Chapters",
    meta_description: str = "",
    canonical_href: str = "",
    og_image_href: str = "",
    json_ld_script: str = "",
    top_shell_html: str = "",
    handbook_sidebar_brand_tagline: str | None = None,
    handbook_section_label_override: str | None = None,
    minimal_shell: bool = False,
    extra_head_metas_html: str = "",
    breadcrumb_items: list[tuple[str | None, str]] | None = None,
    page_type: str = "",
    canonical_source_href: str = "",
    canonical_source_label: str = "Source",
) -> str:
    """Render fragments into a complete document using KS ``handbook_page``."""
    ensure_kitchensink_importable(kitchensink_root)

    body_html = strip_duplicate_handbook_hero_from_body(body_html, page_title, intro)

    from components import (
        render_canonical_note,
        render_footer,
        render_handbook_doc_header,
        render_nav_buttons,
        render_template_banner,
        render_toc_sidebar,
    )
    from ks_catalog_hashes import page_main_attrs
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

    # *asset_href_prefix* is the relpath from the HTML file to *website/assets/* (see
    # href_prefix_to_assets). Theme and KS bundles live directly under that folder.
    asset_base = ap if ap else "assets/"
    theme_css = f"{asset_base}forge-theme.css"
    theme_js = f"{asset_base}forge-theme.js"
    liv = living_background_global_href
    if ap and liv.startswith("assets/"):
        liv = liv[len("assets/") :]
    living_href = f"{ap}{liv}" if ap else living_background_global_href

    section_label = (
        handbook_section_label_override
        if handbook_section_label_override is not None
        else chrome.get("handbook.section_label", "Handbook")
    )

    page_type_label = page_type.strip()
    if page_type_label:
        page_type_label = page_type_label.replace("_", " ").title()

    doc_header = render_handbook_doc_header(
        page_title,
        intro,
        breadcrumb_items=breadcrumb_items,
        section_label=section_label if not breadcrumb_items else "",
        page_type=page_type_label,
        last_updated=when,
        canonical_source_href=canonical_source_href or (canonical_md if show_canonical_note else ""),
        canonical_source_label=canonical_source_label,
    )

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
        has_ks_diagram_dual=has_ks_diagram_dual,
        theme_css_href=theme_css,
        theme_js_href=theme_js,
        include_diagram_expand_modal=has_ks_diagram,
        living_background=living_background,
        living_background_global_href=living_href,
        asset_href_prefix=ap,
        html_lang=locale,
        handbook_section_label=section_label,
        minimal_shell=minimal_shell,
        skip_link_label=chrome.get("a11y.skip_to_content", "Skip to content"),
        open_nav_aria_label=chrome.get("a11y.open_navigation", "Open navigation"),
        sidebar_chapters_label=sidebar_chapters_label,
        meta_description=meta_description,
        canonical_href=canonical_href,
        og_image_href=og_image_href,
        json_ld_script=json_ld_script,
        top_shell_html=top_shell_html,
        handbook_sidebar_brand_tagline=handbook_sidebar_brand_tagline,
        extra_head_metas_html=extra_head_metas_html,
        doc_header_html=doc_header,
        ks_page_attrs=page_main_attrs("handbook-chapter"),
    )
    filtered_hp = {k: v for k, v in hp_kwargs.items() if k in _hp_sig.parameters}
    return handbook_page(**filtered_hp)
