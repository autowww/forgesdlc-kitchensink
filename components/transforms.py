"""HTML post-processing transforms applied to Markdown-generated HTML.

Each function takes an HTML string and returns a transformed copy.
They are designed to be chained::

    html = enhance_tables(html)
    html, has_mermaid = convert_mermaid_blocks(html)
    html = enhance_blockquotes(html)
    html = enhance_code_blocks(html)

All transforms emit Forge-themed markup (dark AI-native palette).
"""
from __future__ import annotations

import html as html_mod
import re


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


def apply_all(html_text: str) -> tuple[str, bool]:
    """Apply all standard transforms in canonical order.

    Returns ``(html, has_mermaid)``.
    """
    html_text, has_mermaid = convert_mermaid_blocks(html_text)
    html_text = enhance_tables(html_text)
    html_text = enhance_blockquotes(html_text)
    html_text = enhance_code_blocks(html_text)
    return html_text, has_mermaid
