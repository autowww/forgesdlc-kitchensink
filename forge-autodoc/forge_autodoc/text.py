"""HTML text helpers for handbook chrome."""

from __future__ import annotations

import html as html_mod
import re


def _norm_plain(s: str) -> str:
    """Collapse whitespace for comparing hero title / lede to body HTML."""
    t = html_mod.unescape(s)
    return re.sub(r"\s+", " ", t.strip())


def _plain_inner_html(inner: str) -> str:
    """Plain text from an HTML fragment (e.g. inside ``<h1>`` or ``<p>``)."""
    stripped = re.sub(r"<[^>]+>", "", inner)
    return _norm_plain(stripped.replace("\n", " "))


def _para_matches_hero_intro(intro: str, para_plain: str) -> bool:
    """True if *para_plain* duplicates the hero lede (including truncated intro with …)."""
    if not intro.strip():
        return False
    intro_n = _norm_plain(intro)
    para_n = _norm_plain(para_plain)
    if intro_n == para_n:
        return True
    if intro.endswith("…") and len(intro) > 1:
        stem = intro[:-1].rstrip()
        stem_n = _norm_plain(stem)
        if stem_n and para_n.startswith(stem_n):
            return True
    return False


def strip_duplicate_handbook_hero_from_body(body_html: str, page_title: str, intro: str) -> str:
    """Remove leading ``<h1>`` / first ``<p>`` when they duplicate ``handbook_page`` hero chrome.

    ``handbook_page`` already renders ``page_title`` and ``intro`` in the header; Markdown output
    typically repeats the same H1 and first paragraph in *body_html*. Stripping avoids double
    titles and ledes. Safe when titles differ (e.g. ``nav_title`` vs Markdown ``#``).
    """
    if not body_html or not page_title.strip():
        return body_html

    title_n = _norm_plain(page_title)
    h1_m = re.match(
        r"(\s*)(<h1\b[^>]*>)(.*?)(</h1>\s*)",
        body_html,
        re.DOTALL | re.IGNORECASE,
    )
    if not h1_m:
        return body_html

    inner_h1 = _plain_inner_html(h1_m.group(3))
    if inner_h1 != title_n:
        return body_html

    rest = body_html[h1_m.end() :]
    if not intro.strip():
        return rest.lstrip()

    pm = re.match(r"(\s*)(<p\b[^>]*>)(.*?)(</p>\s*)", rest, re.DOTALL | re.IGNORECASE)
    if not pm:
        return rest.lstrip()

    para_plain = _plain_inner_html(pm.group(3))
    if not _para_matches_hero_intro(intro, para_plain):
        return rest.lstrip()

    return rest[pm.end() :].lstrip()


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
