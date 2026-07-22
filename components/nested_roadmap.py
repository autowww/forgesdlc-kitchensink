"""Nested drill-down roadmap — HTML shell + JSON config for ``nested-roadmap.js``.

Data contract (``version`` 1)
-----------------------------
**Level** (root and each ``child``)::

    {
      "version": 1,
      "title": str,
      "columns": [{"id": str, "label": str}, ...],
      "tracks": [{"id": str, "label": str}, ...],
      "bars": [
        {
          "id": str,
          "label": str,
          "trackId": str,
          "startColumnId": str,
          "endColumnId": str,
          "summary": str | optional,
          "detailHtml": str | optional,   # trusted HTML fragment from server only
          "child": { ... Level } | optional
        },
        ...
      ]
    }

A bar is **drillable** when ``child`` is present and ``child.bars`` is a non-empty list.
Otherwise it is a **leaf**. ``detailHtml`` must be server-controlled (no user Markdown).
"""

from __future__ import annotations

import html as html_mod
import json
from typing import Any


def e(s: str) -> str:
    return html_mod.escape(s, quote=True)


def _json_for_script_tag(obj: Any) -> str:
    """Serialize for embedding in ``<script type=\"application/json\">``."""
    raw = json.dumps(obj, ensure_ascii=False, sort_keys=False)
    # Break accidental ``</script>`` in string values.
    return raw.replace("</", "<\\/")


def get_nested_roadmap_demo_config() -> dict[str, Any]:
    """Shared three-level demo tree (showcase + Lenses Studio lab iframe)."""
    level_deep: dict[str, Any] = {
        "version": 1,
        "title": "Cell architecture phase",
        "columns": [
            {"id": "w1", "label": "Week 1"},
            {"id": "w2", "label": "Week 2"},
            {"id": "w3", "label": "Week 3"},
            {"id": "w4", "label": "Week 4"},
        ],
        "tracks": [
            {"id": "build", "label": "Build"},
            {"id": "verify", "label": "Verify"},
        ],
        "bars": [
            {
                "id": "d-api",
                "label": "API hardening",
                "trackId": "build",
                "startColumnId": "w1",
                "endColumnId": "w2",
                "summary": "Rate limits, backoff, and idempotency keys.",
            },
            {
                "id": "d-store",
                "label": "Storage layout",
                "trackId": "build",
                "startColumnId": "w2",
                "endColumnId": "w4",
                "summary": "Sharding plan and migration scripts.",
            },
            {
                "id": "d-chaos",
                "label": "Chaos drills",
                "trackId": "verify",
                "startColumnId": "w1",
                "endColumnId": "w3",
                "summary": "Game days and rollback rehearsal.",
            },
            {
                "id": "d-signoff",
                "label": "Sign-off",
                "trackId": "verify",
                "startColumnId": "w4",
                "endColumnId": "w4",
                "summary": "Final checklist and exec readout.",
            },
        ],
    }

    level_mid: dict[str, Any] = {
        "version": 1,
        "title": "Reliability program — work breakdown",
        "columns": [
            {"id": "jan", "label": "Jan"},
            {"id": "feb", "label": "Feb"},
            {"id": "mar", "label": "Mar"},
        ],
        "tracks": [
            {"id": "eng", "label": "Engineering"},
            {"id": "qa", "label": "QA"},
        ],
        "bars": [
            {
                "id": "m-found",
                "label": "Foundations",
                "trackId": "eng",
                "startColumnId": "jan",
                "endColumnId": "jan",
                "summary": "Libraries, observability baseline.",
            },
            {
                "id": "m-cell",
                "label": "Cell architecture",
                "trackId": "eng",
                "startColumnId": "feb",
                "endColumnId": "mar",
                "summary": "Open the nested week-level roadmap for this epic.",
                "detailHtml": (
                    "<p class='small mb-0'>Server-rendered <strong>detailHtml</strong> slot — "
                    "use only for trusted markup.</p>"
                ),
                "child": level_deep,
            },
            {
                "id": "m-tests",
                "label": "Regression matrix",
                "trackId": "qa",
                "startColumnId": "jan",
                "endColumnId": "feb",
                "summary": "Coverage targets and flake triage.",
            },
            {
                "id": "m-perf",
                "label": "Perf gates",
                "trackId": "qa",
                "startColumnId": "feb",
                "endColumnId": "mar",
                "summary": "SLO probes in CI.",
            },
        ],
    }

    launch_mid: dict[str, Any] = {
        "version": 1,
        "title": "Launch track — milestones",
        "columns": [
            {"id": "a", "label": "Alpha"},
            {"id": "b", "label": "Beta"},
            {"id": "g", "label": "GA"},
        ],
        "tracks": [
            {"id": "apps", "label": "Apps"},
            {"id": "web", "label": "Web"},
        ],
        "bars": [
            {
                "id": "l-ios",
                "label": "iOS build train",
                "trackId": "apps",
                "startColumnId": "a",
                "endColumnId": "b",
                "summary": "TestFlight and store metadata.",
            },
            {
                "id": "l-android",
                "label": "Android build train",
                "trackId": "apps",
                "startColumnId": "b",
                "endColumnId": "g",
                "summary": "Play Console rollout stages.",
            },
            {
                "id": "l-www",
                "label": "Marketing site",
                "trackId": "web",
                "startColumnId": "a",
                "endColumnId": "g",
                "summary": "CMS freeze and CDN cache bust.",
            },
        ],
    }

    return {
        "version": 1,
        "title": "FY-26 portfolio (demo)",
        "columns": [
            {"id": "q1", "label": "Q1"},
            {"id": "q2", "label": "Q2"},
            {"id": "q3", "label": "Q3"},
            {"id": "q4", "label": "Q4"},
        ],
        "tracks": [
            {"id": "platform", "label": "Platform"},
            {"id": "product", "label": "Product"},
        ],
        "bars": [
            {
                "id": "r-epic",
                "label": "Reliability program",
                "trackId": "platform",
                "startColumnId": "q1",
                "endColumnId": "q3",
                "summary": (
                    "Multi-quarter reliability investment; drill in for Jan–Mar WBS, then weeks."
                ),
                "child": level_mid,
            },
            {
                "id": "p-launch",
                "label": "Launch track",
                "trackId": "product",
                "startColumnId": "q2",
                "endColumnId": "q4",
                "summary": "Alpha → GA across clients; one nested level (milestones only).",
                "child": launch_mid,
            },
            {
                "id": "p-hotfix",
                "label": "Hardening window",
                "trackId": "product",
                "startColumnId": "q4",
                "endColumnId": "q4",
                "summary": "Leaf bar — no nested roadmap; no drill affordance.",
            },
        ],
    }


