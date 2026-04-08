"""Diagram template key → SVG filename (Kitchen Sink ``assets/svg``).

Requires ``pages._diagram_gallery`` on ``sys.path`` (kitchensink ``generator/``),
same as ``build-site.py`` / ``build-handbook.py``.
"""
from __future__ import annotations

import re
from functools import lru_cache


def _humanize_catalog_label(label: str) -> str:
    """Turn gallery ``label`` like ``linear-flow`` into ``Linear flow`` (sentence-style words)."""
    s = label.strip().replace("_", " ")
    parts = [p for p in re.split(r"[\s-]+", s) if p]
    if not parts:
        return ""
    first = parts[0][:1].upper() + parts[0][1:].lower() if parts[0] else ""
    rest = " ".join(p.lower() for p in parts[1:])
    return f"{first} {rest}".strip()


@lru_cache(maxsize=1)
def diagram_key_to_gallery_label() -> dict[str, str]:
    """Map catalog ``key`` to gallery ``label`` string (slug-style)."""
    from pages._diagram_gallery import _FAMILIES

    m: dict[str, str] = {}
    for fam in _FAMILIES:
        for item in fam["items"]:
            m[str(item["key"])] = str(item["label"])
    return m


def diagram_key_accessibility_label(key: str) -> str:
    """Stable short phrase for ``<img alt>`` / figure labels from catalog metadata."""
    k = str(key).strip()
    labels = diagram_key_to_gallery_label()
    if k in labels:
        human = _humanize_catalog_label(labels[k])
        return f"{human} diagram template"
    slug = k.replace("_", " ").replace("-", " ").strip()
    return f"{slug.title()} diagram template" if slug else "Forge diagram template"


def accessibility_label_for_src(src: str) -> str:
    """Fallback alt text from a site-relative ``assets/`` SVG path."""
    raw = str(src).strip().lstrip("/")
    name = raw.split("/")[-1]
    if name.lower().endswith(".svg"):
        name = name[:-4]
    if name.lower().startswith("template-"):
        name = name[9:]
    human = _humanize_catalog_label(name.replace("_", "-"))
    return f"{human} illustration" if human else "SVG illustration"


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
