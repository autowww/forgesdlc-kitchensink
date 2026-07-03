"""Atomic UI components for blueprint handbook pages — Forge theme.

Every function returns an HTML string fragment.  Compose them freely—none
produce a full page; see ``layouts`` for that.

Naming convention:
    ``render_*``  — returns ready-to-insert HTML
    ``build_*``   — assembles HTML from sub-parts (typically takes a list)
"""
from __future__ import annotations

import html as html_mod
import json

from ks_catalog_hashes import chrome_region_attrs

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def e(s: str) -> str:
    """HTML-escape a string (quotes included)."""
    return html_mod.escape(s, quote=True)


def e_content(s: str) -> str:
    """HTML-escape without quoting (for element content)."""
    return html_mod.escape(s, quote=False)


def bold(s: str) -> str:
    """Wrap *s* in a ``<strong>``."""
    return f'<strong>{e_content(s)}</strong>'


# ---------------------------------------------------------------------------
# Tables
# ---------------------------------------------------------------------------


def render_table(
    headers: list[str],
    rows: list[list[str]],
    *,
    striped: bool = True,
    cell_escape: bool = False,
) -> str:
    """Forge-themed responsive table.

    Parameters
    ----------
    headers : list[str]
        Column headers (rendered as-is—may contain HTML).
    rows : list[list[str]]
        Row data (rendered as-is unless *cell_escape* is True).
    striped : bool
        Apply ``table-striped`` class.
    cell_escape : bool
        If True, HTML-escape every cell value.
    """
    cls = "table table-sm mb-0"
    if striped:
        cls += " table-striped"
    th = "".join(f"<th scope='col'>{h}</th>" for h in headers)
    body = ""
    for r in rows:
        cells = "".join(f"<td>{e_content(c) if cell_escape else c}</td>" for c in r)
        body += f"<tr>{cells}</tr>"
    return (
        f'<div class="forge-table-wrap mt-2"><table class="{cls}">'
        f"<thead><tr>{th}</tr></thead>"
        f"<tbody>{body}</tbody></table></div>"
    )


def render_io_table(
    rows: list[tuple[str, str, str, str, str]],
) -> str:
    """Intent / Inputs / Outputs / Participants / Timebox table."""
    headers = ["Intent", "Inputs", "Outputs", "Participants", "Timebox / cadence"]
    body_rows = [[e_content(a), e_content(b), e_content(c), e_content(d), e_content(t)]
                 for a, b, c, d, t in rows]
    return render_table(headers, body_rows)


# ---------------------------------------------------------------------------
# Forms (Bootstrap 5.3 + Forge form CSS)
# ---------------------------------------------------------------------------

def render_form_group(
    *,
    label: str,
    control_html: str,
    control_id: str,
    help_text: str = "",
    invalid_feedback: str = "",
    valid_feedback: str = "",
    required: bool = False,
) -> str:
    """Label + control + optional help and validation messages (``mb-3`` row)."""
    req = ' <span class="text-danger" aria-hidden="true">*</span>' if required else ""
    hid = e(control_id)
    help_el = (
        f'<div class="form-text" id="{hid}-help">{e_content(help_text)}</div>'
        if help_text else ""
    )
    inv = (
        f'<div class="invalid-feedback" id="{hid}-invalid">{e_content(invalid_feedback)}</div>'
        if invalid_feedback else ""
    )
    val = (
        f'<div class="valid-feedback" id="{hid}-valid">{e_content(valid_feedback)}</div>'
        if valid_feedback else ""
    )
    return (
        f'<div class="mb-3">'
        f'<label for="{hid}" class="form-label">{e_content(label)}{req}</label>'
        f"{control_html}"
        f"{help_el}{inv}{val}"
        f"</div>"
    )


def render_form_input(
    control_id: str,
    name: str,
    *,
    label: str,
    type: str = "text",
    value: str = "",
    placeholder: str = "",
    help_text: str = "",
    invalid_feedback: str = "",
    valid_feedback: str = "",
    required: bool = False,
    invalid: bool = False,
    valid: bool = False,
    extra_class: str = "",
    autocomplete: str | None = None,
) -> str:
    """Single text-like input with label inside a form row."""
    classes = ["form-control"]
    if invalid:
        classes.append("is-invalid")
    if valid:
        classes.append("is-valid")
    if extra_class.strip():
        classes.append(extra_class.strip())
    cls = " ".join(classes)
    hid = e(control_id)
    nm = e(name)
    ph = f' placeholder="{e(placeholder)}"' if placeholder else ""
    v = f' value="{e(value)}"' if value else ""
    req = " required" if required else ""
    ac = f' autocomplete="{e(autocomplete)}"' if autocomplete else ""
    help_attr = f' aria-describedby="{hid}-help"' if help_text else ""
    inv_attr = f' aria-describedby="{hid}-invalid"' if invalid_feedback else ""
    val_attr = f' aria-describedby="{hid}-valid"' if valid_feedback else ""
    described = help_attr or inv_attr or val_attr
    ctrl = (
        f'<input type="{e(type)}" class="{cls}" id="{hid}" name="{nm}"{v}{ph}{req}{ac}{described} />'
    )
    return render_form_group(
        label=label,
        control_html=ctrl,
        control_id=control_id,
        help_text=help_text,
        invalid_feedback=invalid_feedback,
        valid_feedback=valid_feedback,
        required=required,
    )


