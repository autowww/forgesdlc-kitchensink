"""Copy Kitchensink static assets for handbook output."""

from __future__ import annotations

from pathlib import Path

from forge_autodoc.ks_path import ensure_kitchensink_importable


def sync_handbook_assets(kitchensink_root: Path, dest_assets: Path) -> None:
    """Copy forge/docs theme CSS/JS and diagram assets from Kitchensink."""
    ensure_kitchensink_importable(kitchensink_root)
    from ks_assets import sync_handbook_ks_assets

    sync_handbook_ks_assets(kitchensink_root.resolve(), dest_assets)
