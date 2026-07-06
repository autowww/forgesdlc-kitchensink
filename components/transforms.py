"""HTML post-processing transforms applied to Markdown-generated HTML.

Each function takes an HTML string and returns a transformed copy.
They are designed to be chained::

    html, has_mermaid = convert_mermaid_blocks(html)
    html, _, ascii_modal = convert_ascii_diagram_blocks(html)
    html, has_ks_diagram = convert_ks_diagram_blocks(html)
    html = enhance_tables(html)
    html = enhance_blockquotes(html)
    html = enhance_code_blocks(html)

``apply_all`` merges SVG-template and ASCII-expand modal needs into ``has_ks_diagram``.

All transforms emit Forge-themed markup (dark AI-native palette).
"""
from __future__ import annotations

import html as html_mod
import json
import re

from diagram_catalog import (
    accessibility_label_for_src,
    diagram_key_accessibility_label,
    resolve_diagram_src,
    valid_diagram_keys,
)
from diagram_flow import flow_diagram_figure_html

_GENERIC_ALT_PHRASES = frozenset(
    {
        "",
        "diagram",
        "diagram illustration",
        "ascii diagram",
        "illustration",
        "image",
        "picture",
        "photo",
    }
)
_GENERIC_ALT_CF = frozenset(s.casefold() for s in _GENERIC_ALT_PHRASES)


def _is_generic_alt(text: str) -> bool:
    return text.strip().casefold() in _GENERIC_ALT_CF


def _alt_to_vertical_flow(alt: str) -> str:
    """Turn descriptive ``alt:`` prose with arrows into a readable monospace flow."""
    text = alt.strip()
    parts = [p.strip() for p in re.split(r"\s*(?:→|->|--►|—>| through )\s*", text, flags=re.I) if p.strip()]
    if len(parts) >= 2:
        lines: list[str] = []
        for i, part in enumerate(parts):
            lines.append(part)
            if i < len(parts) - 1:
                lines.extend(["    |", "    v"])
        return "\n".join(lines)
    return text


def _resolve_ks_diagram_display_alt_caption(
    parsed: dict[str, object],
    *,
    key_str: str,
    src_str: str,
) -> tuple[str, bool]:
    """Return ``(img_alt, decorative)`` for SVG template tiles."""
    if bool(parsed.get("decorative")):
        return "", True
    caption = str(parsed.get("caption") or "").strip()
    raw_alt = str(parsed.get("alt") or "").strip()
    if raw_alt and not _is_generic_alt(raw_alt):
        return raw_alt, False
    if caption:
        return caption, False
    k = key_str.strip()
    if k:
        return diagram_key_accessibility_label(k), False
    if src_str.strip():
        return accessibility_label_for_src(src_str), False
    return "Forge diagram template", False


def resolve_ks_diagram_tile_alt(
    *,
    key: str = "",
    src: str = "",
    alt: str = "",
    caption: str = "",
    decorative: bool = False,
) -> tuple[str, bool]:
    """Public helper for programmatic tiles (same resolution as Markdown fences)."""
    return _resolve_ks_diagram_display_alt_caption(
        {"alt": alt, "caption": caption, "decorative": decorative},
        key_str=(key or "").strip(),
        src_str=(src or "").strip(),
    )


def enhance_tables(html_text: str, *, handbook: bool = True) -> str:
    """Add Forge-themed responsive wrapper and classes to bare ``<table>`` elements."""
    if handbook:
        table_open = (
            '<div class="forge-table-wrap mt-2 mb-3">'
            '<table class="table table-striped mb-0 forge-table-handbook">'
        )
    else:
        table_open = (
            '<div class="forge-table-wrap mt-2 mb-3">'
            '<table class="table table-sm table-striped mb-0">'
        )
    html_text = html_text.replace("<table>", table_open)
    html_text = html_text.replace("</table>", "</table></div>")
    html_text = html_text.replace("<thead>", "<thead>")
    return html_text