def render_form_textarea(
    control_id: str,
    name: str,
    *,
    label: str,
    text: str = "",
    rows: int = 4,
    placeholder: str = "",
    help_text: str = "",
    invalid_feedback: str = "",
    required: bool = False,
    invalid: bool = False,
    valid: bool = False,
) -> str:
    """Multiline control with label."""
    classes = ["form-control"]
    if invalid:
        classes.append("is-invalid")
    if valid:
        classes.append("is-valid")
    cls = " ".join(classes)
    hid = e(control_id)
    nm = e(name)
    ph = f' placeholder="{e(placeholder)}"' if placeholder else ""
    req = " required" if required else ""
    help_attr = f' aria-describedby="{hid}-help"' if help_text else ""
    inv_attr = f' aria-describedby="{hid}-invalid"' if invalid_feedback else ""
    described = help_attr or inv_attr
    body = e_content(text)
    ctrl = (
        f'<textarea class="{cls}" id="{hid}" name="{nm}" rows="{rows}"{ph}{req}{described}>'
        f"{body}</textarea>"
    )
    return render_form_group(
        label=label,
        control_html=ctrl,
        control_id=control_id,
        help_text=help_text,
        invalid_feedback=invalid_feedback,
        required=required,
    )


def render_form_select(
    control_id: str,
    name: str,
    *,
    label: str,
    options: list[tuple[str, str]],
    selected: str = "",
    help_text: str = "",
    required: bool = False,
    invalid: bool = False,
    valid: bool = False,
) -> str:
    """Native ``select`` with ``(value, label)`` options."""
    classes = ["form-select"]
    if invalid:
        classes.append("is-invalid")
    if valid:
        classes.append("is-valid")
    cls = " ".join(classes)
    hid = e(control_id)
    nm = e(name)
    req = " required" if required else ""
    help_attr = f' aria-describedby="{hid}-help"' if help_text else ""
    opts_html = ""
    for val, lab in options:
        sel = ' selected="selected"' if val == selected else ""
        opts_html += f'<option value="{e(val)}"{sel}>{e_content(lab)}</option>'
    ctrl = (
        f'<select class="{cls}" id="{hid}" name="{nm}"{req}{help_attr}>'
        f"{opts_html}</select>"
    )
    return render_form_group(
        label=label,
        control_html=ctrl,
        control_id=control_id,
        help_text=help_text,
        required=required,
    )


def render_form_check(
    control_id: str,
    name: str,
    *,
    label: str,
    checked: bool = False,
    disabled: bool = False,
    value: str = "1",
) -> str:
    """Single checkbox (``form-check``)."""
    hid = e(control_id)
    nm = e(name)
    ch = " checked" if checked else ""
    dis = " disabled" if disabled else ""
    val = e(value)
    return (
        f'<div class="form-check mb-2">'
        f'<input class="form-check-input" type="checkbox" id="{hid}" name="{nm}" value="{val}"{ch}{dis} />'
        f'<label class="form-check-label" for="{hid}">{e_content(label)}</label>'
        f"</div>"
    )


def render_form_switch(
    control_id: str,
    name: str,
    *,
    label: str,
    checked: bool = False,
    disabled: bool = False,
) -> str:
    """Bootstrap form switch."""
    hid = e(control_id)
    nm = e(name)
    ch = " checked" if checked else ""
    dis = " disabled" if disabled else ""
    return (
        f'<div class="form-check form-switch mb-2">'
        f'<input class="form-check-input" type="checkbox" role="switch" id="{hid}" name="{nm}"{ch}{dis} />'
        f'<label class="form-check-label" for="{hid}">{e_content(label)}</label>'
        f"</div>"
    )


def render_form_stack(*parts: str, panel_class: str = "forge-form-panel mt-2") -> str:
    """Wrap composed field fragments in a Forge form panel (demos / settings blocks)."""
    inner = "".join(parts)
    return f'<div class="{e(panel_class)}">{inner}</div>'


# ---------------------------------------------------------------------------
# Sections
# ---------------------------------------------------------------------------

def render_section(
    sid: str,
    title: str,
    inner: str,
    *,
    first: bool = False,
    label: str = "",
    label_color: str = "text-cyan",
) -> str:
    """Content section with an ``<h2>`` heading and optional pre-label.

    Parameters
    ----------
    sid : str
        HTML ``id`` attribute (anchor target).
    title : str
        Section heading (escaped automatically).
    inner : str
        Body HTML (inserted as-is).
    first : bool
        If True, omit the top divider.
    label : str
        Optional pre-label shown above the heading (e.g. "Process").
    label_color : str
        CSS class for the label color (default ``text-cyan``).
    """
    divider = "" if first else '<hr class="forge-divider" />'
    lbl = (
        f'<p class="section-label {label_color} mb-2">{e(label)}</p>'
        if label else ""
    )
    return (
        f'{divider}'
        f'<section class="mb-5" id="{e(sid)}">'
        f'{lbl}'
        f'<h2 class="font-display mb-4" style="font-size:1.75rem">{e(title)}</h2>'
        f'{inner}</section>'
    )


# ---------------------------------------------------------------------------
# Diagram-as-code blocks (render_mermaid_block)
# ---------------------------------------------------------------------------

def render_mermaid_block(diagram: str, *, expandable: bool = False) -> str:
    """Single diagram-as-code block wrapped in a Forge-styled container.

    *diagram* is raw source text for the runtime (no HTML).
    If *expandable* is True, adds click-to-expand trigger class.
    """
    esc = (
        diagram.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )
    extra_class = " forge-diagram-trigger" if expandable else ""
    onclick = ' onclick="openDiagramModal(this)"' if expandable else ""
    return (
        f'<div class="forge-diagram breathe-static{extra_class}"{onclick}>'
        f'<div class="mermaid small">{esc}</div></div>'
    )


