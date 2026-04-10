"""Enterprise-style marketing sections — mega footer, tabs, FAQ, listing shell.

Uses ``fs-*`` classes from ``forgesdlc-theme.css``. Compose inside ``landing_page``,
``marketing_page``, or ``listing_page`` with product chrome linked.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

try:
    from .components import e, e_content
except ImportError:
    from components import e, e_content


def _safe_id_fragment(s: str) -> str:
    t = re.sub(r"[^a-zA-Z0-9_-]+", "-", (s or "tab").strip())
    t = t.strip("-") or "tab"
    return t[:48]


@dataclass
class MegaFooterColumn:
    """One link column for ``render_mega_footer``."""

    heading: str
    links: list[tuple[str, str]]


def render_mega_footer(
    columns: list[MegaFooterColumn],
    *,
    brand_line_html: str = "",
    legal_html: str = "",
    bottom_html: str = "",
) -> str:
    """Multi-column site footer (enterprise marketing pattern).

    *columns* — each item is a heading and a list of ``(href, label)`` pairs.
    *brand_line_html* — optional HTML above the link grid (e.g. logo + tagline).
    *legal_html* — optional row below columns (copyright, disclaimers).
    *bottom_html* — optional full-width strip under legal (locale, social icons).
    """
    if not columns and not brand_line_html.strip() and not legal_html.strip() and not bottom_html.strip():
        return ""
    col_parts: list[str] = []
    for col in columns:
        if not col.heading.strip() and not col.links:
            continue
        lis = "".join(
            f'<li class="fs-mega-footer__item">'
            f'<a class="fs-mega-footer__link" href="{e(href)}">{e_content(label)}</a></li>'
            for href, label in col.links
        )
        h = (
            f'<p class="fs-mega-footer__col-title">{e_content(col.heading)}</p>'
            if col.heading.strip()
            else ""
        )
        col_parts.append(
            f'<div class="col-6 col-md-4 col-lg">'
            f"{h}"
            f'<ul class="fs-mega-footer__list list-unstyled mb-0">{lis}</ul>'
            f"</div>"
        )
    grid = ""
    if col_parts:
        grid = (
            '<div class="row g-4 g-lg-5 fs-mega-footer__grid">'
            f'{"".join(col_parts)}'
            "</div>"
        )
    brand = ""
    if brand_line_html.strip():
        brand = f'<div class="fs-mega-footer__brand mb-4">{brand_line_html.strip()}</div>'
    legal = ""
    if legal_html.strip():
        legal = f'<div class="fs-mega-footer__legal mt-4 pt-3">{legal_html.strip()}</div>'
    bottom = ""
    if bottom_html.strip():
        bottom = f'<div class="fs-mega-footer__bottom mt-3">{bottom_html.strip()}</div>'
    return (
        '<footer class="fs-mega-footer" data-fs-section="mega-footer">'
        '<div class="fs-mega-footer__inner">'
        f"{brand}{grid}{legal}{bottom}"
        "</div></footer>"
    )


def render_tab_panel(
    tabs: list[tuple[str, str, str]],
    *,
    panel_id_prefix: str = "fs-tab",
    aria_label: str = "Content sections",
) -> str:
    """Bootstrap 5 tablist + tab panels (keyboard-accessible when Bootstrap JS loads).

    Each tuple is ``(tab_id_suffix, tab_label, panel_inner_html)``.
    *panel_id_prefix* must be unique on the page to avoid id collisions.
    """
    if not tabs:
        return ""
    prefix = _safe_id_fragment(panel_id_prefix.strip() or "fs-tab")
    nav_items: list[str] = []
    panes: list[str] = []
    for i, (suffix, label, inner) in enumerate(tabs):
        frag = _safe_id_fragment(str(suffix))
        tab_btn_id = e(f"{prefix}-{frag}-{i}-tab")
        pane_id_raw = f"{prefix}-{frag}-{i}-pane"
        pane_id = e(pane_id_raw)
        active = " active" if i == 0 else ""
        show = " show active" if i == 0 else ""
        selected = "true" if i == 0 else "false"
        nav_items.append(
            f'<li class="nav-item" role="presentation">'
            f'<button class="nav-link{active}" id="{tab_btn_id}" data-bs-toggle="tab" '
            f'data-bs-target="#{pane_id}" type="button" role="tab" '
            f'aria-controls="{pane_id}" aria-selected="{selected}">'
            f"{e_content(label)}</button></li>"
        )
        panes.append(
            f'<div class="tab-pane fade{show}" id="{pane_id}" role="tabpanel" '
            f'aria-labelledby="{tab_btn_id}" tabindex="0">'
            f'<div class="fs-tab-panel__body pt-3">{inner}</div></div>'
        )
    nav = (
        f'<ul class="nav nav-tabs fs-tab-panel__tabs flex-wrap gap-1 border-bottom-0" '
        f'role="tablist" aria-label="{e(aria_label)}">'
        f'{"".join(nav_items)}</ul>'
    )
    content = f'<div class="tab-content fs-tab-panel__panes">{"".join(panes)}</div>'
    return f'<section class="fs-tab-panel">{nav}{content}</section>'


def render_faq_section(
    items: list[tuple[str, str]],
    *,
    section_title: str = "",
    section_id: str | None = None,
    accordion_id: str = "fs-faq",
) -> str:
    """Bootstrap 5 accordion for FAQs. Each tuple is ``(question, answer_html)``."""
    if not items:
        return ""
    aid = e(accordion_id.strip() or "fs-faq")
    sid = f' id="{e(section_id)}"' if section_id else ""
    title_html = ""
    if section_title.strip():
        title_html = (
            f'<h2 class="h4 fs-faq-section__title mb-3">{e_content(section_title)}</h2>'
        )
    acc_items: list[str] = []
    for i, (q, a_html) in enumerate(items):
        cid = f"{aid}-c{i}"
        h2id = f"{aid}-h{i}"
        collapsed = "" if i == 0 else " collapsed"
        show = " show" if i == 0 else ""
        expanded = "true" if i == 0 else "false"
        acc_items.append(
            f'<div class="accordion-item fs-faq-item">'
            f'<h3 class="accordion-header" id="{h2id}">'
            f'<button class="accordion-button{collapsed}" type="button" '
            f'data-bs-toggle="collapse" data-bs-target="#{cid}" '
            f'aria-expanded="{expanded}" aria-controls="{cid}">'
            f"{e_content(q)}</button></h3>"
            f'<div id="{cid}" class="accordion-collapse collapse{show}" '
            f'data-bs-parent="#{aid}" aria-labelledby="{h2id}">'
            f'<div class="accordion-body fs-faq-item__body">{a_html}</div></div></div>'
        )
    return (
        f'<section class="fs-faq-section"{sid}>'
        f"{title_html}"
        f'<div class="accordion fs-faq-accordion" id="{aid}">'
        f'{"".join(acc_items)}'
        f"</div></section>"
    )


def render_listing_shell(
    main_html: str,
    *,
    sidebar_html: str = "",
    sidebar_title: str = "Filters",
) -> str:
    """Two-column listing region: optional filter sidebar + main listing column.

    When *sidebar_html* is empty, main spans full width.
    """
    if not sidebar_html.strip():
        return (
            '<div class="fs-listing-shell fs-listing-shell--single">'
            f'<div class="fs-listing-shell__main">{main_html}</div></div>'
        )
    stitle = ""
    if sidebar_title.strip():
        stitle = (
            f'<p class="fs-listing-shell__sidebar-title text-uppercase small mb-3">'
            f"{e_content(sidebar_title)}</p>"
        )
    return (
        '<div class="fs-listing-shell">'
        '<div class="row g-4 align-items-start">'
        f'<aside class="col-lg-3 fs-listing-shell__sidebar" role="complementary" '
        f'aria-label="{e(sidebar_title or "Filters")}">'
        f"{stitle}{sidebar_html.strip()}</aside>"
        f'<div class="col-lg-9 fs-listing-shell__main">{main_html}</div>'
        "</div></div>"
    )


def render_listing_pagination(
    *,
    prev_href: str | None = None,
    next_href: str | None = None,
    current_label: str = "",
) -> str:
    """Simple prev/next strip for static listing pages."""
    prev_el = ""
    if prev_href:
        prev_el = (
            f'<a class="fs-listing-page__link fs-listing-page__link--prev" href="{e(prev_href)}">'
            f"{e_content('Previous')}</a>"
        )
    else:
        prev_el = (
            '<span class="fs-listing-page__link fs-listing-page__link--prev '
            'fs-listing-page__link--disabled" aria-disabled="true">'
            f"{e_content('Previous')}</span>"
        )
    next_el = ""
    if next_href:
        next_el = (
            f'<a class="fs-listing-page__link fs-listing-page__link--next" href="{e(next_href)}">'
            f"{e_content('Next')}</a>"
        )
    else:
        next_el = (
            '<span class="fs-listing-page__link fs-listing-page__link--next '
            'fs-listing-page__link--disabled" aria-disabled="true">'
            f"{e_content('Next')}</span>"
        )
    cur = ""
    if current_label.strip():
        cur = (
            f'<span class="fs-listing-page__position forge-support text-muted">'
            f"{e_content(current_label)}</span>"
        )
    return (
        '<nav class="fs-listing-page mt-4 pt-3 border-top border-secondary border-opacity-25" '
        'aria-label="Pagination">'
        '<div class="d-flex flex-wrap align-items-center justify-content-between gap-2">'
        f"{prev_el}{cur}{next_el}</div></nav>"
    )


def render_listing_empty_state(
    title: str,
    message: str,
    *,
    cta_href: str = "",
    cta_label: str = "",
) -> str:
    """Empty results / no matches callout for listing hubs."""
    cta = ""
    if cta_href and cta_label:
        cta = (
            f'<p class="mb-0 mt-3">'
            f'<a class="btn btn-cyan-outline btn-sm" href="{e(cta_href)}">'
            f"{e_content(cta_label)}</a></p>"
        )
    return (
        '<div class="fs-listing-empty text-center py-5 px-3 rounded-3" role="status">'
        f'<p class="fs-listing-empty__title h5 mb-2">{e_content(title)}</p>'
        f'<p class="fs-listing-empty__msg forge-support text-muted mb-0">{e_content(message)}</p>'
        f"{cta}</div>"
    )