def enhance_blockquotes(html_text: str) -> str:
    """Convert ``<blockquote>`` blocks to Forge callouts.

    Recognises ``**Warning**``, ``**Note**``, and ``**Template**`` prefixes
    and maps them to appropriate callout variants.
    """
    html_text = re.sub(
        r"<blockquote>\s*<p><strong>Warning</strong>",
        '<div class="forge-callout forge-callout-amber"><p class="callout-label text-amber">Warning</p><p class="forge-support mb-0"><strong>Warning</strong>',
        html_text,
    )
    html_text = re.sub(
        r"<blockquote>\s*<p><strong>Note</strong>",
        '<div class="forge-callout forge-callout-cyan"><p class="callout-label text-cyan">Note</p><p class="forge-support mb-0"><strong>Note</strong>',
        html_text,
    )
    html_text = re.sub(
        r"<blockquote>\s*<p><strong>Template</strong>",
        '<div class="forge-callout forge-callout-amber"><p class="callout-label text-amber">Template</p><p class="forge-support mb-0"><strong>Template</strong>',
        html_text,
    )
    html_text = html_text.replace(
        "<blockquote>",
        '<div class="forge-callout forge-callout-surface">',
    )
    html_text = html_text.replace("</blockquote>", "</div>")
    return html_text


def enhance_code_blocks(html_text: str) -> str:
    """Add Forge styling to ``<pre><code>`` blocks."""
    html_text = re.sub(
        r'<pre><code class="language-(\w+)"',
        r'<pre class="forge-code"><code class="language-\1"',
        html_text,
    )
    html_text = html_text.replace(
        "<pre><code>",
        '<pre class="forge-code"><code>',
    )
    return html_text


def convert_mermaid_blocks(html_text: str) -> tuple[str, bool]:
    """Convert fenced diagram-as-code blocks to Forge diagram divs.

    Supports:

    - ``language-mermaid`` — inline diagram (optionally add modal + ``openDiagramModal`` via layout).
    - ``language-mermaid-expand`` — same as above but adds ``forge-diagram-trigger`` and
      ``onclick="openDiagramModal(this)"`` so ``forge-theme.js`` can open a lightbox after the
      diagram runtime renders (requires ``include_diagram_expand_modal`` on ``handbook_page`` / ``product_page``).

    Fence language in Markdown: `` ```mermaid `` or `` ```mermaid-expand ``.

    Returns ``(transformed_html, has_mermaid)``.
    """
    pattern_expand = r'<pre><code class="language-mermaid-expand">(.*?)</code></pre>'
    pattern_plain = r'<pre><code class="language-mermaid">(.*?)</code></pre>'
    has_mermaid = bool(
        re.search(pattern_expand, html_text, re.DOTALL)
        or re.search(pattern_plain, html_text, re.DOTALL)
    )

    def _escape_diagram(m: re.Match) -> str:
        diagram = html_mod.unescape(m.group(1)).strip()
        return (
            diagram.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
        )

    def _wrap(esc: str, expandable: bool) -> str:
        extra_class = " forge-diagram-trigger" if expandable else ""
        onclick = ' onclick="openDiagramModal(this)"' if expandable else ""
        return (
            f'<div class="forge-diagram breathe-static{extra_class}"{onclick}>'
            f'<div class="mermaid small">{esc}</div></div>'
        )

    def _replace_expand(m: re.Match) -> str:
        return _wrap(_escape_diagram(m), True)

    def _replace_plain(m: re.Match) -> str:
        return _wrap(_escape_diagram(m), False)

    result = re.sub(pattern_expand, _replace_expand, html_text, flags=re.DOTALL)
    result = re.sub(pattern_plain, _replace_plain, result, flags=re.DOTALL)
    return result, has_mermaid


def _parse_ks_diagram_body(raw: str) -> dict[str, object]:
    """Parse fenced body metadata only (no ``fallback_ascii`` body)."""
    meta, _ = _parse_ks_diagram_fence(raw)
    return meta


_META_LINE_KS = re.compile(
    r"^(key|alt|caption|expand|decorative|src|fallback_ascii"
    r"|title|summary|node|detail|more)\s*:\s*(.*)$",
    re.IGNORECASE,
)


