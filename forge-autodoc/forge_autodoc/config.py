"""YAML / dataclass configuration for standalone handbook builds."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

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
    return HandbookBuildConfig(
        content_root=_resolve_path(base, raw["content_root"]),
        output_dir=_resolve_path(base, raw["output_dir"]),
        kitchensink=_resolve_path(base, raw["kitchensink"]),
        handbook_name=str(raw.get("handbook_name", "Handbook")),
        skip_dir_names=skip_set,
        canonical_url_prefix=(str(raw["canonical_url_prefix"]) if raw.get("canonical_url_prefix") else None),
    )


def handbook_config_from_mapping(raw: dict[str, Any], base_dir: Path) -> HandbookBuildConfig:
    """Build config from a dict (paths relative to *base_dir*)."""
    skip = raw.get("skip_dir_names")
    skip_set = (
        DEFAULT_SKIP_DIR_NAMES
        if skip is None
        else frozenset(str(x) for x in skip)
    )
    return HandbookBuildConfig(
        content_root=_resolve_path(base_dir, raw["content_root"]),
        output_dir=_resolve_path(base_dir, raw["output_dir"]),
        kitchensink=_resolve_path(base_dir, raw["kitchensink"]),
        handbook_name=str(raw.get("handbook_name", "Handbook")),
        skip_dir_names=skip_set,
        canonical_url_prefix=(
            str(raw["canonical_url_prefix"]) if raw.get("canonical_url_prefix") else None
        ),
    )
