"""Tests for handbook sidebar exclusion (prefix + hide_from_nav)."""

from __future__ import annotations

from pathlib import Path

from forge_autodoc.config import HandbookBuildConfig
from forge_autodoc.simple_build import _page_excluded_from_nav, _nav_sort_tuple


def test_exclude_by_path_prefix() -> None:
    cfg = HandbookBuildConfig(
        Path("/c"),
        Path("/o"),
        Path("/k"),
        nav_exclude_path_prefixes=frozenset({"src/forge_lcdl/contracts/"}),
    )
    assert _page_excluded_from_nav(
        "src/forge_lcdl/contracts/pw_chunk_classify/v1/contract.md", {}, cfg
    )
    assert not _page_excluded_from_nav("docs/README.md", {}, cfg)


def test_exclude_by_frontmatter() -> None:
    cfg = HandbookBuildConfig(Path("/c"), Path("/o"), Path("/k"))
    assert _page_excluded_from_nav(
        "docs/OLD.md",
        {"hide_from_nav": "true"},
        cfg,
    )
    assert not _page_excluded_from_nav(
        "docs/OLD.md",
        {"hide_from_nav": "false"},
        cfg,
    )


def test_nav_order_sort() -> None:
    meta = {
        "a/x.md": {"nav_order": "2"},
        "a/y.md": {"nav_order": "1"},
    }
    row_x = ("x.html", "X", "a/x.md")
    row_y = ("y.html", "Y", "a/y.md")
    assert _nav_sort_tuple(row_y, meta) < _nav_sort_tuple(row_x, meta)