def render_ks_diagram_block(
    *,
    key: str = "",
    src: str = "",
    alt: str = "",
    caption: str = "",
    decorative: bool = False,
    expandable: bool = False,
) -> str:
    """Static Kitchen Sink template (or custom ``src`` under ``assets/``) as a diagram tile."""
    from diagram_catalog import resolve_diagram_src, valid_diagram_keys
    from transforms import ks_diagram_tile_html, resolve_ks_diagram_tile_alt

    k = (key or "").strip()
    s = (src or "").strip()
    href, _ = resolve_diagram_src(key=k if k else None, src=s if s else None)
    keys = valid_diagram_keys()
    catalog_key = k if k in keys else ""
    if expandable and not catalog_key and k:
        raise ValueError(f"Unknown ks_diagram key: {k!r}")
    al, dec = resolve_ks_diagram_tile_alt(
        key=k, src=s, alt=alt, caption=caption, decorative=decorative
    )
    return ks_diagram_tile_html(
        img_href=href,
        alt=al,
        diagram_key=catalog_key,
        expandable=expandable,
        decorative=dec,
    )


def render_diagrams_section(
    title: str,
    sid: str,
    diagrams: list[str],
) -> str:
    """Section containing one or more diagram-as-code blocks."""
    inner = "".join(render_mermaid_block(d) for d in diagrams)
    inner = (
        '<p class="forge-support mb-2">'
        "Rendered when JavaScript runs. Same diagrams in canonical Markdown.</p>"
        + inner
    )
    return render_section(sid, title, inner, label="Visualization", label_color="text-cyan")


# ---------------------------------------------------------------------------
# Alerts / Callouts
# ---------------------------------------------------------------------------

_CALLOUT_VARIANTS = {
    "info":      "forge-callout-cyan",
    "warning":   "forge-callout-amber",
    "success":   "forge-callout-emerald",
    "danger":    "forge-callout-red",
    "secondary": "forge-callout-surface",
    "light":     "forge-callout-surface",
}

_CALLOUT_LABEL_COLORS = {
    "info":      "text-cyan",
    "warning":   "text-amber",
    "success":   "color:var(--forge-emerald)",
    "danger":    "color:#EF4444",
    "secondary": "text-dim-2",
    "light":     "text-dim-2",
}


def render_alert(content: str, *, variant: str = "secondary", label: str = "") -> str:
    """Forge-themed callout box.

    *variant* is one of ``info | warning | success | danger | secondary | light``.
    """
    cls = _CALLOUT_VARIANTS.get(variant, "forge-callout-surface")
    lbl_color = _CALLOUT_LABEL_COLORS.get(variant, "text-dim-2")
    lbl_html = ""
    if label:
        style = f' style="{lbl_color}"' if lbl_color.startswith("color:") else ""
        cls_lbl = lbl_color if not lbl_color.startswith("color:") else ""
        lbl_html = f'<p class="callout-label {cls_lbl}"{style}>{e(label)}</p>'
    return (
        f'<div class="forge-callout {cls}">'
        f'{lbl_html}'
        f'<p class="forge-support mb-0">{content}</p></div>'
    )


def render_template_banner() -> str:
    """Amber banner shown on template pages."""
    return render_alert(
        "<strong>Template</strong> &mdash; Copy this file into your project "
        "and fill in the sections. Do not edit the blueprint original.",
        variant="warning",
        label="Template",
    )


def render_canonical_note(
    canonical_md: str,
    *,
    generator: str = "python3 generator/build-handbook.py --all",
) -> str:
    """Surface-colored callout linking to the canonical Markdown source."""
    return (
        '<div class="forge-callout forge-callout-surface mt-4">'
        '<p class="callout-label text-dim-2">Canonical source</p>'
        f'<p class="forge-support mb-0">Edit '
        f'<a href="{e(canonical_md)}">'
        f"<code>{e(canonical_md)}</code></a> first; rebuild the handbook from the "
        f"<strong>blueprints-website</strong> repository root with "
        f"<code>{e(generator)}</code>, then <code>python3 generator/inject-portal-nav.py</code>.</p></div>"
    )


# ---------------------------------------------------------------------------
# Breadcrumbs
# ---------------------------------------------------------------------------

def render_breadcrumbs(
    crumbs: list[tuple[str | None, str]],
) -> str:
    """Forge-styled breadcrumb trail (Kbc chrome region).

    Each entry is ``(href, label)``; use ``href=None`` for the active item.
    Emits ``nav.ks-doc-breadcrumb`` with catalog hash markers per **Kbc**.
    """
    items: list[str] = []
    for href, label in crumbs:
        if href is None:
            items.append(
                f'<li class="breadcrumb-item active" aria-current="page">'
                f"{e(label)}</li>"
            )
        else:
            items.append(
                f'<li class="breadcrumb-item">'
                f'<a href="{e(href)}">{e(label)}</a></li>'
            )
    ol = '<ol class="breadcrumb ks-doc-breadcrumb__trail mb-0">' + "".join(items) + "</ol>"
    _bc = chrome_region_attrs("doc-breadcrumb")
    _bx = f" {_bc}" if _bc else ""
    return (
        f'<nav class="ks-doc-breadcrumb mb-3" aria-label="Breadcrumb"{_bx}>'
        f"{ol}"
        f"</nav>"
    )


