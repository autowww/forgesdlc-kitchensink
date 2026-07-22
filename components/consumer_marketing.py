"""Consumer-style marketing sections — Squarespace-inspired patterns.

Uses ``fs-consumer-*`` classes from ``forgesdlc-pack-consumer.css``. Compose inside
``landing_page``, ``marketing_page``, or site-specific shells (e.g. Capablio marketing).
"""
from __future__ import annotations

from typing import Any

try:
    from .components import e, e_content
except ImportError:
    from components import e, e_content

try:
    from .ks_hash_attrs import ks_hash_attrs
except ImportError:
    from ks_hash_attrs import ks_hash_attrs


def _attrs(hash_id: str, name: str) -> str:
    return ks_hash_attrs(hash_id, "component", name)


def render_centered_display_hero(
    *,
    kicker: str = "",
    title: str,
    body: str = "",
    primary_cta_label: str = "",
    primary_cta_href: str = "",
    secondary_cta_label: str = "",
    secondary_cta_href: str = "",
    visual_html: str = "",
    background: str = "subtle",
) -> str:
    """Centered display hero — large typography, optional bleed visual below copy."""
    bg = (background or "subtle").strip().lower()
    bg_class = {
        "subtle": "fs-consumer-hero--subtle",
        "bleed-image": "fs-consumer-hero--bleed",
        "gradient-scrim": "fs-consumer-hero--scrim",
    }.get(bg, "fs-consumer-hero--subtle")
    kick = ""
    if kicker.strip():
        kick = f'<p class="fs-consumer-hero__kicker">{e_content(kicker)}</p>'
    body_html = ""
    if body.strip():
        body_html = f'<p class="fs-consumer-hero__body">{e_content(body)}</p>'
    actions = ""
    if primary_cta_label.strip() or secondary_cta_label.strip():
        parts: list[str] = []
        if primary_cta_label.strip():
            parts.append(
                f'<a class="btn btn-forge fs-consumer-hero__cta fs-consumer-hero__cta--primary" '
                f'href="{e(primary_cta_href or "#")}">{e_content(primary_cta_label)}</a>'
            )
        if secondary_cta_label.strip():
            parts.append(
                f'<a class="btn btn-cyan-outline fs-consumer-hero__cta fs-consumer-hero__cta--secondary" '
                f'href="{e(secondary_cta_href or "#")}">{e_content(secondary_cta_label)}</a>'
            )
        actions = f'<div class="fs-consumer-hero__actions">{"".join(parts)}</div>'
    visual = ""
    if visual_html.strip():
        visual = f'<div class="fs-consumer-hero__visual">{visual_html.strip()}</div>'
    return (
        f'<section class="fs-consumer-hero {bg_class}" {_attrs("Cdh", "centered-display-hero")} '
        f'data-fs-section="consumer-hero">'
        '<div class="fs-consumer-hero__inner">'
        f"{kick}"
        f'<h1 class="fs-consumer-hero__title">{e_content(title)}</h1>'
        f"{body_html}{actions}{visual}"
        "</div></section>"
    )


def render_steps_band(
    steps: list[tuple[str, str]] | list[dict[str, Any]],
    *,
    section_title: str = "",
) -> str:
    """Numbered steps band (3–4 items). Each step is ``(title, body)`` or a dict."""
    if not steps:
        return ""
    title_html = ""
    if section_title.strip():
        title_html = (
            f'<h2 class="fs-consumer-steps__title">{e_content(section_title)}</h2>'
        )
    items: list[str] = []
    for i, step in enumerate(steps):
        if isinstance(step, dict):
            stitle = str(step.get("title") or "")
            sbody = str(step.get("body") or "")
        else:
            stitle, sbody = step[0], step[1]
        items.append(
            '<li class="fs-consumer-steps__item">'
            f'<span class="fs-consumer-steps__num" aria-hidden="true">{i + 1}</span>'
            '<div class="fs-consumer-steps__copy">'
            f'<p class="fs-consumer-steps__item-title">{e_content(stitle)}</p>'
            f'<p class="fs-consumer-steps__item-body">{e_content(sbody)}</p>'
            "</div></li>"
        )
    return (
        f'<section class="fs-consumer-steps" {_attrs("Stb", "steps-band")} '
        f'data-fs-section="consumer-steps">'
        '<div class="fs-consumer-steps__inner">'
        f"{title_html}"
        f'<ol class="fs-consumer-steps__list">{"".join(items)}</ol>'
        "</div></section>"
    )


