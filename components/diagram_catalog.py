"""Diagram template key → SVG filename (Kitchen Sink ``assets/svg``).

Requires ``pages._diagram_gallery`` on ``sys.path`` (kitchensink ``generator/``),
same as ``build-site.py`` / ``build-handbook.py``.
"""
from __future__ import annotations

from functools import lru_cache


@lru_cache(maxsize=1)
def diagram_key_to_svg() -> dict[str, str]:
    """Map gallery ``key`` (e.g. ``linear``) to ``template-*.svg`` filename."""
    from pages._diagram_gallery import _FAMILIES

    m: dict[str, str] = {}
    for fam in _FAMILIES:
        for item in fam["items"]:
            m[str(item["key"])] = str(item["svg"])
    return m


def valid_diagram_keys() -> frozenset[str]:
    return frozenset(diagram_key_to_svg().keys())


def resolve_diagram_src(*, key: str | None, src: str | None) -> tuple[str, str]:
    """Return ``(href_under_assets, resolved_filename)`` for ``<img src>``.

    * *key* — catalog key → ``assets/svg/<filename>``.
    * *src* — site-relative path under ``assets/`` (no ``..``), e.g. ``svg/custom/foo.svg``.
    """
    if src and str(src).strip():
        raw = str(src).strip().lstrip("/")
        if ".." in raw or raw.startswith("http"):
            raise ValueError(f"Invalid ks-diagram src: {src!r}")
        href = raw if raw.startswith("assets/") else f"assets/{raw}"
        name = href.split("/")[-1]
        return href, name
    if not key or not str(key).strip():
        raise ValueError("ks-diagram requires ``key`` or ``src``")
    k = str(key).strip()
    m = diagram_key_to_svg()
    if k not in m:
        raise ValueError(f"Unknown ks-diagram key: {k!r}; valid: {sorted(m)[:8]}…")
    fn = m[k]
    return f"assets/svg/{fn}", fn
