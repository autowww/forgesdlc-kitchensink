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
    """Convert ``<code class="language-mermaid">`` blocks to Forge diagram divs.

    Returns ``(transformed_html, has_mermaid)``.
    """
    pattern = r'<pre><code class="language-mermaid">(.*?)</code></pre>'
    has_mermaid = bool(re.search(pattern, html_text, re.DOTALL))

    def _replace(m: re.Match) -> str:
        diagram = html_mod.unescape(m.group(1)).strip()
        esc = (
            diagram.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
        )
        return (
            '<div class="forge-diagram breathe-static">'
            f'<div class="mermaid small">{esc}</div></div>'
        )

    result = re.sub(pattern, _replace, html_text, flags=re.DOTALL)
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
