"""HTML post-processing transforms applied to Markdown-generated HTML.

Each function takes an HTML string and returns a transformed copy.
They are designed to be chained::

    html, has_mermaid = convert_mermaid_blocks(html)
    html, has_ks_diagram = convert_ks_diagram_blocks(html)
    html = enhance_tables(html)
    html = enhance_blockquotes(html)
    html = enhance_code_blocks(html)

All transforms emit Forge-themed markup (dark AI-native palette).
"""
from __future__ import annotations

import html as html_mod
import json
import re

from diagram_catalog import resolve_diagram_src, valid_diagram_keys


def enhance_tables(html_text: str) -> str:
    """Add Forge-themed responsive wrapper and classes to bare ``<table>`` elements."""
    html_text = html_text.replace(
        "<table>",
        '<div class="forge-table-wrap mt-2 mb-3">'
        '<table class="table table-sm table-striped mb-0">',
    )
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
    """Convert fenced Mermaid blocks to Forge diagram divs.

    Supports:

    - ``language-mermaid`` — inline diagram (optionally add modal + ``openDiagramModal`` via layout).
    - ``language-mermaid-expand`` — same as above but adds ``forge-diagram-trigger`` and
      ``onclick="openDiagramModal(this)"`` so ``forge-theme.js`` can open a lightbox after Mermaid
      renders (requires ``include_diagram_expand_modal`` on ``handbook_page`` / ``product_page``).

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
        raise ValueError("ks-diagram fence is empty")
    out: dict[str, object] = {}
    first_line = text.split("\n", 1)[0].strip()
    if ":" not in first_line:
        tok = first_line.split()[0].strip()
        if not tok:
            raise ValueError("ks-diagram: missing template key")
        return {"key": tok, "alt": "", "expand": False}
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
        elif name in ("key", "alt", "src", "title"):
            out[name if name != "title" else "alt"] = val
    if "expand" not in out:
        out["expand"] = False
    return out


def ks_diagram_tile_html(
    *,
    img_href: str,
    alt: str,
    diagram_key: str,
    expandable: bool,
) -> str:
    esc_alt = html_mod.escape(alt, quote=True)
    key_js = json.dumps(diagram_key) if diagram_key else '""'
    extra = ""
    onclick = ""
    if expandable:
        extra = " forge-diagram-trigger ks-diagram-trigger"
        onclick = f' onclick="openDiagramWithDetail(this, {key_js})"'
    dk_attr = ""
    if diagram_key:
        dk_attr = f' data-diagram-key="{html_mod.escape(diagram_key, quote=True)}"'
    return (
        f'<div class="forge-diagram breathe-static ks-diagram-tile{extra}"{dk_attr}'
        f' role="figure"{onclick}>'
        f'<div class="ks-diagram-canvas">'
        f'<img src="{html_mod.escape(img_href, quote=True)}" alt="{esc_alt}" loading="lazy" />'
        f"</div></div>"
    )


def convert_ks_diagram_blocks(html_text: str) -> tuple[str, bool]:
    """Replace ``language-ks-diagram`` / ``language-ks-diagram-expand`` fenced blocks with static SVG tiles.

    Fence examples::

        ```ks-diagram
        key: linear
        alt: Delivery pipeline
        ```

        ```ks-diagram-expand
        key: sequence
        alt: Request flow
        ```

        ```ks-diagram
        src: svg/custom/foo.svg
        alt: One-off diagram
        expand: true
        ```

    Returns ``(transformed_html, has_ks_diagram)``.
    """
    pattern_expand = r'<pre><code class="language-ks-diagram-expand">(.*?)</code></pre>'
    pattern_plain = r'<pre><code class="language-ks-diagram">(.*?)</code></pre>'
    has_ks = bool(
        re.search(pattern_expand, html_text, re.DOTALL)
        or re.search(pattern_plain, html_text, re.DOTALL)
    )
    keys = valid_diagram_keys()

    def _replace(m: re.Match, fence_expandable: bool) -> str:
        raw = m.group(1)
        parsed = _parse_ks_diagram_body(raw)
        key_val = parsed.get("key")
        src_val = parsed.get("src")
        key_str = str(key_val).strip() if key_val else ""
        src_str = str(src_val).strip() if src_val else ""
        alt = str(parsed.get("alt") or "Diagram illustration").strip() or "Diagram"
        expand_flag = bool(parsed.get("expand")) or fence_expandable
        href, _ = resolve_diagram_src(
            key=key_str if key_str else None,
            src=src_str if src_str else None,
        )
        catalog_key = key_str if key_str in keys else ""
        if expand_flag and not catalog_key and src_str:
            catalog_key = ""
        elif expand_flag and not catalog_key and key_str:
            raise ValueError(f"ks-diagram: unknown key {key_str!r}")
        return ks_diagram_tile_html(
            img_href=href,
            alt=alt,
            diagram_key=catalog_key,
            expandable=expand_flag,
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


def apply_all(html_text: str) -> tuple[str, bool, bool]:
    """Apply all standard transforms in canonical order.

    Returns ``(html, has_mermaid, has_ks_diagram)``.
    """
    html_text, has_mermaid = convert_mermaid_blocks(html_text)
    html_text, has_ks_diagram = convert_ks_diagram_blocks(html_text)
    html_text = enhance_tables(html_text)
    html_text = enhance_blockquotes(html_text)
    html_text = enhance_code_blocks(html_text)
    return html_text, has_mermaid, has_ks_diagram
