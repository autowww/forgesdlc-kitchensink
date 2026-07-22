"""Editable Initial/Target date grid for ROADMAP.md epic tables (Forge Lenses)."""

from __future__ import annotations

import html as html_mod
import json
from typing import Any


def e(s: str) -> str:
    return html_mod.escape(s, quote=True)


def render_roadmap_date_editor(
    *,
    rel_path: str,
    rows: list[dict[str, Any]],
    api_url: str = "/api/roadmap-dates",
    heading: str = "Adjust dates (target vs initial)",
) -> str:
    """
    Server-rendered shell; behavior from ``/js/roadmap-dates.js`` (Forge theme).

    Parameters
    ----------
    rel_path
        Workspace-relative path to ``ROADMAP.md`` (validated server-side on save).
    rows
        Rows from ``extract_date_shift_model`` — ``label``, ``epic_id``,
        ``initial_start``, ``initial_end``, ``target_start``, ``target_end``.
    api_url
        POST endpoint for JSON updates.
    """
    if not rows:
        return (
            '<div class="forge-roadmap-date-editor forge-roadmap-date-editor--empty border rounded p-3 mb-3">'
            '<p class="small text-muted mb-0">No epic row with Initial/Target date columns found. '
            "Add the optional table from <code>ROADMAP.template.md</code> "
            "(Initial start / Initial end / Target start / Target end).</p>"
            "</div>"
        )

    try:
        from .roadmap import render_roadmap_date_table_fragment
    except ImportError:
        from roadmap import render_roadmap_date_table_fragment

    table = render_roadmap_date_table_fragment(rows, rel_path=rel_path)
    payload = {
        "rel_path": rel_path,
        "rows": [
            {
                "epic_id": str(r.get("epic_id") or ""),
                "label": str(r.get("label") or ""),
                "initial_start": r.get("initial_start") or "",
                "initial_end": r.get("initial_end") or "",
                "target_start": r.get("target_start") or "",
                "target_end": r.get("target_end") or "",
            }
            for r in rows
        ],
    }
    data_json = e(json.dumps(payload, ensure_ascii=False, sort_keys=True))

    return (
        f'<div class="forge-roadmap-date-editor card border-secondary mb-3" '
        f'data-forge-roadmap-date-editor="1" data-api-url="{e(api_url)}" data-payload="{data_json}">'
        f'<div class="card-header py-2"><h3 class="h6 text-cyan mb-0">{e(heading)}</h3>'
        f'<p class="small text-muted mb-0 mt-1">{e(rel_path)}</p></div>'
        '<div class="card-body p-2">'
        f"{table}"
        '<div class="d-flex flex-wrap gap-2 align-items-center mt-2">'
        '<button type="button" class="btn btn-sm btn-forge forge-roadmap-date-save">Save to ROADMAP.md</button>'
        '<span class="small forge-roadmap-date-status text-muted" aria-live="polite"></span>'
        "</div></div></div>"
    )


def roadmap_date_editor_script_url() -> str:
    """URL path when kitchensink is mounted at ``/__ks/`` (Forge Lenses)."""
    return "/__ks/js/roadmap-dates.js"
