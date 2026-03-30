"""HTML text helpers for handbook chrome."""

from __future__ import annotations

import html as html_mod
import re


def plain_text_from_first_paragraph(html: str, *, max_len: int = 220) -> str:
    """Strip tags from the first ``<p>`` for handbook intro text."""
    m = re.search(r"<p>(.*?)</p>", html, re.DOTALL | re.IGNORECASE)
    if not m:
        return ""
    inner = re.sub(r"<[^>]+>", "", m.group(1))
    inner = html_mod.unescape(inner.replace("\n", " ").strip())
    if len(inner) <= max_len:
        return inner
    trimmed = inner[: max_len + 1]
    if " " in trimmed:
        trimmed = trimmed.rsplit(" ", 1)[0]
    return trimmed.rstrip(",;:") + "…"