def _parse_ks_diagram_fence(raw: str) -> tuple[dict[str, object], str]:
    """Parse ``blueprint-diagram`` fence: metadata prefix + optional ``fallback_ascii`` body."""
    text = html_mod.unescape(raw).strip()
    if not text:
        raise ValueError("diagram fence is empty")
    lines = text.split("\n")
    first_line = lines[0].strip()
    if ":" not in first_line:
        tok = first_line.split()[0].strip()
        if not tok:
            raise ValueError("diagram fence: missing template key")
        return {
            "key": tok,
            "alt": "",
            "caption": "",
            "expand": False,
            "decorative": False,
        }, ""
    meta: dict[str, object] = {}
    fallback_ascii = ""
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip() if line else ""
        if not stripped or stripped.startswith("#"):
            i += 1
            continue
        m = _META_LINE_KS.match(stripped)
        if not m:
            break
        name, val = m.group(1).lower(), m.group(2).strip().strip('"').strip("'")
        if name == "fallback_ascii":
            if val in ("|", ">", ""):
                i += 1
                fallback_ascii = "\n".join(lines[i:]).rstrip("\n")
                break
            fallback_ascii = val
            i += 1
        elif name in ("expand", "trigger"):
            meta["expand"] = val.lower() in ("1", "true", "yes", "on")
            i += 1
        elif name == "decorative":
            meta["decorative"] = val.lower() in ("1", "true", "yes", "on")
            i += 1
        elif name == "node":
            nodes = meta.setdefault("nodes", [])
            if isinstance(nodes, list):
                nodes.append({"label": val})
            i += 1
        elif name in ("detail", "more"):
            nodes = meta.get("nodes")
            if isinstance(nodes, list) and nodes:
                nodes[-1][name] = val
            i += 1
        elif name in ("key", "alt", "src", "caption", "title", "summary"):
            meta[name] = val
            i += 1
        else:
            i += 1
    if "expand" not in meta:
        meta["expand"] = False
    if "decorative" not in meta:
        meta["decorative"] = False
    if "caption" not in meta:
        meta["caption"] = ""
    return meta, fallback_ascii


_META_LINE_ASCII = re.compile(
    r"^(key|alt|caption|expand|decorative)\s*:\s*(.*)$",
    re.IGNORECASE,
)


def _parse_ascii_diagram_body(raw: str) -> tuple[dict[str, object], str]:
    """Split metadata prefix from ASCII body.

    Only lines matching ``key:`` / ``alt:`` / ``caption:`` / ``expand:`` at the
    start of the fence are metadata; the first non-matching line begins the art.
    """
    text = html_mod.unescape(raw)
    lines = text.split("\n")
    meta: dict[str, object] = {}
    i = 0
    while i < len(lines):
        line = lines[i]
        m = _META_LINE_ASCII.match(line.strip() if line else "")
        if not m:
            break
        name, val = m.group(1).lower(), m.group(2).strip().strip('"').strip("'")
        if name == "expand":
            meta["expand"] = val.lower() in ("1", "true", "yes", "on")
        elif name == "decorative":
            meta["decorative"] = val.lower() in ("1", "true", "yes", "on")
        else:
            meta[name] = val
        i += 1
    ascii_body = "\n".join(lines[i:])
    return meta, ascii_body


_ASCII_CONNECTOR_LINE = re.compile(r"^[\s|v↓▼+\\\-─>►→·]+$", re.UNICODE)


def _ascii_diagram_text_lines(ascii_body: str) -> list[str]:
    lines: list[str] = []
    for raw in ascii_body.splitlines():
        line = raw.strip()
        if not line or _ASCII_CONNECTOR_LINE.match(line):
            continue
        lines.append(line)
    return lines


def _split_ascii_title_and_nodes(ascii_body: str) -> tuple[str, list[str]]:
    chunks = ascii_body.strip().split("\n\n", 1)
    if len(chunks) == 2:
        title = chunks[0].strip().splitlines()[0].strip()
        nodes = _ascii_diagram_text_lines(chunks[1])
        if nodes:
            return title, nodes
    nodes = _ascii_diagram_text_lines(ascii_body)
    if len(nodes) >= 2:
        return nodes[0], nodes[1:]
    return "", nodes


def _svg_text(text: str, *, x: float, y: float, anchor: str = "start", **attrs: object) -> str:
    esc = html_mod.escape(text, quote=False)
    extra = "".join(f' {k}="{html_mod.escape(str(v), quote=True)}"' for k, v in attrs.items())
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}"{extra}>{esc}</text>'