def render_handbook_doc_header(
    page_title: str,
    lede: str,
    *,
    breadcrumb_items: list[tuple[str | None, str]] | None = None,
    section_label: str = "",
    page_type: str = "",
    last_updated: str = "",
    canonical_source_href: str = "",
    canonical_source_label: str = "Source",
) -> str:
    """Handbook document header: Kbc trail, title, lede, metadata row (Hbk contract)."""
    bc_html = ""
    if breadcrumb_items and len(breadcrumb_items) >= 2:
        bc_html = render_breadcrumbs(breadcrumb_items)

    lbl = ""
    if section_label.strip() and not bc_html:
        lbl = (
            f'<p class="section-label text-cyan mb-2">{e(section_label.strip())}</p>'
        )

    meta_parts: list[str] = []
    if page_type.strip():
        meta_parts.append(
            f'<span class="ks-doc-meta__badge badge rounded-pill '
            f'text-bg-secondary">{e(page_type.strip())}</span>'
        )
    if last_updated.strip():
        meta_parts.append(
            f'<span class="ks-doc-meta__item">Updated <time datetime="{e(last_updated.strip())}">'
            f"{e(last_updated.strip())}</time></span>"
        )
    if canonical_source_href.strip():
        meta_parts.append(
            f'<span class="ks-doc-meta__item"><a href="{e(canonical_source_href.strip())}" '
            f'rel="noopener">{e(canonical_source_label)}</a></span>'
        )
    meta_html = ""
    if meta_parts:
        meta_html = (
            '<p class="ks-doc-meta forge-support mb-0 mt-3">'
            + " · ".join(meta_parts)
            + "</p>"
        )

    return (
        '<header class="ks-doc-header">'
        f"{bc_html}{lbl}"
        f'<h1 class="font-display ks-doc-header__title">{e(page_title)}</h1>'
        f'<p class="ks-doc-header__lede mt-2 mb-0">{e(lede)}</p>'
        f"{meta_html}"
        "</header>"
    )


# ---------------------------------------------------------------------------
# Navigation buttons
# ---------------------------------------------------------------------------

def render_nav_buttons(
    prev_link: tuple[str, str] | None = None,
    next_link: tuple[str, str] | None = None,
    *,
    aria_label: str = "Chapter navigation",
) -> str:
    """Previous / Next chapter buttons using Forge button styles."""
    prev_btn = ""
    if prev_link:
        prev_btn = (
            f'<a href="{e(prev_link[0])}" class="btn btn-cyan-outline btn-sm">'
            f"&larr; {e(prev_link[1])}</a>"
        )
    next_btn = ""
    if next_link:
        next_btn = (
            f'<a href="{e(next_link[0])}" class="btn btn-forge-outline btn-sm">'
            f"{e(next_link[1])} &rarr;</a>"
        )
    if not prev_btn and not next_btn:
        return ""
    return (
        '<nav class="d-flex flex-wrap justify-content-between gap-2 mt-4 pt-3" '
        'style="border-top:1px solid var(--forge-border)" '
        f'aria-label="{e(aria_label)}">'
        f"{prev_btn}{next_btn}</nav>"
    )


# ---------------------------------------------------------------------------
# External sources / references
# ---------------------------------------------------------------------------

def render_external_sources_section(
    sid: str,
    items: list[tuple[str, str, str]],
    *,
    reference_link: str = "../methodologies/REFERENCE-LINKS.md",
) -> str:
    """Section listing authoritative sources with summaries.

    Each item is ``(url, link_label, executive_summary)``.
    """
    lis: list[str] = []
    for i, (url, label, summary) in enumerate(items):
        mb = "mb-2" if i < len(items) - 1 else "mb-0"
        lis.append(
            f'<li class="{mb}">'
            f'<a href="{e(url)}" rel="noopener">{e(label)}</a>'
            f' <span class="forge-support">{e(summary)}</span></li>'
        )
    ref_note = (
        '<p class="forge-support mb-0 mt-3">'
        "Full curated list with matching blurbs: "
        f'<a href="{e(reference_link)}">'
        f"<code>{e('REFERENCE-LINKS.md')}</code></a> (repository path).</p>"
    )
    inner = (
        '<ul class="list-unstyled">'
        + "".join(lis)
        + "</ul>"
        + ref_note
    )
    return render_section(sid, "Authoritative sources & further reading", inner)


# ---------------------------------------------------------------------------
# Flow details (walkthrough narrative)
# ---------------------------------------------------------------------------

def render_flow_details_section(
    sid: str,
    items: list[tuple[str, str]],
) -> str:
    """Section with per-diagram narrative subsections.

    Each item is ``(subsection_title, paragraph_text)``.
    """
    chunks: list[str] = []
    for idx, (title, para) in enumerate(items):
        mt = "mt-1" if idx == 0 else "mt-3"
        chunks.append(
            f'<h3 class="font-display {mt} mb-2" style="font-size:1.25rem">'
            f"{e(title)}</h3>"
            f'<p class="forge-support mb-0">{e(para)}</p>'
        )
    return render_section(sid, "Flow details (walkthrough)", "".join(chunks))


# ---------------------------------------------------------------------------
# ToC sidebar
# ---------------------------------------------------------------------------

def render_toc_sidebar(
    toc: list[tuple[str, str, int]],
    *,
    nav_title: str = "On this page",
    nav_aria_label: str = "On this page",
) -> str:
    """Right-column "On this page" sticky navigation (Forge-themed).

    *toc* entries are ``(id, text, heading_level)``.
    Returns the full ``<aside class="ks-doc-toc-rail">`` wrapper (width from ``.ks-doc-toc-flow`` grid).
    If *toc* is empty returns ``""`` (caller omits the column).
    """
    if not toc:
        return ""
    links = ""
    for hid, text, level in toc:
        indent = ' style="padding-left:1.25rem"' if level == 3 else ""
        links += (
            f'<a class="nav-link"{indent} '
            f'href="#{e(hid)}">{e(text)}</a>\n'
        )
    _ktx = chrome_region_attrs("doc-toc-sidebar")
    _ktx_s = f" {_ktx}" if _ktx else ""
    return f"""
            <aside class="ks-doc-toc-rail"{_ktx_s}>
              <nav class="forge-toc" aria-label="{e(nav_aria_label)}">
                <p class="toc-title mb-2">{e(nav_title)}</p>
{links}
              </nav>
            </aside>"""


