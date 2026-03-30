"""Kitchensink HTML transforms and ToC extraction (requires KS on path)."""

from __future__ import annotations

from pathlib import Path

from forge_autodoc.ks_path import ensure_kitchensink_importable


def apply_handbook_body_transforms(kitchensink_root: Path, html: str) -> tuple[str, bool, bool]:
    """Run KS ``apply_all`` (Mermaid, ks-diagram, tables, code, etc.)."""
    ensure_kitchensink_importable(kitchensink_root)
    from transforms import apply_all

    return apply_all(html)


def extract_toc_from_html(kitchensink_root: Path, html: str) -> list[tuple[str, str, int]]:
    """Extract heading-based ToC after transforms."""
    ensure_kitchensink_importable(kitchensink_root)
    from transforms import extract_toc

    return extract_toc(html)