def ascii_flow_to_inline_svg(ascii_body: str) -> str:
    """Render labeled monospace flows as a simple stacked-box SVG (default diagram view)."""
    title, nodes = _split_ascii_title_and_nodes(ascii_body)
    if not title and not nodes:
        return ""
    box_w = 640
    box_h = 44
    arrow_h = 22
    pad_x = 40
    title_h = 28 if title else 0
    n = max(len(nodes), 1)
    height = pad_x + title_h + n * box_h + max(0, n - 1) * arrow_h + pad_x
    width = 720
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'width="{width}" height="{height}" role="img" class="ks-diagram-inline-svg">'
    ]
    if title:
        parts.append(
            _svg_text(
                title,
                x=width / 2,
                y=26,
                anchor="middle",
                **{
                    "font-family": "system-ui, Segoe UI, sans-serif",
                    "font-size": "13",
                    "font-weight": "700",
                    "fill": "#06B6D4",
                },
            )
        )
    y = pad_x + title_h
    draw_nodes = nodes if nodes else [title]
    for idx, label in enumerate(draw_nodes):
        fill = "#1e293b" if idx == 0 and len(draw_nodes) > 1 else "#1e3a5f"
        parts.append(
            f'<rect x="{pad_x}" y="{y}" width="{box_w}" height="{box_h}" rx="6" '
            f'fill="{fill}" stroke="#334155"/>'
        )
        parts.append(
            _svg_text(
                label[:120],
                x=pad_x + 16,
                y=y + 27,
                **{
                    "font-family": "system-ui, Segoe UI, sans-serif",
                    "font-size": "11",
                    "fill": "#E2E8F0",
                },
            )
        )
        if idx < len(draw_nodes) - 1:
            ax = width / 2
            ay = y + box_h
            parts.append(
                f'<path d="M {ax} {ay} L {ax} {ay + arrow_h - 6}" stroke="#64748B" '
                f'stroke-width="1.5" fill="none"/>'
            )
            parts.append(
                f'<path d="M {ax - 5} {ay + arrow_h - 10} L {ax} {ay + arrow_h - 4} '
                f'L {ax + 5} {ay + arrow_h - 10}" stroke="#64748B" stroke-width="1.5" fill="none"/>'
            )
        y += box_h + arrow_h
    parts.append("</svg>")
    return "".join(parts)


def inline_svg_diagram_tile_html(*, svg_markup: str, alt: str) -> str:
    esc_alt = html_mod.escape(alt, quote=True)
    return (
        f'<div class="forge-diagram breathe-static ks-diagram-tile ks-diagram-tile--inline" '
        f'role="figure" aria-label="{esc_alt}">'
        f'<div class="ks-diagram-canvas ks-diagram-canvas--inline">{svg_markup}</div>'
        "</div>"
    )


def _diagram_dual_group_aria(
    *,
    parsed: dict[str, object],
    alt: str,
    caption: str,
    key_str: str,
    decorative: bool,
) -> str:
    if decorative:
        return "Diagram with ASCII fallback"
    if alt and not _is_generic_alt(alt):
        return alt
    if caption:
        return caption
    if key_str in valid_diagram_keys():
        return diagram_key_accessibility_label(key_str)
    return "Diagram with ASCII fallback"


def ascii_diagram_figure_html(meta: dict[str, object], ascii_body: str) -> str:
    """Build ``<figure class="forge-diagram forge-diagram-ascii">`` for catalog-linked ASCII."""
    keys = valid_diagram_keys()
    key_str = str(meta.get("key") or "").strip()
    caption = str(meta.get("caption") or "").strip()
    raw_alt = str(meta.get("alt") or "").strip()
    decorative = bool(meta.get("decorative"))
    expand = bool(meta.get("expand"))
    catalog_key = key_str if key_str in keys else ""
    if expand and key_str and not catalog_key:
        raise ValueError(f"ascii diagram fence: unknown key {key_str!r}")
    esc_content = html_mod.escape(ascii_body)
    extra = ""
    onclick = ""
    if expand and catalog_key:
        extra = " forge-diagram-trigger ks-diagram-trigger"
        onclick = f" onclick='openDiagramWithDetail(this, {json.dumps(catalog_key)})'"
    dk_attr = ""
    if catalog_key:
        dk_attr = f' data-diagram-key="{html_mod.escape(catalog_key, quote=True)}"'
    figcaption = ""
    if caption:
        figcaption = (
            f'<figcaption class="forge-diagram-ascii-caption forge-support small">'
            f"{html_mod.escape(caption)}</figcaption>"
        )
    inner = (
        f'<pre class="forge-code forge-diagram-ascii-pre">'
        f'<code class="language-text">{esc_content}</code></pre>'
    )
    if decorative:
        role_attr = ' role="presentation"'
        aria_attr = ""
    else:
        role_attr = ' role="figure"'
        if raw_alt and not _is_generic_alt(raw_alt):
            aria_text = raw_alt
        elif caption:
            aria_text = caption
        elif key_str in keys:
            aria_text = diagram_key_accessibility_label(key_str)
        else:
            aria_text = "ASCII process sketch"
        aria_attr = f' aria-label="{html_mod.escape(aria_text, quote=True)}"'
    return (
        f'<figure class="forge-diagram forge-diagram-ascii breathe-static{extra}"{dk_attr}'
        f"{role_attr}{aria_attr}{onclick}>"
        f'<div class="forge-diagram-ascii-canvas">{inner}</div>'
        f"{figcaption}</figure>"
    )


