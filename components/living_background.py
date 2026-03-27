"""Living background system — preset-driven motif URLs and optional overlay HTML."""

from __future__ import annotations

import html
import json
from functools import lru_cache
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parent.parent
_PRESETS_PATH = _REPO_ROOT / "assets" / "motion-presets" / "living-archetype-presets.json"


@lru_cache(maxsize=1)
def load_living_presets() -> dict:
    raw = _PRESETS_PATH.read_text(encoding="utf-8")
    return json.loads(raw)


def living_global_src(*, assets_prefix: str = "assets/svg/living") -> str:
    data = load_living_presets()
    rel = str(data.get("global_field") or "global/field-rails-01.svg").strip()
    return f"{assets_prefix.rstrip('/')}/{rel}"


def living_motif_src(archetype: str, *, assets_prefix: str = "assets/svg/living") -> str | None:
    data = load_living_presets()
    arch = (data.get("archetypes") or {}).get(archetype)
    if not arch:
        return None
    rel = arch.get("motif_file")
    if not rel:
        return None
    return f"{assets_prefix.rstrip('/')}/{str(rel).lstrip('/')}"


def living_section_overlay_html(archetype: str, *, assets_prefix: str = "assets/svg/living") -> str:
    """First-child overlay: fetch-inlined ambient SVG for this archetype (or empty)."""
    src = living_motif_src(archetype, assets_prefix=assets_prefix)
    if not src:
        return ""
    esc = html.escape(src, quote=True)
    return (
        f'<div class="ks-section-bg ks-ambient-bg ks-bg-density--low" '
        f'data-ks-bg-src="{esc}" aria-hidden="true"></div>'
    )


def living_default_intensity(archetype: str) -> int:
    data = load_living_presets()
    arch = (data.get("archetypes") or {}).get(archetype) or {}
    v = arch.get("intensity_default", 1)
    try:
        return int(v)
    except (TypeError, ValueError):
        return 1
