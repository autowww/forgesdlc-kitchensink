"""Post-process handbook HTML for deployed asset URLs."""

from __future__ import annotations

import hashlib
import re
from functools import lru_cache
from pathlib import Path

_IMG_SRC_RE = re.compile(r'(<img\s[^>]*)src="([^"]+)"([^>]*>)')


@lru_cache(maxsize=256)
def _asset_version_token(assets_dir: str, filename: str) -> str | None:
    path = Path(assets_dir) / filename
    if not path.is_file():
        return None
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    return digest[:8]


def cache_bust_handbook_img_src(html_text: str, assets_dir: Path) -> str:
    """Append ``?v=<sha256-prefix>`` to local ``assets/`` diagram images.

    Busts CDN/browser caches when content SVG bytes change without renaming files.
    """
    assets_key = str(assets_dir.resolve())

    def _fix(m: re.Match[str]) -> str:
        src = m.group(2)
        if src.startswith(("http://", "https://", "data:")):
            return m.group(0)
        if "?" in src:
            return m.group(0)
        rel = src
        prefix = ""
        if rel.startswith("assets/"):
            prefix = "assets/"
            rel = rel[len("assets/") :]
        elif rel.startswith("/assets/"):
            prefix = "/assets/"
            rel = rel[len("/assets/") :]
        else:
            return m.group(0)
        token = _asset_version_token(assets_key, rel)
        if not token:
            return m.group(0)
        return f'{m.group(1)}src="{prefix}{rel}?v={token}"{m.group(3)}'

    return _IMG_SRC_RE.sub(_fix, html_text)


def rewrite_handbook_asset_img_src(html_text: str, public_prefix: str | None) -> str:
    """Rewrite Markdown-relative ``assets/`` and ``../assets/`` image paths to a published prefix."""
    prefix = (public_prefix or "").strip().strip("/")
    if not prefix:
        return html_text

    def _fix(m: re.Match[str]) -> str:
        src = m.group(2)
        if src.startswith(("http://", "https://", "data:", prefix + "/")):
            return m.group(0)
        query = ""
        path_part = src
        if "?" in path_part:
            path_part, query = path_part.split("?", 1)
            query = "?" + query
        if path_part.startswith("assets/"):
            rel = path_part[len("assets/") :]
        elif path_part.startswith("../assets/"):
            rel = path_part[len("../assets/") :]
        else:
            return m.group(0)
        return f'{m.group(1)}src="{prefix}/{rel}{query}"{m.group(3)}'

    return _IMG_SRC_RE.sub(_fix, html_text)
