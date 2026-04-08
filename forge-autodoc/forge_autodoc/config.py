"""YAML / dataclass configuration for standalone handbook builds."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Mapping

import yaml

from forge_autodoc.files import DEFAULT_SKIP_DIR_NAMES


@dataclass
class HandbookBuildConfig:
    """Inputs for ``forge-autodoc build``."""

    content_root: Path
    output_dir: Path
    kitchensink: Path
    handbook_name: str = "Handbook"
    skip_dir_names: frozenset[str] = field(default_factory=lambda: DEFAULT_SKIP_DIR_NAMES)
    canonical_url_prefix: str | None = None
    """If set, canonical note links to ``{prefix}/{md_rel}`` (no scheme = relative path shown)."""
    show_canonical_note: bool = True
    """If False, omit the contributor \"Canonical source\" / rebuild callout (e.g. public product handbook)."""
    chrome_overrides: Mapping[str, str] | None = None
    """Optional merge into locale chrome JSON (e.g. footer labels on consumer sites or neutral public handbook footers)."""
    seo_public_origin: str | None = None
    """If set with *seo_url_prefix*, emit canonical / Open Graph URLs (e.g. ``https://blueprints.forgesdlc.com``)."""
    seo_url_prefix: str | None = None
    """URL path prefix for published HTML (e.g. ``/lenses/guides``), no trailing slash."""
    seo_default_og_image: str | None = None
    """Absolute image URL for ``og:image`` when not overridden per page."""


def _resolve_path(base: Path, value: str | Path) -> Path:
    p = Path(value)
    if p.is_absolute():
        return p
    return (base / p).resolve()


def load_handbook_config(path: Path) -> HandbookBuildConfig:
    """Load ``HandbookBuildConfig`` from a YAML file (paths relative to the file’s directory)."""
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise ValueError("Config root must be a mapping")
    base = path.parent.resolve()
    skip = raw.get("skip_dir_names")
    skip_set: frozenset[str]
    if skip is None:
        skip_set = DEFAULT_SKIP_DIR_NAMES
    else:
        if not isinstance(skip, list):
            raise ValueError("skip_dir_names must be a list of strings")
        skip_set = frozenset(str(x) for x in skip)
    co = raw.get("chrome_overrides")
    chrome_overrides: dict[str, str] | None = None
    if isinstance(co, dict):
        chrome_overrides = {str(k): str(v) for k, v in co.items()}
    return HandbookBuildConfig(
        content_root=_resolve_path(base, raw["content_root"]),
        output_dir=_resolve_path(base, raw["output_dir"]),
        kitchensink=_resolve_path(base, raw["kitchensink"]),
        handbook_name=str(raw.get("handbook_name", "Handbook")),
        skip_dir_names=skip_set,
        canonical_url_prefix=(str(raw["canonical_url_prefix"]) if raw.get("canonical_url_prefix") else None),
        show_canonical_note=bool(raw.get("show_canonical_note", True)),
        chrome_overrides=chrome_overrides,
    )


def handbook_config_from_mapping(raw: dict[str, Any], base_dir: Path) -> HandbookBuildConfig:
    """Build config from a dict (paths relative to *base_dir*)."""
    skip = raw.get("skip_dir_names")
    skip_set = (
        DEFAULT_SKIP_DIR_NAMES
        if skip is None
        else frozenset(str(x) for x in skip)
    )
    co = raw.get("chrome_overrides")
    chrome_overrides: dict[str, str] | None = None
    if isinstance(co, dict):
        chrome_overrides = {str(k): str(v) for k, v in co.items()}
    return HandbookBuildConfig(
        content_root=_resolve_path(base_dir, raw["content_root"]),
        output_dir=_resolve_path(base_dir, raw["output_dir"]),
        kitchensink=_resolve_path(base_dir, raw["kitchensink"]),
        handbook_name=str(raw.get("handbook_name", "Handbook")),
        skip_dir_names=skip_set,
        canonical_url_prefix=(
            str(raw["canonical_url_prefix"]) if raw.get("canonical_url_prefix") else None
        ),
        show_canonical_note=bool(raw.get("show_canonical_note", True)),
        chrome_overrides=chrome_overrides,
        seo_public_origin=(
            str(raw["seo_public_origin"]) if raw.get("seo_public_origin") else None
        ),
        seo_url_prefix=str(raw["seo_url_prefix"]) if raw.get("seo_url_prefix") else None,
        seo_default_og_image=(
            str(raw["seo_default_og_image"]) if raw.get("seo_default_og_image") else None
        ),
    )
