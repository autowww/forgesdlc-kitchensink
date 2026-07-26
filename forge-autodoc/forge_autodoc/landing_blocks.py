"""Parse frontmatter landing_blocks and inject spatial HTML into handbook body."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Mapping

from forge_autodoc.ks_path import ensure_kitchensink_importable

try:
    import yaml
except ImportError:  # pragma: no cover
    yaml = None  # type: ignore[assignment]


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


def _apply_href_prefix(value: Any, prefix: str) -> Any:
    """Prefix relative handbook hrefs (e.g. architecture hub one level deeper)."""
    if not prefix:
        return value
    if isinstance(value, list):
        return [_apply_href_prefix(item, prefix) for item in value]
    if isinstance(value, dict):
        out = {k: _apply_href_prefix(v, prefix) for k, v in value.items()}
        href = out.get("href")
        if isinstance(href, str) and href and not href.startswith(("http://", "https://", "#", "mailto:")):
            out["href"] = f"{prefix}{href.lstrip('/')}"
        return out
    return value


def resolve_landing_block_sources(
    blocks: Mapping[str, Any],
    *,
    content_root: Path | None,
) -> dict[str, Any]:
    """Inline ``source: relative/path.yaml`` for blocks such as ``layer_strata``."""
    if not content_root or yaml is None:
        return dict(blocks)
    resolved: dict[str, Any] = {}
    for block_type, config in blocks.items():
        if not isinstance(config, Mapping):
            resolved[block_type] = config
            continue
        cfg = dict(config)
        source = str(cfg.get("source", "")).strip()
        if source:
            src_path = (content_root / source.replace("\\", "/")).resolve()
            if src_path.is_file():
                loaded = yaml.safe_load(src_path.read_text(encoding="utf-8"))
                if isinstance(loaded, dict):
                    cfg = {**loaded, **{k: v for k, v in cfg.items() if k != "source"}}
        href_prefix = str(cfg.pop("href_prefix", "")).strip()
        if href_prefix:
            cfg = _apply_href_prefix(cfg, href_prefix)
        resolved[block_type] = cfg
    return resolved


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
    *,
    content_root: Path | None = None,
) -> str:
    blocks = resolve_landing_block_sources(
        parse_landing_blocks(frontmatter),
        content_root=content_root,
    )
    if not blocks:
        return body_html
    ensure_kitchensink_importable(kitchensink_root)
    from handbook_landing import apply_landing_markers

    return apply_landing_markers(body_html, blocks)