def render_toc_sidebar_simple(toc: list[tuple[str, str]]) -> str:
    """Simpler ToC variant used by chapter pages (no heading level).

    *toc* entries are ``(id, text)``.
    """
    links = "".join(
        f'<a class="nav-link" href="#{e(sid)}">{e(lab)}</a>'
        for sid, lab in toc
    )
    return f"""
              <nav class="forge-toc" aria-label="On this page">
                <p class="toc-title mb-2">On this page</p>
{links}
              </nav>"""


# ---------------------------------------------------------------------------
# Skip link
# ---------------------------------------------------------------------------

def render_skip_link(target: str = "#main") -> str:
    """Accessibility skip-to-content link."""
    return f'<a href="{e(target)}" class="skip-link">Skip to content</a>'


# ---------------------------------------------------------------------------
# Mobile nav button
# ---------------------------------------------------------------------------

def render_mobile_nav_button(
    *,
    target_id: str = "docNavOffcanvas",
) -> str:
    """Fixed hamburger button for opening the offcanvas sidebar."""
    return (
        f'<button type="button" class="btn btn-forge position-fixed top-0 start-0 m-3 '
        f'd-lg-none shadow" style="z-index:1040" data-bs-toggle="offcanvas" '
        f'data-bs-target="#{e(target_id)}" aria-controls="{e(target_id)}" '
        f'aria-label="Open navigation">'
        '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" '
        'viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" '
        'd="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 '
        '.5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 '
        '1H3a.5.5 0 0 1-.5-.5z"/></svg></button>'
    )


# ---------------------------------------------------------------------------
# Page footer
# ---------------------------------------------------------------------------

def render_footer(
    date: str,
    *,
    label: str = "Generated from blueprint Markdown",
    stack_note: str = (
        "Bootstrap 5.3 dark mode + Forge design tokens. "
        "Fonts: Proxima Nova Black, Open Sans, Courier New."
    ),
) -> str:
    """Forge-themed page footer."""
    return (
        '<footer class="mt-5 pt-4 small" '
        'style="border-top:1px solid var(--forge-border);color:var(--forge-text-3)">'
        f'<p class="mb-1">{label}: '
        f'<strong>{e(date)}</strong>.</p>'
        f'<p class="mb-0" style="font-size:.75rem;color:var(--forge-text-4)">'
        f"{e(stack_note)}</p>"
        "</footer>"
    )


# ---------------------------------------------------------------------------
# Page header
# ---------------------------------------------------------------------------

def render_page_header(
    page_title: str,
    intro: str,
    *,
    breadcrumb_html: str = "",
    label: str = "Handbook",
    label_color: str = "text-cyan",
) -> str:
    """Forge-styled page header with title, intro, and optional breadcrumbs."""
    bc = f'<nav aria-label="breadcrumb">{breadcrumb_html}</nav>' if breadcrumb_html else ""
    lbl = (
        f'<p class="section-label {label_color} mb-2">{e(label)}</p>'
        if label and not breadcrumb_html
        else ""
    )
    return (
        '<header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">'
        f"{bc}{lbl}"
        f'<h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">'
        f"{e(page_title)}</h1>"
        f'<p class="forge-support mt-2 mb-0" style="font-size:1rem">{intro}</p>'
        "</header>"
    )


def render_page_header_chapter(
    h1: str,
    intro: str,
    breadcrumb_html: str,
) -> str:
    """Chapter-style header with breadcrumbs (used by methodology pages)."""
    return (
        '<header class="mb-3 pb-3" style="border-bottom:1px solid var(--forge-border)">'
        f'<nav aria-label="breadcrumb">{breadcrumb_html}</nav>'
        f'<h1 class="font-display mb-0" style="font-size:1.75rem">{h1}</h1>'
        f'<p class="forge-support mt-2 mb-0">{intro}</p>'
        "</header>"
    )


# ---------------------------------------------------------------------------
# Product-site components (forgesdlc.com)
# ---------------------------------------------------------------------------

def render_tier_nav(
    grouped: list[tuple[str, list[tuple[str, str]]]],
    current_href: str,
) -> str:
    """Tier-grouped sidebar nav for product sites (``fs-*`` classes).

    *grouped* is a list of ``(tier_heading, [(href, title), ...])``.
    *current_href* is the active page's href for highlighting.
    Each tier is a ``<details>`` open when it contains the current page.
    """
    parts: list[str] = []
    for heading, items in grouped:
        is_open = any(h == current_href for h, _t in items)
        open_attr = " open" if is_open else ""
        parts.append(f'<details class="fs-nav-tier-wrap"{open_attr}>')
        parts.append(f'<summary class="fs-nav-tier text-muted">{e(heading)}</summary>')
        parts.append('<ul class="nav flex-column px-1 mb-2">')
        for href, title in items:
            active = " active" if href == current_href else ""
            ext = (
                ' rel="noopener"'
                if href.startswith(("http://", "https://"))
                else ""
            )
            parts.append(
                f'<li class="nav-item"><a class="nav-link{active}" '
                f'href="{e(href)}"{ext}>{e(title)}</a></li>'
            )
        parts.append("</ul></details>")
    return "\n        ".join(parts)


