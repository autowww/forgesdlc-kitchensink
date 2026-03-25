"""Product / presentation components — stage carousel, rails, logo strips.

Uses ``fs-*`` classes from ``forgesdlc-theme.css``; requires ``fs-presentation.js``
after ``forge-theme.js`` for behavior (and ``openTopicPreviewModal`` for topic previews).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

try:
    from .components import e, e_content
except ImportError:
    from components import e, e_content

PreviewMode = Literal["none", "link", "topic-preview", "lightbox"]
StageVariant = Literal["hero", "gallery", "testimonial"]
RailVariant = Literal["cards", "logos", "media"]
LogoMode = Literal["grid", "rail", "marquee"]
Align = Literal["start", "center"]


@dataclass
class StageSlide:
    """One slide for ``render_stage_carousel`` and wrappers."""

    title: str = ""
    eyebrow: str = ""
    body: str = ""
    image_src: str = ""
    image_alt: str = ""
    href: str = ""
    cta_label: str = ""
    preview_mode: PreviewMode = "none"
    badge: str = ""
    meta: str = ""
    # testimonial-specific
    quote: str = ""
    person: str = ""
    role: str = ""
    company: str = ""
    avatar_src: str = ""


@dataclass
class RailItem:
    """One cell in ``render_rail`` / card rail."""

    title: str = ""
    body: str = ""
    href: str = ""
    image_src: str = ""
    image_alt: str = ""
    preview_mode: PreviewMode = "none"
    meta: str = ""


@dataclass
class LogoItem:
    """Logo image for strips."""

    src: str = ""
    alt: str = "Logo"


def _aspect_css(aspect_ratio: str) -> str:
    ar = aspect_ratio.strip().replace(":", "/") if aspect_ratio else "16/9"
    if ar.replace(".", "").replace("/", "").isdigit() or "/" in ar:
        return ar
    return "16/9"


def _slide_hit_markup(
    slide: StageSlide,
    *,
    label: str,
) -> str:
    """Overlay hit target for lightbox / topic / link on media."""
    if slide.preview_mode == "none" or not slide.image_src:
        return ""
    if slide.preview_mode == "link" and slide.href:
        al = label or slide.title or "Open link"
        return (
            f'<a class="fs-stage-carousel__media-hit" href="{e(slide.href)}" '
            f'aria-label="{e(al)}">'
            f'<span class="visually-hidden">{e_content(al)}</span></a>'
        )
    if slide.preview_mode == "lightbox":
        return (
            '<button type="button" class="fs-stage-carousel__media-hit" '
            f'data-fs-slide-action="lightbox" '
            f'data-fs-lightbox-src="{e(slide.image_src)}" '
            f'data-fs-lightbox-alt="{e(slide.image_alt)}" '
            f'aria-label="{e(label or "View larger image")}"></button>'
        )
    if slide.preview_mode == "topic-preview" and slide.href:
        t = slide.title or label or "Preview"
        return (
            '<button type="button" class="fs-stage-carousel__media-hit" '
            'data-fs-slide-action="topic" '
            f'data-fs-topic-href="{e(slide.href)}" '
            f'data-fs-topic-title="{e(t)}" '
            f'aria-label="{e("Preview: " + t)}"></button>'
        )
    return ""


def _hero_slide_html(slide: StageSlide, idx: int, cid: str, loading: str) -> str:
    sid = f"{cid}-slide-{idx}"
    label = slide.title or f"Slide {idx + 1}"
    img = ""
    if slide.image_src:
        img = (
            f'<img class="fs-stage-carousel__media" src="{e(slide.image_src)}" '
            f'alt="{e(slide.image_alt)}" loading="{loading}" decoding="async" />'
        )
    hit = _slide_hit_markup(slide, label=label)
    badge = f'<div class="fs-stage-carousel__badge">{e_content(slide.badge)}</div>' if slide.badge else ""
    eyebrow = (
        f'<p class="fs-stage-carousel__eyebrow">{e_content(slide.eyebrow)}</p>' if slide.eyebrow else ""
    )
    title = f'<h3 class="fs-stage-carousel__title">{e_content(slide.title)}</h3>' if slide.title else ""
    body = f'<p class="fs-stage-carousel__body">{e_content(slide.body)}</p>' if slide.body else ""
    meta = f'<p class="fs-stage-carousel__meta">{e_content(slide.meta)}</p>' if slide.meta else ""
    cta = ""
    if slide.cta_label and slide.href:
        cta = (
            f'<a class="btn btn-forge btn-sm" href="{e(slide.href)}">'
            f"{e_content(slide.cta_label)}</a>"
        )
    overlay_inner = f'<div class="fs-stage-carousel__overlay-inner">{badge}{eyebrow}{title}{body}{meta}'
    if cta:
        overlay_inner += f'<div class="fs-stage-carousel__cta-row">{cta}</div>'
    overlay_inner += "</div>"
    overlay = f'<div class="fs-stage-carousel__overlay">{overlay_inner}</div>'
    return (
        f'<article class="fs-stage-carousel__slide" id="{e(sid)}" '
        f'aria-roledescription="slide" aria-label="{e(label)}">'
        f'<div class="fs-stage-carousel__slide-inner">{img}{hit}{overlay}</div></article>'
    )


def _gallery_slide_html(slide: StageSlide, idx: int, cid: str, loading: str) -> str:
    sid = f"{cid}-slide-{idx}"
    label = slide.title or slide.image_alt or f"Slide {idx + 1}"
    img = ""
    if slide.image_src:
        img = (
            f'<img class="fs-stage-carousel__media" src="{e(slide.image_src)}" '
            f'alt="{e(slide.image_alt)}" loading="{loading}" decoding="async" />'
        )
    hit = _slide_hit_markup(slide, label=label)
    overlay = ""
    if slide.title or slide.body:
        t = f'<h3 class="fs-stage-carousel__title">{e_content(slide.title)}</h3>' if slide.title else ""
        b = f'<p class="fs-stage-carousel__body">{e_content(slide.body)}</p>' if slide.body else ""
        overlay = (
            f'<div class="fs-stage-carousel__overlay fs-stage-carousel__overlay--gallery">'
            f"{t}{b}</div>"
        )
    inner = f'<div class="fs-stage-carousel__slide-inner">{img}{hit}{overlay}</div>'
    return (
        f'<article class="fs-stage-carousel__slide" id="{e(sid)}" '
        f'aria-roledescription="slide" aria-label="{e(label)}">{inner}</article>'
    )


def _testimonial_slide_html(slide: StageSlide, idx: int, cid: str) -> str:
    sid = f"{cid}-slide-{idx}"
    q = slide.quote or slide.body
    label = slide.person or f"Testimonial {idx + 1}"
    quote = f'<blockquote class="fs-stage-carousel__quote">{e_content(q)}</blockquote>'
    avatar = ""
    if slide.avatar_src:
        avatar = (
            f'<img class="fs-stage-carousel__avatar" src="{e(slide.avatar_src)}" '
            f'alt="" width="48" height="48" loading="lazy" />'
        )
    who = f'<div class="fs-stage-carousel__who">{e_content(slide.person)}</div>' if slide.person else ""
    role_parts = [p for p in (slide.role, slide.company) if p]
    role = (
        f'<div class="fs-stage-carousel__role">{e_content(", ".join(role_parts))}</div>'
        if role_parts
        else ""
    )
    byline = f'<div class="fs-stage-carousel__byline">{avatar}<div>{who}{role}</div></div>'
    inner = f'<div class="fs-stage-carousel__slide-inner">{quote}{byline}</div>'
    return (
        f'<article class="fs-stage-carousel__slide" id="{e(sid)}" '
        f'aria-roledescription="slide" aria-label="{e(label)}">{inner}</article>'
    )


def render_stage_carousel(
    slides: list[StageSlide],
    *,
    carousel_id: str = "fs-stage",
    variant: StageVariant = "hero",
    autoplay: bool = False,
    interval_ms: int = 6000,
    loop: bool = True,
    show_dots: bool = True,
    show_arrows: bool = True,
    aspect_ratio: str = "16/9",
    theme_variant: str = "",
    content_alignment: Align = "start",
) -> str:
    """Build ``fs-stage-carousel`` with slides (hero, gallery, or testimonial layout)."""
    if not slides:
        return ""
    cid = carousel_id.replace(" ", "-")
    mod = f"fs-stage-carousel--{variant}"
    if theme_variant:
        safe_tv = "".join(c if c.isalnum() or c in "-_" else "-" for c in theme_variant.strip())[:48]
        if safe_tv:
            mod += f" fs-stage-carousel--{safe_tv}"
    align = f" fs-stage-carousel--align-{content_alignment}" if variant == "hero" else ""
    ar = _aspect_css(aspect_ratio)
    slides_html = ""
    for i, s in enumerate(slides):
        loading = "eager" if i == 0 else "lazy"
        if variant == "hero":
            slides_html += _hero_slide_html(s, i, cid, loading)
        elif variant == "gallery":
            slides_html += _gallery_slide_html(s, i, cid, loading)
        else:
            slides_html += _testimonial_slide_html(s, i, cid)

    return (
        f'<section class="fs-stage-carousel {mod}{align}" id="{e(cid)}" '
        'data-fs-stage-carousel '
        f'data-fs-autoplay="{"true" if autoplay else "false"}" '
        f'data-fs-interval-ms="{interval_ms}" '
        f'data-fs-loop="{"true" if loop else "false"}" '
        f'data-fs-show-dots="{"true" if show_dots else "false"}" '
        f'data-fs-show-arrows="{"true" if show_arrows else "false"}" '
        'aria-roledescription="carousel" '
        f'aria-label="{e("Featured content")}" tabindex="0">'
        '<div class="fs-stage-carousel__live" aria-live="polite" aria-atomic="true"></div>'
        f'<div class="fs-stage-carousel__viewport" style="--fs-stage-aspect: {e(ar)}">'
        f'<div class="fs-stage-carousel__track">{slides_html}</div></div>'
        '<div class="fs-stage-carousel__toolbar">'
        '<button type="button" class="fs-stage-carousel__arrow fs-stage-carousel__arrow--prev" '
        'aria-label="Previous slide"></button>'
        '<div class="fs-stage-carousel__dots" role="tablist" aria-label="Slides"></div>'
        '<button type="button" class="fs-stage-carousel__arrow fs-stage-carousel__arrow--next" '
        'aria-label="Next slide"></button>'
        "</div></section>"
    )


def render_thumb_gallery(
    slides: list[StageSlide],
    *,
    carousel_id: str = "fs-thumb-gallery",
    aspect_ratio: str = "16/9",
    loop: bool = True,
    show_dots: bool = True,
    show_arrows: bool = True,
) -> str:
    """Main stage + thumbnail strip (synced by ``fs-presentation.js``)."""
    if not slides:
        return ""
    cid = carousel_id.replace(" ", "-")
    thumbs = []
    for i, s in enumerate(slides):
        tid = f"{cid}-thumb-{i}"
        src = s.image_src or ""
        sel = "true" if i == 0 else "false"
        thumbs.append(
            f'<button type="button" class="fs-thumb-gallery__thumb" id="{e(tid)}" '
            f'role="tab" aria-selected="{sel}" aria-label="{e("View slide " + str(i + 1))}">'
            f'<img src="{e(src)}" alt="" loading="lazy" width="72" height="48" />'
            "</button>"
        )
    stage = render_stage_carousel(
        slides,
        carousel_id=cid,
        variant="gallery",
        autoplay=False,
        aspect_ratio=aspect_ratio,
        loop=loop,
        show_dots=show_dots,
        show_arrows=show_arrows,
    )
    return (
        '<div class="fs-thumb-gallery">'
        f"{stage}"
        f'<div class="fs-thumb-gallery__strip" role="tablist" aria-label="Thumbnails">'
        f'{"".join(thumbs)}</div></div>'
    )


def render_card_rail(
    items: list[RailItem],
    *,
    rail_id: str = "fs-card-rail",
    show_arrows: bool = True,
    peek: bool = True,
    rail_wheel: bool = False,
) -> str:
    """Horizontal card scroller (``fs-rail--cards``)."""
    return render_rail(
        items,
        variant="cards",
        show_arrows=show_arrows,
        peek=peek,
        rail_wheel=rail_wheel,
        rail_id=rail_id,
    )


def render_rail(
    items: list[RailItem],
    *,
    variant: RailVariant = "cards",
    show_arrows: bool = True,
    peek: bool = True,
    rail_wheel: bool = False,
    rail_id: str = "fs-rail",
) -> str:
    """Horizontal scroll-snap rail."""
    if not items:
        return ""
    rid = rail_id.replace(" ", "-")
    peek_c = "fs-rail--peek" if peek else ""
    mod = f"fs-rail--{variant}"
    cells = []
    for it in items:
        if variant == "cards":
            cells.append(_rail_card_cell(it))
        elif variant == "logos":
            cells.append(
                '<div class="fs-rail__item">'
                f'<img src="{e(it.image_src)}" alt="{e(it.image_alt or it.title)}" loading="lazy" />'
                "</div>"
            )
        else:
            cells.append(
                '<div class="fs-rail__item">'
                f'<img src="{e(it.image_src)}" alt="{e(it.image_alt)}" loading="lazy" /></div>'
            )
    inner = "".join(cells)
    wheel = "true" if rail_wheel else "false"
    arrows = "true" if show_arrows else "false"
    return (
        f'<div class="fs-rail {mod} {peek_c}" id="{e(rid)}" data-fs-rail '
        f'data-fs-rail-arrows="{arrows}" data-fs-rail-wheel="{wheel}">'
        '<div class="fs-rail__controls">'
        '<button type="button" class="fs-rail__arrow fs-rail__arrow--prev" aria-label="Scroll left"></button>'
        '<div class="fs-rail__scroller"><div class="fs-rail__track">'
        f"{inner}</div></div>"
        '<button type="button" class="fs-rail__arrow fs-rail__arrow--next" aria-label="Scroll right"></button>'
        "</div></div>"
    )


def _rail_card_cell(it: RailItem) -> str:
    title = f'<h4 class="font-display mb-2" style="font-size:1.05rem">{e_content(it.title)}</h4>'
    body = f'<p class="forge-support small mb-0">{e_content(it.body)}</p>' if it.body else ""
    meta = f'<p class="section-label text-cyan mb-0 mt-2">{e_content(it.meta)}</p>' if it.meta else ""
    inner = f'<div class="forge-card breathe-static p-3 h-100 d-flex flex-column">{title}{body}{meta}</div>'
    if it.preview_mode == "topic-preview" and it.href:
        return (
            '<div class="fs-rail__item">'
            '<button type="button" class="w-100 text-start border-0 p-0 bg-transparent" '
            'style="color:inherit" '
            'data-fs-rail-action="topic" '
            f'data-fs-topic-href="{e(it.href)}" '
            f'data-fs-topic-title="{e(it.title)}">'
            f"{inner}</button></div>"
        )
    if it.href:
        return (
            f'<div class="fs-rail__item"><a class="text-decoration-none text-reset d-block h-100" href="{e(it.href)}">'
            f"{inner}</a></div>"
        )
    return f'<div class="fs-rail__item">{inner}</div>'


def render_logo_strip(
    items: list[LogoItem],
    *,
    mode: LogoMode = "rail",
    show_arrows: bool = True,
    peek: bool = True,
    rail_id: str = "fs-logo-rail",
) -> str:
    """Logos as grid, snap rail, or slow marquee (CSS; reduced-motion static)."""
    if not items:
        return ""
    if mode == "grid":
        imgs = "".join(
            f'<img src="{e(x.src)}" alt="{e(x.alt)}" loading="lazy" />' for x in items
        )
        return f'<div class="fs-logo-strip fs-logo-strip--grid"><div class="fs-logo-strip__grid">{imgs}</div></div>'
    if mode == "marquee":
        seg = "".join(
            f'<span class="fs-logo-strip__logo"><img src="{e(x.src)}" alt="{e(x.alt)}" /></span>'
            for x in items
        )
        return (
            '<div class="fs-logo-strip fs-logo-strip--marquee"><div class="fs-logo-strip__track">'
            f'<div class="fs-logo-strip__segment" aria-hidden="false">{seg}</div>'
            f'<div class="fs-logo-strip__segment" aria-hidden="true">{seg}</div>'
            "</div></div>"
        )
    rails = [
        RailItem(title=x.alt, image_src=x.src, image_alt=x.alt) for x in items
    ]
    return (
        '<div class="fs-logo-strip fs-logo-strip--rail">'
        f"{render_rail(rails, variant='logos', show_arrows=show_arrows, peek=peek, rail_id=rail_id)}"
        "</div>"
    )


def render_hero_carousel(
    slides: list[StageSlide],
    *,
    carousel_id: str = "fs-hero",
    autoplay: bool = False,
    interval_ms: int = 6000,
    loop: bool = True,
    show_dots: bool = True,
    show_arrows: bool = True,
    aspect_ratio: str = "21/9",
    content_alignment: Align = "start",
) -> str:
    return render_stage_carousel(
        slides,
        carousel_id=carousel_id,
        variant="hero",
        autoplay=autoplay,
        interval_ms=interval_ms,
        loop=loop,
        show_dots=show_dots,
        show_arrows=show_arrows,
        aspect_ratio=aspect_ratio,
        content_alignment=content_alignment,
    )


def render_gallery_carousel(
    slides: list[StageSlide],
    *,
    carousel_id: str = "fs-gallery",
    autoplay: bool = False,
    interval_ms: int = 7000,
    loop: bool = True,
    show_dots: bool = True,
    show_arrows: bool = True,
    aspect_ratio: str = "16/9",
) -> str:
    return render_stage_carousel(
        slides,
        carousel_id=carousel_id,
        variant="gallery",
        autoplay=autoplay,
        interval_ms=interval_ms,
        loop=loop,
        show_dots=show_dots,
        show_arrows=show_arrows,
        aspect_ratio=aspect_ratio,
    )


def render_testimonial_slider(
    items: list[StageSlide],
    *,
    carousel_id: str = "fs-testimonial",
    autoplay: bool = False,
    interval_ms: int = 7000,
    loop: bool = True,
    show_dots: bool = True,
    show_arrows: bool = True,
    aspect_ratio: str = "21/9",
) -> str:
    return render_stage_carousel(
        items,
        carousel_id=carousel_id,
        variant="testimonial",
        autoplay=autoplay,
        interval_ms=interval_ms,
        loop=loop,
        show_dots=show_dots,
        show_arrows=show_arrows,
        aspect_ratio=aspect_ratio,
    )