def render_ascii_diagram_fence(raw: str) -> str:
    """Public helper: same output as the ``blueprint-diagram-ascii`` Markdown transform."""
    meta, body = _parse_ascii_diagram_body(raw)
    return ascii_diagram_figure_html(meta, body)


def convert_ascii_diagram_blocks(html_text: str) -> tuple[str, bool, bool]:
    """Replace ``blueprint-diagram-ascii`` / ``ks-diagram-ascii`` fences with ASCII figures.

    Metadata lines (``key:``, ``alt:``, ``caption:``, ``expand:``) must appear as a
    consecutive prefix; the first line that does not match begins the ASCII art.

    Returns ``(transformed_html, has_ascii_diagram, needs_diagram_catalog_modal)``.
    The third flag is True when any block uses ``expand:`` with a valid catalog ``key:``
    (same modal behavior as SVG tiles).
    """
    pattern = (
        r'<pre><code class="language-blueprint-diagram-ascii">(.*?)</code></pre>'
        r'|<pre><code class="language-ks-diagram-ascii">(.*?)</code></pre>'
    )
    has_any = bool(re.search(pattern, html_text, re.DOTALL))
    needs_modal = False
    keys = valid_diagram_keys()

    def _replace(m: re.Match) -> str:
        nonlocal needs_modal
        raw = m.group(1) or m.group(2) or ""
        meta, body = _parse_ascii_diagram_body(raw)
        key_str = str(meta.get("key") or "").strip()
        expand = bool(meta.get("expand"))
        if expand and key_str and key_str in keys:
            needs_modal = True
        return ascii_diagram_figure_html(meta, body)

    result = re.sub(pattern, _replace, html_text, flags=re.DOTALL)
    return result, has_any, needs_modal


def ks_diagram_tile_html(
    *,
    img_href: str,
    alt: str,
    diagram_key: str,
    expandable: bool,
    decorative: bool = False,
) -> str:
    extra = ""
    onclick = ""
    if expandable:
        extra = " forge-diagram-trigger ks-diagram-trigger"
        # Single-quoted onclick value so JSON string quotes are valid in HTML.
        onclick = f" onclick='openDiagramWithDetail(this, {json.dumps(diagram_key)})'"
    dk_attr = ""
    if diagram_key:
        dk_attr = f' data-diagram-key="{html_mod.escape(diagram_key, quote=True)}"'
    if decorative:
        role_attr = ' role="presentation"'
        img_tag = (
            f'<img src="{html_mod.escape(img_href, quote=True)}" alt=""'
            f' aria-hidden="true" loading="lazy" />'
        )
    else:
        role_attr = ' role="figure"'
        esc_alt = html_mod.escape(alt, quote=True)
        img_tag = (
            f'<img src="{html_mod.escape(img_href, quote=True)}" alt="{esc_alt}" loading="lazy" />'
        )
    return (
        f'<div class="forge-diagram breathe-static ks-diagram-tile{extra}"{dk_attr}'
        f'{role_attr}{onclick}>'
        f'<div class="ks-diagram-canvas">'
        f"{img_tag}"
        f"</div></div>"
    )


