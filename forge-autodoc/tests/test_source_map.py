"""Tests for the docs_source_map.json emitter (forge.docs_source_map.v1)."""
from __future__ import annotations

import json
from pathlib import Path

from forge_autodoc.source_map import (
    SOURCE_MAP_FILENAME,
    build_docs_source_map,
    emit_docs_source_map,
)

PAGES = [
    ("docs-standout-governed.html", "Governed control plane", "docs/standout/governed.md"),
    ("docs-legacy.html", "Legacy page", "docs/legacy.md"),
]

META = {
    "docs/standout/governed.md": {
        "content_id": "forge.docs.platform.governed-control-plane",
        "canonical_owner": "forge-platform",
        "maturity": "demonstrated",
        "last_reviewed": "2026-07-03",
    },
    "docs/legacy.md": {"title": "Legacy page"},
}


def test_build_docs_source_map_marks_generated_only():
    payload = build_docs_source_map(site="Test Site", pages=PAGES, meta_by_rel=META)
    assert payload["schema"] == "forge.docs_source_map.v1"
    assert payload["site"] == "Test Site"
    assert len(payload["pages"]) == 2

    governed = payload["pages"][0]
    assert governed["route"] == "docs-standout-governed.html"
    assert governed["content_id"] == "forge.docs.platform.governed-control-plane"
    assert governed["canonical_owner"] == "forge-platform"
    assert governed["maturity"] == "demonstrated"
    assert governed["generated_only"] is False

    legacy = payload["pages"][1]
    assert legacy["content_id"] is None
    assert legacy["generated_only"] is True


def test_emit_docs_source_map_writes_json(tmp_path: Path):
    out = emit_docs_source_map(tmp_path, site="Test Site", pages=PAGES, meta_by_rel=META)
    assert out.name == SOURCE_MAP_FILENAME
    data = json.loads(out.read_text(encoding="utf-8"))
    assert data["schema"] == "forge.docs_source_map.v1"
    assert {p["route"] for p in data["pages"]} == {
        "docs-standout-governed.html",
        "docs-legacy.html",
    }


def test_missing_frontmatter_entry_is_generated_only():
    payload = build_docs_source_map(
        site="Test Site",
        pages=[("orphan.html", "Orphan", "docs/orphan.md")],
        meta_by_rel={},
    )
    page = payload["pages"][0]
    assert page["generated_only"] is True
    assert page["source_markdown"] == "docs/orphan.md"
