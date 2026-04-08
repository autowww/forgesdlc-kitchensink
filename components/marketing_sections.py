"""Marketing page sections — stat bands, case study spotlights, people grids.

Uses ``fs-*`` / ``forge-stat-*`` classes from ``forgesdlc-theme.css``. Compose inside
``landing_page`` / ``marketing_page`` body HTML with ``forgesdlc-theme.css`` linked.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

try:
    from .components import e, e_content
except ImportError:
    from components import e, e_content

StatAccent = Literal["amber", "cyan", "emerald"]
MediaPosition = Literal["start", "end"]


@dataclass
class MarketingStatCell:
    """One KPI cell for ``render_marketing_stat_band``."""

    title: str
    value: str
    hint: str = ""
    accent: StatAccent = "amber"


@dataclass
class PeopleShowcasePerson:
    """One person for ``render_people_showcase``."""

    name: str
    role: str = ""
    image_src: str = ""
    image_alt: str = ""
    href: str = ""


def _stat_accent_class(accent: StatAccent) -> str:
    if accent == "cyan":
        return "forge-stat--cyan"
    if accent == "emerald":
        return "forge-stat--emerald"
    return "forge-stat--amber"


def _stat_value_tone(accent: StatAccent) -> str:
    if accent == "cyan":
        return "text-cyan"
    if accent == "emerald":
        return "text-success"
    return "text-amber"


def render_marketing_stat_band(
    cells: list[MarketingStatCell],
    *,
    section_title: str = "",
    section_id: str | None = None,
    footnote_html: str = "",
) -> str:
    """Section with a row of glass KPI tiles (``.forge-stat-band`` / ``.forge-stat``).

    Each cell shows *title* above the large *value*, optional *hint* below (e.g. lift copy).
    """
    if not cells:
        return ""
    sid = f' id="{e(section_id)}"' if section_id else ""
    title_html = ""
    if section_title.strip():
        title_html = (
            f'<h2 class="h3 text-center mb-4 font-display">{e_content(section_title)}</h2>'
        )
    n = len(cells)
    lg_w = {1: 12, 2: 6, 3: 4, 4: 3}.get(n, 3)
    if n > 4:
        lg_w = 2
    col_class = f"col-12 col-sm-6 col-lg-{lg_w}"
    parts: list[str] = []
    for cell in cells:
        ac = cell.accent
        mod = _stat_accent_class(ac)
        tone = _stat_value_tone(ac)
        hint = ""
        if cell.hint.strip():
            hint = (
                f'<p class="fs-marketing-stat-band__hint forge-support small text-muted '
                f'mb-0 mt-2">{e_content(cell.hint)}</p>'
            )
        parts.append(
            f'<div class="{col_class}">'
            f'<div class="glass p-4 forge-stat {mod} h-100">'
            f'<p class="fs-marketing-stat-band__title forge-support small mb-2 mb-lg-3">'
            f"{e_content(cell.title)}</p>"
            f'<div class="stat-value {tone}">{e_content(cell.value)}</div>'
            f"{hint}</div></div>"
        )
    row = "".join(parts)
    foot = ""
    if footnote_html.strip():
        foot = (
            f'<p class="fs-marketing-stat-band__footnote forge-support small text-muted '
            f'text-center mt-3 mb-0">{footnote_html.strip()}</p>'
        )
    return (
        f'<section class="fs-landing-section fs-marketing-stat-band py-4 px-2 px-md-3"{sid}>'
        '<div class="container-fluid px-3 px-xxl-5" style="max-width:90rem;margin:0 auto;">'
        f"{title_html}"
        '<div class="row g-3 g-lg-4 justify-content-center forge-stat-band">'
        f"{row}</div>{foot}</div></section>"
    )


def render_case_study_spotlight(
    *,
    title: str,
    quote: str,
    eyebrow: str = "",
    attribution_name: str = "",
    attribution_role: str = "",
    attribution_company: str = "",
    image_src: str = "",
    image_alt: str = "",
    cta_href: str = "",
    cta_label: str = "Read full story",
    media_position: MediaPosition = "start",
    section_id: str | None = None,
) -> str:
    """Large case-study block: media column + quote, attribution, optional CTA."""
    sid = f' id="{e(section_id)}"' if section_id else ""
    eyebrow_html = ""
    if eyebrow.strip():
        eyebrow_html = (
            f'<p class="section-label text-cyan mb-2">{e_content(eyebrow)}</p>'
        )
    role_line = ", ".join(
        x.strip() for x in (attribution_role, attribution_company) if str(x).strip()
    )
    attr_html = ""
    if attribution_name.strip() or role_line:
        attr_html = '<footer class="fs-case-study-spotlight__attr mt-3">'
        if attribution_name.strip():
            attr_html += (
                f'<p class="mb-0"><strong>{e_content(attribution_name)}</strong></p>'
            )
        if role_line:
            attr_html += (
                f'<p class="forge-support text-muted mb-0">{e_content(role_line)}</p>'
            )
        attr_html += "</footer>"
    cta = ""
    if cta_href.strip() and cta_label.strip():
        cta = (
            f'<p class="mt-3 mb-0"><a class="btn btn-forge" href="{e(cta_href.strip())}">'
            f"{e_content(cta_label)}</a></p>"
        )
    if media_position == "end":
        order_media = " order-lg-2"
        order_copy = " order-lg-1"
    else:
        order_media = " order-lg-1"
        order_copy = " order-lg-2"
    media_block = ""
    if image_src.strip():
        alt = (image_alt or "").strip() or ""
        cls = f"col-12 col-lg-6 fs-case-study-spotlight__media mb-4 mb-lg-0{order_media}"
        media_block = (
            f'<div class="{cls}">'
            f'<figure class="mb-0">'
            f'<img class="fs-case-study-spotlight__img w-100 rounded" src="{e(image_src)}" '
            f'alt="{e(alt)}" width="640" height="400" loading="lazy" decoding="async" />'
            f"</figure></div>"
        )
    copy_col = (
        "col-12 col-lg-6 fs-case-study-spotlight__copy"
        if media_block
        else "col-12 fs-case-study-spotlight__copy"
    )
    copy_block = (
        f'<div class="{copy_col}{order_copy if media_block else ""}">'
        f"{eyebrow_html}"
        f'<h2 class="h3 font-display mb-3">{e_content(title)}</h2>'
        f'<blockquote class="fs-case-study-spotlight__quote forge-support fs-5 mb-0">'
        f"{e_content(quote)}</blockquote>"
        f"{attr_html}{cta}</div>"
    )
    return (
        f'<section class="fs-landing-section fs-case-study-spotlight py-4 px-2 px-md-3"{sid}>'
        '<div class="container-fluid px-3 px-xxl-5" style="max-width:90rem;margin:0 auto;">'
        f'<div class="row align-items-center g-4 g-lg-5">{media_block}{copy_block}</div>'
        "</div></section>"
    )


def render_people_showcase(
    people: list[PeopleShowcasePerson],
    *,
    section_title: str = "",
    section_id: str | None = None,
    intro_html: str = "",
) -> str:
    """Responsive grid of headshots + names + roles (e.g. advisors, science board)."""
    if not people:
        return ""
    sid = f' id="{e(section_id)}"' if section_id else ""
    head_html = ""
    if section_title.strip():
        head_html = (
            f'<h2 class="h3 text-center mb-2 font-display">{e_content(section_title)}</h2>'
        )
    intro = ""
    if intro_html.strip():
        intro = f'<div class="fs-people-showcase__intro text-center mb-4">{intro_html.strip()}</div>'
    cells: list[str] = []
    for person in people:
        alt = person.image_alt.strip() or person.name
        img = ""
        if person.image_src.strip():
            img = (
                f'<img class="fs-people-showcase__avatar rounded-circle" '
                f'src="{e(person.image_src)}" alt="{e(alt)}" width="96" height="96" '
                f'loading="lazy" decoding="async" />'
            )
        else:
            initials = (person.name[:2] or "?").upper()
            img = (
                f'<span class="fs-people-showcase__placeholder rounded-circle d-inline-flex '
                f'align-items-center justify-content-center" aria-hidden="true">'
                f"{e(initials)}</span>"
            )
        role = ""
        if person.role.strip():
            role = (
                f'<p class="fs-people-showcase__role forge-support small text-muted mb-0">'
                f"{e_content(person.role)}</p>"
            )
        inner = (
            f'<div class="fs-people-showcase__figure text-center">'
            f"{img}"
            f'<p class="fs-people-showcase__name mt-2 mb-0 fw-semibold">'
            f"{e_content(person.name)}</p>{role}</div>"
        )
        if person.href.strip():
            cells.append(
                f'<div class="col-6 col-md-4 col-lg-3">'
                f'<a class="fs-people-showcase__link text-decoration-none" href="{e(person.href)}">'
                f"{inner}</a></div>"
            )
        else:
            cells.append(f'<div class="col-6 col-md-4 col-lg-3">{inner}</div>')
    grid = "".join(cells)
    return (
        f'<section class="fs-landing-section fs-people-showcase py-4 px-2 px-md-3"{sid}>'
        '<div class="container-fluid px-3 px-xxl-5" style="max-width:90rem;margin:0 auto;">'
        f"{head_html}{intro}"
        f'<div class="row g-4 justify-content-center">{grid}</div>'
        "</div></section>"
    )