def dual_diagram_figure_html(
    *,
    svg_tile_html: str,
    ascii_body: str,
    aria_label: str,
    caption: str = "",
    default_view: str = "svg",
    template_toggle: bool = False,
) -> str:
    """Wrap an SVG tile with optional ASCII fallback and a view toggle toolbar."""
    esc_content = html_mod.escape(ascii_body)
    esc_aria = html_mod.escape(aria_label, quote=True)
    figcaption = ""
    if caption:
        figcaption = (
            f'<figcaption class="forge-diagram-ascii-caption forge-support small">'
            f"{html_mod.escape(caption)}</figcaption>"
        )
    view = "ascii" if default_view == "ascii" else "svg"
    svg_hidden = " hidden" if view == "ascii" else ""
    ascii_hidden = "" if view == "ascii" else " hidden"
    if template_toggle:
        label_svg = "Template view"
        label_ascii = "Labeled view"
        btn_label = label_svg if view == "ascii" else label_ascii
        pressed = "true" if view == "ascii" else "false"
    else:
        label_svg = "Diagram view"
        label_ascii = "ASCII view"
        btn_label = label_ascii if view == "svg" else label_svg
        pressed = "false" if view == "svg" else "true"
    ascii_panel = (
        '<div class="forge-diagram-dual__panel forge-diagram-dual__panel--ascii" '
        f'data-panel="ascii"{ascii_hidden}>'
        '<pre class="forge-code forge-diagram-ascii-pre">'
        f'<code class="language-text">{esc_content}</code></pre>'
        "</div>"
    )
    return (
        f'<figure class="forge-diagram forge-diagram-dual breathe-static" '
        f'data-diagram-view="{view}" role="group" aria-label="{esc_aria}">'
        '<div class="forge-diagram-dual__toolbar">'
        '<button type="button" class="forge-diagram-view-toggle btn btn-sm btn-outline-secondary" '
        f'aria-pressed="{pressed}" data-label-svg="{html_mod.escape(label_svg, quote=True)}" '
        f'data-label-ascii="{html_mod.escape(label_ascii, quote=True)}">'
        f"{btn_label}</button>"
        "</div>"
        f'<div class="forge-diagram-dual__panel forge-diagram-dual__panel--svg" '
        f'data-panel="svg"{svg_hidden}>'
        f"{svg_tile_html}"
        "</div>"
        f"{ascii_panel}"
        f"{figcaption}"
        "</figure>"
    )


