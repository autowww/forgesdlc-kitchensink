"""Post-process handbook HTML so crawlers do not treat repo-only paths as pages."""

from __future__ import annotations

import html as html_module
import re

_ANCHOR = re.compile(
    r'<a\b([^>]*?)\bhref="([^"]+)"([^>]*)>(.*?)</a>',
    re.DOTALL | re.IGNORECASE,
)


def _strip_simple_tags(fragment: str) -> str:
    return re.sub(r"<[^>]+>", "", fragment).strip()


def _should_neutralize(href: str) -> bool:
    """Return True when *href* points at repository artifacts not emitted as handbook HTML."""
    if href.startswith(("http://", "https://", "mailto:")):
        return False
    raw = href.split("#", 1)[0].split("?", 1)[0].replace("\\", "/").strip()
    low = raw.lower()
    if low.endswith(".md"):
        return False
    if ".cursor/" in low or low.startswith(".cursor/"):
        return True
    return low.endswith((".py", ".mdc", ".sh"))


def neutralize_repo_artifact_links(html: str) -> str:
    """Replace navigable anchors to repo files with ``<code class=\"forge-path-ref\">`` fragments."""
    out_parts: list[str] = []
    pos = 0
    for m in _ANCHOR.finditer(html):
        out_parts.append(html[pos : m.start()])
        href = m.group(2)
        inner = m.group(4)
        if not _should_neutralize(href):
            out_parts.append(m.group(0))
        else:
            plain = _strip_simple_tags(inner)
            label = plain if plain else href.replace("\\", "/").split("/")[-1]
            esc = html_module.escape(label, quote=False)
            out_parts.append(f'<code class="forge-path-ref">{esc}</code>')
        pos = m.end()
    out_parts.append(html[pos:])
    return "".join(out_parts)