def render_cross_refs(
    items: list[tuple[str, str]],
    *,
    variant: str | None = None,
) -> str:
    """Related-content aside for product sites (``fs-cross-refs``).

    *items* is a list of resolved ``(href, label)`` pairs.
    *variant* — pass ``"subtle"`` for a lower-emphasis panel (e.g. home above-the-fold).
    Returns empty string if *items* is empty.
    """
    if not items:
        return ""
    lis = "\n    ".join(
        f'<li><a href="{e(href)}">{e(label)}</a></li>'
        for href, label in items
    )
    aside_cls = "fs-cross-refs"
    if variant == "subtle":
        aside_cls += " fs-cross-refs--subtle"
    return (
        f'<aside class="{aside_cls}" role="complementary">\n'
        '  <div class="fs-cross-refs-title">Related</div>\n'
        '  <ul class="mb-0">\n'
        f'    {lis}\n'
        '  </ul>\n'
        '</aside>'
    )


def render_authorship_signal(
    lead: str,
    support: str | None = None,
) -> str:
    """Short human-authorship strip for product landing pages (``.landing-authorship``).

    Communicates that artifacts may be agent-produced while intent, direction,
    and judgment remain human — restrained, not defensive.
    """
    lead = lead.strip()
    if not lead:
        return ""
    sup = support.strip() if support else ""
    sup_html = ""
    if sup:
        sup_html = (
            f'<p class="landing-authorship-support forge-support text-muted mb-0">'
            f"{e_content(sup)}</p>"
        )
    return (
        '<aside class="landing-authorship landing-authorship--bridge" role="note" '
        'aria-label="How this site is produced">'
        f'<p class="landing-authorship-lead mb-2">{e_content(lead)}</p>'
        f"{sup_html}"
        "</aside>"
    )


# Product landing hero: animated FORGE wordmark (Fourier spectral lines, SMIL).
# Shipped under kitchensink ``assets/svg/backgrounds/sinusoids/``; copied to site
# ``assets/`` by consumer builds.
LANDING_FORGE_SPECTRAL_SVG = (
    "assets/svg/backgrounds/sinusoids/bg-fourier-forge-spectral-animated-01.svg"
)


def landing_forge_spectral_img_href(*, ks_mount_prefix: str | None = None) -> str:
    """URL for the hero spectral SVG.

    Default (``ks_mount_prefix`` omitted): site-relative path for static product
    builds where ``assets/`` is copied next to HTML.

    When kitchensink is mounted at a URL prefix (e.g. forge-lenses serves files
    under ``/__ks/``), pass ``ks_mount_prefix='/__ks/'`` so the image resolves.
    """
    rel = LANDING_FORGE_SPECTRAL_SVG.replace("\\", "/")
    if not ks_mount_prefix:
        return rel
    base = ks_mount_prefix.strip().rstrip("/") + "/"
    return base + rel


def render_landing_signal_field(
    *, img_src: str | None = None, img_src_2x: str | None = None
) -> str:
    """Wide landing hero visual: animated FORGE spectral SVG (kitchensink asset).

    Replaces the older inline route/wave diagram. Motion is slow SMIL inside the
    SVG; ``prefers-reduced-motion`` cannot disable external SMIL when loaded via
    ``img`` — keep animation subtle in the asset itself.

    *img_src* — optional ``src`` for the ``img``; default is
    ``LANDING_FORGE_SPECTRAL_SVG`` (static-site-relative). Use
    ``landing_forge_spectral_img_href(ks_mount_prefix='/__ks/')`` when assets are
    proxied under ``/__ks/``.

    *img_src_2x* — optional second URL for ``srcset`` (e.g. raster @2x); only
    applied when *img_src* overrides the default spectral asset.
    """
    src = img_src if img_src is not None else LANDING_FORGE_SPECTRAL_SVG
    s2 = (img_src_2x or "").strip()
    srcset = ""
    if img_src is not None and s2:
        srcset = f' srcset="{e(src)} 1x, {e(s2)} 2x"'
    return (
        '<div class="landing-forge-visual" role="presentation" aria-hidden="true">'
        f'<img src="{e(src)}" alt="" width="800" height="450"{srcset} '
        'class="landing-forge-visual__img" decoding="async" fetchpriority="low" />'
        "</div>"
    )


