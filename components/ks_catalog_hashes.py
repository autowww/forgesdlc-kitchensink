"""Load visual hashes from docs/design/catalog/visual-registry.generated.json."""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
REGISTRY_JSON = REPO_ROOT / "docs" / "design" / "catalog" / "visual-registry.generated.json"


@lru_cache(maxsize=1)
def _entries() -> tuple[dict, ...]:
    if not REGISTRY_JSON.is_file():
        return ()
    data = json.loads(REGISTRY_JSON.read_text(encoding="utf-8"))
    return tuple(data.get("entries") or ())


def layout_shell_attrs(layout_fn: str) -> str:
    """Attribute fragment for layout chrome root (from registry type layout)."""
    from ks_hash_attrs import ks_hash_attrs

    for entry in _entries():
        if entry.get("type") != "layout":
            continue
        syms = entry.get("source_symbols") or []
        if layout_fn in syms:
            slug = str(entry.get("slug") or layout_fn.replace("_", "-"))
            return ks_hash_attrs(entry["hash"], "layout", slug)
    return ""


def page_main_attrs(page_slug: str) -> str:
    """Attribute fragment for page <main> (registry type page or layout-preview)."""
    from ks_hash_attrs import ks_hash_attrs

    for entry in _entries():
        et = entry.get("type")
        if et not in ("page", "layout-preview"):
            continue
        if entry.get("slug") == page_slug:
            label = "page" if et == "page" else "layout-preview"
            return ks_hash_attrs(entry["hash"], label, page_slug)
    return ""


def chrome_region_attrs(region_slug: str) -> str:
    """Attribute fragment for layout chrome regions (registry type chrome-region)."""
    from ks_hash_attrs import ks_hash_attrs

    for entry in _entries():
        if entry.get("type") != "chrome-region":
            continue
        if entry.get("slug") == region_slug:
            slug = str(entry.get("slug") or region_slug)
            return ks_hash_attrs(entry["hash"], "chrome-region", slug)
    return ""
