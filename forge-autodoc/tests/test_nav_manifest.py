"""Tests for Lenses ``nav.yml`` manifest loading."""

from __future__ import annotations

from pathlib import Path

import pytest

from forge_autodoc.nav_manifest import load_lens_nav_manifest


def test_load_minimal_nav_yaml(tmp_path: Path) -> None:
    p = tmp_path / "nav.yml"
    p.write_text(
        """
version: 1
enforce_public_frontmatter: false
sections:
  - id: start
    title: Start here
    entries:
      - path: docs/index.md
        nav_title: Home
      - path: docs/handbook-public/01-overview.md
""",
        encoding="utf-8",
    )
    m = load_lens_nav_manifest(p)
    assert m.version == 1
    assert len(m.sections) == 1
    assert m.sections[0].id == "start"
    assert [e.path for e in m.sections[0].entries] == [
        "docs/index.md",
        "docs/handbook-public/01-overview.md",
    ]
    assert m.flatten_paths() == [
        "docs/index.md",
        "docs/handbook-public/01-overview.md",
    ]


def test_load_nav_rejects_bad_root(tmp_path: Path) -> None:
    p = tmp_path / "bad.yml"
    p.write_text("[]", encoding="utf-8")
    with pytest.raises(ValueError):
        load_lens_nav_manifest(p)