def render_product_landing_hero(
    title: str,
    tagline: str | None = None,
    *,
    kicker: str | None = None,
    title_line2: str | None = None,
    clarification: str | None = None,
    explainer: str | None = None,
    audience: str | None = None,
    primary_cta_href: str | None = None,
    primary_cta_label: str | None = None,
    secondary_cta_href: str | None = None,
    secondary_cta_label: str | None = None,
    secondary_links: list[tuple[str, str]] | None = None,
    support_points: list[str] | None = None,
    landing_visual_img_src: str | None = None,
    landing_visual_img_src_2x: str | None = None,
    visual_column_extra_class: str = "",
) -> str:
    """Landing hero fragment for forgesdlc.com (kicker, title, tagline, optional CTA stack).

    ``kicker`` is a short line above the title (e.g. positioning for executives).
    ``title_line2`` optional second display line inside the same ``h1`` (gradient text).
    ``clarification`` sits directly under the tagline (inversion / thesis support).
    ``primary_cta_*`` renders one dominant ``btn-forge`` when both are set.
    ``secondary_cta_*`` renders ``btn-cyan-outline`` beside the primary when set.
    ``secondary_links`` are muted text links below the button row.
    ``support_points`` renders a compact list under the CTA stack.
    ``landing_visual_img_src`` overrides the default spectral SVG ``src`` (e.g.
    ``landing_forge_spectral_img_href(ks_mount_prefix='/__ks/')`` for forge-lenses).
    ``landing_visual_img_src_2x`` — optional hi-DPI URL for ``srcset`` with the
    override (ignored when the default spectral image is used).
    ``visual_column_extra_class`` — optional classes on the visual column (e.g.
    ``landing-hero-visual--cover`` from ``forgesdlc-theme.css`` for raster art).
    Sizing: ``forgesdlc-theme.css`` (``.landing-hero-*``).
    """
    sec = secondary_links or []
    pts = [p.strip() for p in (support_points or []) if str(p).strip()]
    has_secondary_btn = bool(secondary_cta_href and secondary_cta_label)
    has_cta_row = bool(
        (primary_cta_href and primary_cta_label)
        or has_secondary_btn
        or len(sec) > 0
    )
    has_below_tagline = bool(
        clarification
        or explainer
        or audience
        or has_cta_row
        or pts
    )

    parts: list[str] = []
    if kicker:
        parts.append(
            f'<p class="landing-hero-kicker mb-0">{e_content(kicker)}</p>'
        )
    title2_html = ""
    if title_line2:
        title2_html = (
            '<span class="product-landing-title__line2 d-block mt-1">'
            f"{e_content(title_line2)}</span>"
        )
    parts.append(
        f'<h1 class="font-display forge-gradient-text product-landing-title mb-3">'
        f"{e_content(title)}{title2_html}</h1>"
    )
    if tagline:
        tcls = (
            "forge-support landing-hero-tagline mb-2"
            if has_below_tagline
            else "forge-support landing-hero-tagline mb-0"
        )
        parts.append(f'<p class="{tcls}">{e_content(tagline)}</p>')
    if clarification:
        parts.append(
            '<p class="landing-hero-clarification forge-support mb-3">'
            f"{e_content(clarification)}</p>"
        )
    if explainer:
        parts.append(
            '<p class="landing-hero-explainer forge-support mb-2">'
            f"{e_content(explainer)}</p>"
        )
    if audience:
        margin = "mb-4" if has_cta_row else "mb-0"
        parts.append(
            f'<p class="landing-hero-audience forge-support text-muted {margin}">'
            f"{e_content(audience)}</p>"
        )
    if has_cta_row:
        parts.append('<div class="landing-hero-actions">')
        if (primary_cta_href and primary_cta_label) or has_secondary_btn:
            parts.append(
                '<p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 '
                'align-items-center justify-content-center justify-content-xl-start mb-3 mb-md-2">'
            )
            if primary_cta_href and primary_cta_label:
                parts.append(
                    f'<a class="btn btn-forge" href="{e(primary_cta_href)}">'
                    f"{e_content(primary_cta_label)}</a>"
                )
            if has_secondary_btn:
                parts.append(
                    f'<a class="btn btn-cyan-outline" href="{e(secondary_cta_href)}">'
                    f"{e_content(secondary_cta_label)}</a>"
                )
            parts.append("</p>")
        if sec:
            sep = ' <span class="landing-hero-secondary-sep" aria-hidden="true">·</span> '
            link_bits: list[str] = []
            for href, label in sec:
                ext = (
                    ' rel="noopener"'
                    if href.startswith(("http://", "https://"))
                    else ""
                )
                link_bits.append(
                    f'<a class="landing-hero-secondary-link" href="{e(href)}"{ext}>'
                    f"{e_content(label)}</a>"
                )
            parts.append(
                '<p class="landing-hero-secondary-links forge-support text-muted mb-0">'
                + sep.join(link_bits)
                + "</p>"
            )
        parts.append("</div>")
    if pts:
        items = "".join(
            f'<li class="landing-hero-support__item">{e_content(x)}</li>' for x in pts
        )
        parts.append(
            '<ul class="landing-hero-support list-unstyled forge-support mb-0 mt-3">'
            f"{items}</ul>"
        )
    copy_html = "".join(parts)
    lv2 = (landing_visual_img_src_2x or "").strip() if landing_visual_img_src else ""
    visual = render_landing_signal_field(
        img_src=landing_visual_img_src,
        img_src_2x=lv2 or None,
    )
    vcex = visual_column_extra_class.strip()
    visual_col_class = (
        f'col-12 col-xl-5 col-lg-10 landing-hero-visual {e(vcex)}'
        if vcex
        else "col-12 col-xl-5 col-lg-10 landing-hero-visual"
    )
    return (
        '<div class="container-fluid landing-hero-wide px-3 px-xxl-5">'
        '<div class="landing-hero-grid-wrap">'
        '<div class="row align-items-center g-4 g-xl-5 landing-hero-grid '
        'justify-content-center justify-content-xl-between">'
        '<div class="col-12 col-xl-7 col-lg-10 landing-hero-copy '
        'text-center text-xl-start">'
        f"{copy_html}</div>"
        f'<div class="{visual_col_class}">'
        f"{visual}</div>"
        "</div></div></div>"
    )


def wrap_product_site_article(inner_html: str) -> str:
    """Wrap main-column HTML so ``forgesdlc-theme.css`` ``.fs-main`` rules apply.

    Use under ``landing_page`` body content; ``product_page`` already wraps its
    article in ``fs-main``.
    """
    return f'<div class="fs-main"><article>{inner_html}</article></div>'


