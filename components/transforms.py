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
    """Parse fenced body: YAML-ish ``key:`` / ``alt:`` / ``expand:`` / ``src:`` or a single-line key."""
    text = html_mod.unescape(raw).strip()
    if not text:
        raise ValueError("diagram fence is empty")
    out: dict[str, object] = {}
    first_line = text.split("\n", 1)[0].strip()
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
        }
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        name, _, val = line.partition(":")
        name = name.strip().lower()
        val = val.strip().strip('"').strip("'")
        if name in ("expand", "trigger"):
            out["expand"] = val.lower() in ("1", "true", "yes", "on")
        elif name == "decorative":
            out["decorative"] = val.lower() in ("1", "true", "yes", "on")
        elif name in ("key", "alt", "src", "title", "caption"):
            out[name if name != "title" else "alt"] = val
    if "expand" not in out:
        out["expand"] = False
    if "decorative" not in out:
        out["decorative"] = False
    if "caption" not in out:
        out["caption"] = ""
    return out


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


def convert_ks_diagram_blocks(html_text: str) -> tuple[str, bool]:
    """Replace diagram fenced blocks (Markdown ``language-*`` classes) with static SVG tiles.

    Supports public fence names ``blueprint-diagram`` / ``blueprint-diagram-expand`` and
    legacy ``ks-diagram`` / ``ks-diagram-expand`` for backward compatibility.

    Returns ``(transformed_html, has_ks_diagram)``.
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
    keys = valid_diagram_keys()

    def _replace(m: re.Match, fence_expandable: bool) -> str:
        raw = m.group(1) or m.group(2) or ""
        parsed = _parse_ks_diagram_body(raw)
        key_val = parsed.get("key")
        src_val = parsed.get("src")
        key_str = str(key_val).strip() if key_val else ""
        src_str = str(src_val).strip() if src_val else ""
        expand_flag = bool(parsed.get("expand")) or fence_expandable
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
        return ks_diagram_tile_html(
            img_href=href,
            alt=alt,
            diagram_key=catalog_key,
            expandable=expand_flag,
            decorative=decorative,
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
    return result, has_ks


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


def apply_all(html_text: str, *, handbook: bool = True) -> tuple[str, bool, bool]:
    """Apply all standard transforms in canonical order.

    Returns ``(html, has_mermaid, has_ks_diagram)``.
    ``has_ks_diagram`` is true when SVG template fences and/or ASCII fences with
    ``expand:`` and a valid catalog ``key:`` are present (diagram legend modal).
    """
    html_text, has_mermaid = convert_mermaid_blocks(html_text)
    html_text, _, ascii_modal = convert_ascii_diagram_blocks(html_text)
    html_text, has_ks_svg = convert_ks_diagram_blocks(html_text)
    html_text = enhance_tables(html_text, handbook=handbook)
    html_text = enhance_blockquotes(html_text)
    html_text = enhance_code_blocks(html_text)
    has_ks_diagram = has_ks_svg or ascii_modal
    return html_text, has_mermaid, has_ks_diagram
