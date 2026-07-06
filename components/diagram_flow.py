"""Enriched flow diagram figure (``blueprint-diagram`` fence with ``node:`` metadata).

Renders the compact reader view for fences that carry per-node enrichment:

- ``title:`` / ``summary:`` — figure heading shown above the flow.
- ``node:`` — starts a flow step (label shown in the step card).
- ``detail:`` — one-line supporting text under the owning ``node:`` label.
- ``more:`` — deeper explanation surfaced only in the expanded flyout modal.

The figure embeds a JSON payload (``script.forge-flow-data``) consumed by
``openFlowDetailModal`` in ``js/ks-diagram-modal.js`` to build the flyout.
"""
from __future__ import annotations

import html as html_mod
import json

try:
    from .ks_hash_attrs import ks_hash_attrs
except ImportError:
    from ks_hash_attrs import ks_hash_attrs

FLOW_FIGURE_HASH = "Flw"


def _flow_payload_json(
    *,
    title: str,
    summary: str,
    caption: str,
    nodes: list[dict[str, str]],
) -> str:
    payload = {
        "title": title,
        "summary": summary,
        "caption": caption,
        "nodes": [
            {
                "label": str(n.get("label") or ""),
                "detail": str(n.get("detail") or ""),
                "more": str(n.get("more") or ""),
            }
            for n in nodes
        ],
    }
    # "<" escaped so "</script>" can never terminate the embedded data block.
    return json.dumps(payload, ensure_ascii=False).replace("<", "\\u003c")


def flow_steps_html(nodes: list[dict[str, str]], *, modal: bool = False) -> str:
    """Ordered step list shared by the compact figure and (via JS) the modal."""
    variant = " forge-flow-list--modal" if modal else ""
    items: list[str] = []
    for node in nodes:
        label = str(node.get("label") or "").strip()
        detail = str(node.get("detail") or "").strip()
        esc_label = html_mod.escape(label)
        detail_html = (
            f'<span class="forge-flow-step__detail">{html_mod.escape(detail)}</span>'
            if detail
            else ""
        )
        items.append(
            f'<li class="forge-flow-step" data-node="{html_mod.escape(label, quote=True)}">'
            f'<span class="forge-flow-step__label">{esc_label}</span>'
            f"{detail_html}</li>"
        )
    return f'<ol class="forge-flow-list{variant}">{"".join(items)}</ol>'


def flow_diagram_figure_html(meta: dict[str, object], fallback_ascii: str) -> str:
    """Build the enriched compact figure (optionally with an ASCII toggle panel)."""
    nodes = [n for n in (meta.get("nodes") or []) if str(n.get("label") or "").strip()]  # type: ignore[union-attr]
    if not nodes:
        raise ValueError("flow diagram figure requires at least one node")
    title = str(meta.get("title") or "").strip()
    summary = str(meta.get("summary") or "").strip()
    caption = str(meta.get("caption") or "").strip()
    raw_alt = str(meta.get("alt") or "").strip()
    aria = raw_alt or title or caption or "Flow diagram"
    ascii_body = fallback_ascii.strip("\n")
    has_ascii = bool(ascii_body.strip())

    heading_bits: list[str] = []
    if title:
        heading_bits.append(f'<p class="forge-flow__title">{html_mod.escape(title)}</p>')
    if summary:
        heading_bits.append(
            f'<p class="forge-flow__summary">{html_mod.escape(summary)}</p>'
        )
    heading = (
        f'<div class="forge-flow__heading">{"".join(heading_bits)}</div>'
        if heading_bits
        else '<div class="forge-flow__heading"></div>'
    )

    toolbar_bits: list[str] = []
    if has_ascii:
        toolbar_bits.append(
            '<button type="button" class="forge-diagram-view-toggle btn btn-sm '
            'btn-outline-secondary" aria-pressed="false" '
            'data-label-svg="Diagram view" data-label-ascii="ASCII view">'
            "ASCII view</button>"
        )
    toolbar_bits.append(
        '<button type="button" class="forge-flow-expand btn btn-sm btn-outline-secondary" '
        'aria-haspopup="dialog" onclick="openFlowDetailModal(this)">Expand</button>'
    )
    head = (
        f'<div class="forge-flow__head">{heading}'
        f'<div class="forge-diagram-dual__toolbar forge-flow__toolbar">'
        f'{"".join(toolbar_bits)}</div></div>'
    )

    flow_panel = flow_steps_html(nodes)
    dual_class = ""
    view_attr = ""
    panels: str
    if has_ascii:
        dual_class = " forge-diagram-dual"
        view_attr = ' data-diagram-view="svg"'
        esc_ascii = html_mod.escape(ascii_body)
        panels = (
            '<div class="forge-diagram-dual__panel forge-diagram-dual__panel--svg" '
            f'data-panel="svg">{flow_panel}</div>'
            '<div class="forge-diagram-dual__panel forge-diagram-dual__panel--ascii" '
            'data-panel="ascii" hidden>'
            '<pre class="forge-code forge-diagram-ascii-pre">'
            f'<code class="language-text">{esc_ascii}</code></pre></div>'
        )
    else:
        panels = flow_panel

    figcaption = ""
    if caption:
        figcaption = (
            '<figcaption class="forge-diagram-ascii-caption forge-support small">'
            f"{html_mod.escape(caption)}</figcaption>"
        )

    payload = _flow_payload_json(
        title=title or aria,
        summary=summary,
        caption=caption,
        nodes=nodes,  # type: ignore[arg-type]
    )
    hash_attrs = ks_hash_attrs(FLOW_FIGURE_HASH, "component", "Enriched flow diagram figure")
    return (
        f'<figure class="forge-diagram forge-diagram-flow breathe-static{dual_class}"'
        f'{view_attr} {hash_attrs} role="group" '
        f'aria-label="{html_mod.escape(aria, quote=True)}">'
        f"{head}{panels}"
        f'<script type="application/json" class="forge-flow-data">{payload}</script>'
        f"{figcaption}</figure>"
    )