def render_nested_roadmap_modal_shell(*, modal_id: str = "ksNestedRoadmapModal") -> str:
    """Single dialog backdrop per page; pair with ``render_nested_roadmap``."""
    mid = e(modal_id)
    return f"""\
<div id="{mid}" class="ks-nrm-backdrop" hidden aria-hidden="true">
  <div class="ks-nrm-dialog" role="dialog" aria-modal="true" aria-labelledby="{mid}-title">
    <div class="ks-nrm-dialog__head">
      <h2 id="{mid}-title" class="ks-nrm-dialog__title forge-gradient-text"></h2>
      <button type="button" class="ks-nrm-dialog__close" data-ks-nrm-close aria-label="Close">
        <span class="ks-nrm-dialog__close-icon" aria-hidden="true"></span>
      </button>
    </div>
    <div class="ks-nrm-dialog__body">
      <p class="ks-nrm-dialog__summary forge-support mb-3" id="{mid}-summary" hidden></p>
      <div class="ks-nrm-dialog__detail mb-3" id="{mid}-detail" hidden></div>
      <div class="ks-nrm-dialog__preview-wrap mb-3" id="{mid}-preview-wrap" hidden>
        <p class="small text-muted mb-2">Nested roadmap preview</p>
        <div class="ks-nrm-dialog__preview" id="{mid}-preview"></div>
      </div>
      <div class="ks-nrm-dialog__actions d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-sm btn-forge" id="{mid}-drill" disabled>
          Open nested roadmap
        </button>
      </div>
    </div>
  </div>
</div>
<div id="ksNestedRoadmapTooltip" class="ks-nrm-tooltip" role="tooltip" hidden></div>"""


def render_nested_roadmap(
    *,
    config: dict[str, Any],
    roadmap_id: str = "ks-nested-roadmap-1",
    include_modal_shell: bool = True,
) -> str:
    """
    Emit root ``.ks-nested-roadmap`` + JSON config; optionally the shared modal shell.

    Delegates to ``roadmap.render_roadmap_dynamic`` (hash ``Rmd``).
    """
    from roadmap import render_roadmap_dynamic

    return render_roadmap_dynamic(
        config,
        roadmap_id=roadmap_id,
        include_modal_shell=include_modal_shell,
    )


__all__ = [
    "get_nested_roadmap_demo_config",
    "render_nested_roadmap",
    "render_nested_roadmap_modal_shell",
]
