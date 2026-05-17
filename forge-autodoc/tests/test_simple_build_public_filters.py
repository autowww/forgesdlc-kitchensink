"""``public_publish`` filtering, redirects, and duplicate slug errors in ``run_simple_build``."""

from __future__ import annotations

from pathlib import Path

import pytest

from forge_autodoc.config import HandbookBuildConfig
from forge_autodoc.simple_build import run_simple_build


def _ks_root() -> Path:
    return Path(__file__).resolve().parents[2]


@pytest.fixture
def lensish_root(tmp_path: Path) -> Path:
    root = tmp_path / "lens"
    (root / "docs").mkdir(parents=True)
    return root


def test_public_skips_public_publish_false(lensish_root: Path) -> None:
    nav = lensish_root / "docs" / "nav.yml"
    nav.write_text(
        """
version: 1
enforce_public_frontmatter: true
sections:
  - id: start
    title: Start
    entries:
      - path: docs/index.md
      - path: docs/secret.md
""",
        encoding="utf-8",
    )
    (lensish_root / "docs" / "index.md").write_text(
        "---\naudience: public\nsection: start\n---\n\n# Home\n",
        encoding="utf-8",
    )
    (lensish_root / "docs" / "secret.md").write_text(
        "---\naudience: public\nsection: start\npublic_publish: false\n---\n\n# Secret\n",
        encoding="utf-8",
    )
    out = lensish_root / "out"
    cfg = HandbookBuildConfig(
        content_root=lensish_root,
        output_dir=out,
        kitchensink=_ks_root(),
        handbook_name="Test",
        skip_dir_names=frozenset(),
        markdown_collect_preset="forge_lens_repo",
        derive_handbook_title_from_readme=False,
        build_profile="public",
        nav_manifest_path="docs/nav.yml",
        contextual_leaf_sidebar=False,
        show_canonical_note=False,
    )
    assert run_simple_build(cfg) > 0
    assert (out / "index.html").is_file()
    assert not (out / "secret.html").is_file()


def test_public_duplicate_slug_fails(lensish_root: Path) -> None:
    hp = lensish_root / "docs" / "handbook-public"
    hp.mkdir(parents=True)
    (hp / "dup-part.md").write_text(
        "---\naudience: public\nsection: start\n---\n\n# One\n",
        encoding="utf-8",
    )
    (hp / "dup").mkdir()
    (hp / "dup" / "part.md").write_text(
        "---\naudience: public\nsection: start\n---\n\n# Two\n",
        encoding="utf-8",
    )
    nav = lensish_root / "docs" / "nav.yml"
    nav.write_text(
        """
version: 1
enforce_public_frontmatter: true
sections:
  - id: start
    title: Start
    entries:
      - path: docs/handbook-public/dup-part.md
      - path: docs/handbook-public/dup/part.md
""",
        encoding="utf-8",
    )
    out = lensish_root / "out"
    cfg = HandbookBuildConfig(
        content_root=lensish_root,
        output_dir=out,
        kitchensink=_ks_root(),
        handbook_name="Test",
        skip_dir_names=frozenset(),
        markdown_collect_preset="forge_lens_repo",
        derive_handbook_title_from_readme=False,
        build_profile="public",
        nav_manifest_path="docs/nav.yml",
        contextual_leaf_sidebar=False,
        show_canonical_note=False,
    )
    assert run_simple_build(cfg) == -1


def test_redirect_stub_emitted(lensish_root: Path) -> None:
    nav = lensish_root / "docs" / "nav.yml"
    nav.write_text(
        """
version: 1
enforce_public_frontmatter: true
sections:
  - id: start
    title: Start
    entries:
      - path: docs/index.md
""",
        encoding="utf-8",
    )
    (lensish_root / "docs" / "index.md").write_text(
        "---\naudience: public\nsection: start\n---\n\n# Home\n",
        encoding="utf-8",
    )
    (lensish_root / "docs" / "redirects.yaml").write_text(
        "redirects:\n  old-name.html: index.html\n",
        encoding="utf-8",
    )
    out = lensish_root / "out"
    cfg = HandbookBuildConfig(
        content_root=lensish_root,
        output_dir=out,
        kitchensink=_ks_root(),
        handbook_name="Test",
        skip_dir_names=frozenset(),
        markdown_collect_preset="forge_lens_repo",
        derive_handbook_title_from_readme=False,
        build_profile="public",
        nav_manifest_path="docs/nav.yml",
        contextual_leaf_sidebar=False,
        show_canonical_note=False,
    )
    assert run_simple_build(cfg) > 0
    stub = out / "old-name.html"
    assert stub.is_file()
    blob = stub.read_text(encoding="utf-8")
    assert "index.html" in blob