def render_alternating_feature_row(
    *,
    title: str,
    body: str = "",
    image_src: str = "",
    image_alt: str = "",
    cta_label: str = "",
    cta_href: str = "",
    reverse: bool = False,
) -> str:
    """Single zigzag feature row — image and copy side by side."""
    rev = " fs-consumer-zigzag__row--reverse" if reverse else ""
    img = ""
    if image_src.strip():
        img = (
            '<div class="fs-consumer-zigzag__media">'
            f'<img class="fs-consumer-zigzag__img" src="{e(image_src)}" '
            f'alt="{e_content(image_alt or title)}" loading="lazy" decoding="async" />'
            "</div>"
        )
    body_html = f'<p class="fs-consumer-zigzag__body">{e_content(body)}</p>' if body.strip() else ""
    cta = ""
    if cta_label.strip():
        cta = (
            f'<p class="fs-consumer-zigzag__cta">'
            f'<a class="fs-consumer-zigzag__link" href="{e(cta_href or "#")}">'
            f'{e_content(cta_label)}</a></p>'
        )
    return (
        f'<div class="fs-consumer-zigzag__row{rev}">'
        f"{img}"
        '<div class="fs-consumer-zigzag__copy">'
        f'<h3 class="fs-consumer-zigzag__title">{e_content(title)}</h3>'
        f"{body_html}{cta}"
        "</div></div>"
    )


def render_alternating_features_section(
    rows: list[dict[str, Any]],
    *,
    section_title: str = "",
) -> str:
    """Wrap multiple zigzag rows in a section."""
    if not rows:
        return ""
    title_html = ""
    if section_title.strip():
        title_html = (
            f'<h2 class="fs-consumer-zigzag__section-title">{e_content(section_title)}</h2>'
        )
    parts: list[str] = []
    for i, row in enumerate(rows):
        if not isinstance(row, dict):
            continue
        parts.append(
            render_alternating_feature_row(
                title=str(row.get("title") or ""),
                body=str(row.get("body") or ""),
                image_src=str(row.get("image_src") or row.get("image") or ""),
                image_alt=str(row.get("image_alt") or ""),
                cta_label=str(row.get("cta_label") or ""),
                cta_href=str(row.get("cta_href") or ""),
                reverse=bool(row.get("reverse", i % 2 == 1)),
            )
        )
    return (
        f'<section class="fs-consumer-zigzag" {_attrs("Zfg", "alternating-feature-row")} '
        f'data-fs-section="consumer-zigzag">'
        '<div class="fs-consumer-zigzag__inner">'
        f"{title_html}{''.join(parts)}"
        "</div></section>"
    )


def render_media_showcase_grid(
    items: list[dict[str, Any]],
    *,
    section_title: str = "",
) -> str:
    """Linked media cards — template-gallery style grid."""
    if not items:
        return ""
    title_html = ""
    if section_title.strip():
        title_html = (
            f'<h2 class="fs-consumer-showcase__title">{e_content(section_title)}</h2>'
        )
    cards: list[str] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        href = str(item.get("href") or "#")
        label = str(item.get("title") or item.get("label") or "")
        subtitle = str(item.get("subtitle") or item.get("body") or "")
        img = str(item.get("image_src") or item.get("image") or "")
        img_html = ""
        if img.strip():
            img_html = (
                f'<img class="fs-consumer-showcase__img" src="{e(img)}" '
                f'alt="" loading="lazy" decoding="async" />'
            )
        sub = ""
        if subtitle.strip():
            sub = f'<p class="fs-consumer-showcase__subtitle">{e_content(subtitle)}</p>'
        cards.append(
            f'<a class="fs-consumer-showcase__card" href="{e(href)}">'
            f'<div class="fs-consumer-showcase__cover">{img_html}</div>'
            '<div class="fs-consumer-showcase__meta">'
            f'<p class="fs-consumer-showcase__label">{e_content(label)}</p>'
            f"{sub}"
            "</div></a>"
        )
    return (
        f'<section class="fs-consumer-showcase" {_attrs("Msc", "media-showcase-grid")} '
        f'data-fs-section="consumer-showcase">'
        '<div class="fs-consumer-showcase__inner">'
        f"{title_html}"
        f'<div class="fs-consumer-showcase__grid">{"".join(cards)}</div>'
        "</div></section>"
    )
