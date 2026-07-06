"""Emit ``docs_source_map.json`` (forge.docs_source_map.v1) for a handbook build.

Dependency-free helper: maps every emitted route to its source Markdown and
frontmatter lineage fields so consumers can detect generated-only pages.
"""
from __future__ import annotations

import datetime as _dt
import json
from pathlib import Path

SOURCE_MAP_FILENAME = "docs_source_map.json"


def build_docs_source_map(
    *,
    site: str,
    pages: list[tuple[str, str, str]],
    meta_by_rel: dict[str, dict[str, str]],
    builder: str = "forge-autodoc",
) -> dict:
    """Build the source-map payload from build state.

    ``pages`` rows are ``(slug, nav_title, md_rel)`` as produced by
    ``run_simple_build``; ``meta_by_rel`` maps ``md_rel`` to flat frontmatter.
    """
    entries = []
    for slug, _title, md_rel in pages:
        fm = meta_by_rel.get(md_rel, {})
        content_id = fm.get("content_id", "").strip() or None
        entries.append(
            {
                "route": slug,
                "source_markdown": md_rel,
                "content_id": content_id,
                "canonical_owner": fm.get("canonical_owner", "").strip() or None,
                "maturity": fm.get("maturity", "").strip() or None,
                "last_reviewed": fm.get("last_reviewed", "").strip() or None,
                "generated_only": content_id is None,
            }
        )
    return {
        "schema": "forge.docs_source_map.v1",
        "site": site,
        "generated_at": _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "builder": builder,
        "pages": entries,
    }


def emit_docs_source_map(
    output_dir: Path,
    *,
    site: str,
    pages: list[tuple[str, str, str]],
    meta_by_rel: dict[str, dict[str, str]],
    builder: str = "forge-autodoc",
) -> Path:
    """Write ``docs_source_map.json`` into *output_dir* and return the path."""
    payload = build_docs_source_map(
        site=site, pages=pages, meta_by_rel=meta_by_rel, builder=builder
    )
    out = output_dir / SOURCE_MAP_FILENAME
    out.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return out