def render_blog_post_wrapper(
    inner_html: str,
    *,
    published_iso: str | None = None,
    hero_image_href: str | None = None,
    hero_image_alt: str | None = None,
) -> str:
    """Forge product blog: dated article shell with typography hooks (``forgesdlc-theme.css``).

    When *hero_image_href* is set (typically root-relative, e.g. ``/assets/blog/foo.png``),
    a figure is rendered above the body for an in-article hero; reuse the same asset as
    ``og:image`` on forgesdlc.com.
    """
    date_html = ""
    if published_iso:
        iso = published_iso.strip()[:10]
        try:
            from datetime import date as date_cls

            y, m, d = map(int, iso.split("-"))
            dt = date_cls(y, m, d)
            human = f"{dt.strftime('%B')} {dt.day}, {dt.year}"
        except (ValueError, TypeError):
            human = iso
        date_html = (
            f'<p class="fs-blog-post__date">'
            f'<time datetime="{e(iso)}">{e_content(human)}</time></p>'
        )
    hero_html = ""
    href = (hero_image_href or "").strip()
    if href:
        alt = (hero_image_alt or "").strip() or "Article illustration"
        hero_html = (
            '<figure class="fs-blog-post__hero">'
            f'<img src="{e(href)}" alt="{e(alt)}" width="1200" height="630" '
            'loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 48rem" />'
            "</figure>"
        )
    return (
        '<div class="fs-blog-post">'
        f'<header class="fs-blog-post__header">{date_html}</header>'
        f"{hero_html}"
        f'<div class="fs-blog-post__body">{inner_html}</div>'
        "</div>"
    )


def render_blog_recent_section(
    items: list[tuple[str, str, str | None]],
    *,
    heading: str = "Recent posts",
    id_attr: str | None = "blog-recent-posts",
) -> str:
    """Index block: reverse-chronological list. Each item is ``(href, title, date_label or None)``."""
    id_html = f' id="{e(id_attr)}"' if id_attr else ""
    rows: list[str] = []
    for href, title, date_label in items:
        esc_h = e(href)
        esc_t = e_content(title)
        date_part = ""
        if date_label:
            date_part = (
                f'<span class="fs-blog-recent__date">{e_content(date_label)}</span>'
            )
        rows.append(
            f'<li class="fs-blog-recent__item">'
            f'<a class="fs-blog-recent__link" href="{esc_h}">{esc_t}</a>'
            f"{date_part}</li>"
        )
    body = "\n".join(rows)
    return (
        f'<section class="fs-blog-recent"{id_html}>'
        f'<h2 class="fs-blog-recent__heading">{e_content(heading)}</h2>'
        f'<ul class="fs-blog-recent__list list-unstyled mb-0">{body}</ul>'
        "</section>"
    )


def render_product_footer(
    brand_name: str = "ForgeSDLC",
    tagline: str = "Methodology for AI-assisted-by-human software delivery",
    powered_by_url: str = "https://blueprints.forgesdlc.com",
    powered_by_label: str = "Blueprints handbook",
) -> str:
    """Footer block for product sites (``fs-footer``)."""
    return (
        '<footer class="fs-footer fs-landing-footer-band" data-fs-section="footer">'
        f'<p class="mb-1">{e(brand_name)} — {e(tagline)}.</p>'
        f'<p class="mb-0">'
        f'<a href="{e(powered_by_url)}" rel="noopener">{e(powered_by_label)}</a>'
        " — process templates, ceremonies, and discipline depth.</p>"
        '</footer>'
    )


def render_topic_preview_trigger(
    *,
    href: str,
    title: str,
    description: str = "",
    eyebrow: str = "Topic",
    fs_pack: str | None = None,
    link_extra_class: str = "",
) -> str:
    """Card-style control that opens *href* in an on-page preview (iframe with ``?fs-embed=1``).

    Requires ``forge-theme.js`` (modal + click wiring) and ``forgesdlc-theme.css``
    (embed trims sidebar/theme control; sticky primary nav remains; card styles). Without JS, the link navigates normally.

    *fs_pack* may add BEM modifiers (e.g. enterprise) for ``forgesdlc-pack-*.css``.
    *link_extra_class* — optional extra classes on the anchor (e.g. ``ks-parallax-inner`` for tile tilt).
    """
    desc_html = (
        f'<p class="fs-topic-preview-card__desc">{e(description)}</p>'
        if description.strip()
        else ""
    )
    mod = ""
    if fs_pack and str(fs_pack).strip().lower() == "enterprise":
        mod = " fs-topic-preview-card--pack"
    extra = link_extra_class.strip()
    anchor_cls = f"fs-topic-preview-card{mod}"
    if extra:
        anchor_cls = f"{anchor_cls} {extra}"
    return (
        f'<a class="{anchor_cls}" '
        f'href="{e(href)}" '
        'role="button" aria-haspopup="dialog">'
        f'<span class="fs-topic-preview-card__eyebrow">{e(eyebrow)}</span>'
        f'<span class="fs-topic-preview-card__title">{e(title)}</span>'
        f"{desc_html}"
        '<span class="fs-topic-preview-card__hint">Preview on this page</span>'
        "</a>"
    )


def render_ks_chart_mount(
    *,
    chart_id: str,
    kind: str,
    data: dict[str, object] | None = None,
    data_url: str | None = None,
    title: str = "",
) -> str:
    """Mount point for ``forge-data-charts.js`` (inline *data* or fetch *data_url*)."""
    tid = e(chart_id)
    k = e(kind)
    attrs = [
        f'id="{tid}"',
        'class="ks-chart-mount mb-3"',
        'data-ks-chart',
        f'data-ks-chart-kind="{k}"',
    ]
    if data is not None:
        raw = json.dumps(data, separators=(",", ":"))
        attrs.append(f'data-ks-chart-json="{e(raw)}"')
    if data_url is not None:
        attrs.append(f'data-ks-chart-url="{e(data_url)}"')
    cap = f'<p class="forge-support small mb-1"><strong>{e(title)}</strong> · <code>{k}</code></p>' if title else ""
    return f'{cap}<div {" ".join(attrs)}></div>'