def convert_ks_diagram_blocks(html_text: str) -> tuple[str, bool, bool]:
    """Replace diagram fenced blocks (Markdown ``language-*`` classes) with static SVG tiles.

    Supports public fence names ``blueprint-diagram`` / ``blueprint-diagram-expand`` and
    legacy ``ks-diagram`` / ``ks-diagram-expand`` for backward compatibility.

    Returns ``(transformed_html, has_ks_diagram, has_ks_diagram_dual)``.
    """
    pattern_expand = (
        r'<pre><code class="language-blueprint-diagram-expand">(.*?)</code></pre>'
        r'|<pre><code class="language-ks-diagram-expand">(.*?)</code></pre>'
    )
    pattern_plain = (
        r'<pre><code class="language-blueprint-diagram">(.*?)</code></pre>'
        r'|<pre><code class="language-ks-diagram">(.*?)</code></pre>'
    )

    has_ks = bool(re.search(pattern_expand, html_text, re.DOTALL)) or bool(
        re.search(pattern_plain, html_text, re.DOTALL)
    )
    has_dual = False
    keys = valid_diagram_keys()

    def _replace(m: re.Match, fence_expandable: bool) -> str:
        nonlocal has_dual
        raw = m.group(1) or m.group(2) or ""
        parsed, fallback_ascii = _parse_ks_diagram_fence(raw)
        key_val = parsed.get("key")
        src_val = parsed.get("src")
        key_str = str(key_val).strip() if key_val else ""
        src_str = str(src_val).strip() if src_val else ""
        expand_flag = bool(parsed.get("expand")) or fence_expandable
        nodes_meta = parsed.get("nodes")
        if isinstance(nodes_meta, list) and nodes_meta and not src_str:
            # Enriched flow fence: node/detail/more metadata drives an HTML flow
            # figure with an Expand flyout (ks-diagram-modal.js).
            if fallback_ascii.strip():
                has_dual = True
            return flow_diagram_figure_html(parsed, fallback_ascii)
        href, _ = resolve_diagram_src(
            key=key_str if key_str else None,
            src=src_str if src_str else None,
        )
        catalog_key = key_str if key_str in keys else ""
        if expand_flag and not catalog_key and src_str:
            catalog_key = ""
        elif expand_flag and not catalog_key and key_str:
            raise ValueError(f"diagram fence: unknown key {key_str!r}")
        alt, decorative = _resolve_ks_diagram_display_alt_caption(
            parsed, key_str=key_str, src_str=src_str
        )
        tile = ks_diagram_tile_html(
            img_href=href,
            alt=alt,
            diagram_key=catalog_key,
            expandable=expand_flag,
            decorative=decorative,
        )
        fallback = fallback_ascii.strip()
        if not fallback:
            if not src_str:
                raw_alt = str(parsed.get("alt") or "").strip()
                if raw_alt and not _is_generic_alt(raw_alt):
                    return ascii_diagram_figure_html(
                        parsed, _alt_to_vertical_flow(raw_alt)
                    )
                return ""
            return tile
        if not src_str:
            # Labeled monospace flow: generated inline SVG (default) + ASCII toggle.
            if expand_flag and key_str and key_str not in keys:
                raise ValueError(f"diagram fence: unknown key {key_str!r}")
            caption = str(parsed.get("caption") or "").strip()
            group_aria = _diagram_dual_group_aria(
                parsed=parsed,
                alt=alt,
                caption=caption,
                key_str=key_str,
                decorative=decorative,
            )
            svg_markup = ascii_flow_to_inline_svg(fallback)
            if svg_markup:
                has_dual = True
                inline_tile = inline_svg_diagram_tile_html(svg_markup=svg_markup, alt=group_aria)
                return dual_diagram_figure_html(
                    svg_tile_html=inline_tile,
                    ascii_body=fallback,
                    aria_label=group_aria,
                    caption=caption,
                    default_view="svg",
                    template_toggle=False,
                )
            return ascii_diagram_figure_html(parsed, fallback)
        has_dual = True
        caption = str(parsed.get("caption") or "").strip()
        group_aria = _diagram_dual_group_aria(
            parsed=parsed,
            alt=alt,
            caption=caption,
            key_str=key_str,
            decorative=decorative,
        )
        return dual_diagram_figure_html(
            svg_tile_html=tile,
            ascii_body=fallback,
            aria_label=group_aria,
            caption=caption,
            default_view="svg",
            template_toggle=False,
        )

    result = re.sub(
        pattern_expand,
        lambda m: _replace(m, True),
        html_text,
        flags=re.DOTALL,
    )
    result = re.sub(
        pattern_plain,
        lambda m: _replace(m, False),
        result,
        flags=re.DOTALL,
    )
    return result, has_ks, has_dual


def extract_toc(html_text: str) -> list[tuple[str, str, int]]:
    """Extract headings for table of contents.

    Returns ``[(id, text, level)]`` for ``<h2>`` and ``<h3>`` elements that
    carry an ``id`` attribute.
    """
    toc: list[tuple[str, str, int]] = []
    for m in re.finditer(r'<h([23])\s+id="([^"]+)"[^>]*>(.*?)</h\1>', html_text):
        level = int(m.group(1))
        hid = m.group(2)
        text = re.sub(r"<[^>]+>", "", m.group(3))
        toc.append((hid, text, level))
    return toc


def apply_all(html_text: str, *, handbook: bool = True) -> tuple[str, bool, bool, bool]:
    """Apply all standard transforms in canonical order.

    Returns ``(html, has_mermaid, has_ks_diagram, has_ks_diagram_dual)``.
    ``has_ks_diagram`` is true when SVG template fences and/or ASCII fences with
    ``expand:`` and a valid catalog ``key:`` are present (diagram legend modal).
    ``has_ks_diagram_dual`` is true when any SVG fence includes ``fallback_ascii``.
    """
    html_text, has_mermaid = convert_mermaid_blocks(html_text)
    html_text, _, ascii_modal = convert_ascii_diagram_blocks(html_text)
    html_text, has_ks_svg, has_dual = convert_ks_diagram_blocks(html_text)
    html_text = enhance_tables(html_text, handbook=handbook)
    html_text = enhance_blockquotes(html_text)
    html_text = enhance_code_blocks(html_text)
    has_ks_diagram = has_ks_svg or ascii_modal
    return html_text, has_mermaid, has_ks_diagram, has_dual
