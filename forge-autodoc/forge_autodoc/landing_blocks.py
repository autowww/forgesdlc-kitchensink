"""Parse frontmatter landing_blocks and inject spatial HTML into handbook body."""

from __future__ import annotations

from typing import Any, Mapping

from forge_autodoc.ks_path import ensure_kitchensink_importable


def _normalize_blocks(raw: Any) -> dict[str, Any]:
    """Accept dict or list-of-single-key dicts from YAML frontmatter."""
    if not raw:
        return {}
    if isinstance(raw, dict):
        return {str(k): v for k, v in raw.items()}
    if isinstance(raw, list):
        merged: dict[str, Any] = {}
        for entry in raw:
            if isinstance(entry, str):
                merged[entry] = {}
            elif isinstance(entry, dict):
                block_type = entry.get("type") or entry.get("block")
                if block_type:
                    cfg = {k: v for k, v in entry.items() if k not in ("type", "block")}
                    merged[str(block_type)] = cfg
        return merged
    return {}


def parse_landing_blocks(frontmatter: Mapping[str, Any]) -> dict[str, Any]:
    return _normalize_blocks(frontmatter.get("landing_blocks"))


def needs_spatial_landing_assets(
    *,
    minimal_shell: bool,
    page_contract_profile: str,
    landing_blocks: Mapping[str, Any],
) -> bool:
    profile = (page_contract_profile or "").strip().lower()
    if landing_blocks:
        return True
    if minimal_shell and profile in ("landing", "hub", ""):
        return profile in ("landing", "hub")
    return profile in ("landing", "hub")


def spatial_landing_head_html(asset_base: str) -> str:
    ab = asset_base if asset_base.endswith("/") or not asset_base else f"{asset_base}/"
    if not ab:
        ab = "assets/"
    return (
        f'  <link rel="stylesheet" href="{ab}ks-nav-layout.css" />\n'
        f'  <link rel="stylesheet" href="{ab}ks-spatial.css" />\n'
        f'  <link rel="stylesheet" href="{ab}ks-spatial-wave2.css" />\n'
    )


def spatial_landing_footer_scripts_html(asset_base: str) -> str:
    ab = asset_base if asset_base.endswith("/") or not asset_base else f"{asset_base}/"
    if not ab:
        ab = "assets/"
    return (
        f'  <script defer src="{ab}ks-peek-rail.js"></script>\n'
        f'  <script defer src="{ab}ks-spatial-rail.js"></script>\n'
    )


def apply_landing_blocks_to_body(
    kitchensink_root,
    body_html: str,
    frontmatter: Mapping[str, Any],
) -> str:
    blocks = parse_landing_blocks(frontmatter)
    if not blocks:
        return body_html
    ensure_kitchensink_importable(kitchensink_root)
    from handbook_landing import apply_landing_markers

    return apply_landing_markers(body_html, blocks)
