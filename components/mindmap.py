"""KS mind-map primitives — static SVG, dynamic collapse, editable API mounts."""
from __future__ import annotations

import html as html_mod
import json
import math
from typing import Any

try:
    from .ks_hash_attrs import ks_hash_attrs
except ImportError:
    from ks_hash_attrs import ks_hash_attrs

HASH_MMS = "Mms"
HASH_MMD = "Mmd"
HASH_MME = "Mme"

NODE_W = 148
NODE_H = 34
H_GAP = 20
V_GAP = 52
PAD = 24


def e(s: str) -> str:
    return html_mod.escape(s, quote=True)


def _json_for_script_tag(obj: Any) -> str:
    raw = json.dumps(obj, ensure_ascii=False, sort_keys=False)
    return raw.replace("</", "<\\/")


def get_ks_creation_mindmap_demo() -> dict[str, Any]:
    """Demo tree matching the legacy Mermaid prompts/plans map."""
    return {
        "version": 1,
        "title": "Kitchen Sink",
        "root": {
            "id": "root",
            "label": "Kitchen Sink",
            "children": [
                {
                    "id": "prompt-themes",
                    "label": "Prompt themes",
                    "children": [
                        {"id": "one-repo", "label": "One shared repo"},
                        {"id": "submodule", "label": "Submodule to sites"},
                        {"id": "palette", "label": "Match Forge palette"},
                        {"id": "docs-shell", "label": "Docs shell parity"},
                        {"id": "diagrams-code", "label": "Diagrams as code"},
                        {"id": "agent-rules", "label": "Agent-facing rules"},
                    ],
                },
                {
                    "id": "planning",
                    "label": "Planning",
                    "children": [
                        {"id": "audit-dup", "label": "Audit duplication"},
                        {"id": "token-surfaces", "label": "Token and surfaces"},
                        {"id": "layouts-inv", "label": "layouts.py inventory"},
                        {"id": "gen-embed", "label": "Generator embed pattern"},
                        {"id": "showcase-ref", "label": "Showcase as reference"},
                        {"id": "propagation", "label": "Propagation story"},
                    ],
                },
            ],
        },
    }


def _leaf_span(node: dict[str, Any]) -> int:
    kids = node.get("children") or []
    if not kids:
        return 1
    return sum(_leaf_span(c) for c in kids)


def _layout_node(
    node: dict[str, Any],
    depth: int,
    x_center: float,
    positions: list[dict[str, Any]],
) -> float:
    label = str(node.get("label") or "")
    node_id = str(node.get("id") or "")
    kids = node.get("children") or []
    y = PAD + depth * (NODE_H + V_GAP)
    positions.append(
        {
            "id": node_id,
            "label": label,
            "depth": depth,
            "x": x_center - NODE_W / 2,
            "y": y,
            "w": NODE_W,
            "h": NODE_H,
            "is_root": depth == 0,
        }
    )
    if not kids:
        return NODE_W + H_GAP
    total_span = sum(_leaf_span(c) for c in kids)
    cursor = x_center - (total_span * (NODE_W + H_GAP)) / 2 + (NODE_W + H_GAP) / 2
    for child in kids:
        span = _leaf_span(child)
        child_center = cursor + (span * (NODE_W + H_GAP) - H_GAP) / 2
        _layout_node(child, depth + 1, child_center, positions)
        cursor += span * (NODE_W + H_GAP)
    return max(NODE_W + H_GAP, total_span * (NODE_W + H_GAP))


def _build_connectors(
    node: dict[str, Any],
    positions: dict[str, dict[str, Any]],
    lines: list[str],
) -> None:
    node_id = str(node.get("id") or "")
    parent = positions.get(node_id)
    if not parent:
        return
    px = parent["x"] + parent["w"] / 2
    py = parent["y"] + parent["h"]
    for child in node.get("children") or []:
        cid = str(child.get("id") or "")
        cpos = positions.get(cid)
        if not cpos:
            continue
        cx = cpos["x"] + cpos["w"] / 2
        cy = cpos["y"]
        mid_y = py + (cy - py) / 2
        lines.append(
            f'<path d="M {px:.1f} {py:.1f} L {px:.1f} {mid_y:.1f} L {cx:.1f} {mid_y:.1f} L {cx:.1f} {cy:.1f}" '
            f'fill="none" stroke="#94a3b8" stroke-width="1.25"/>'
        )
        _build_connectors(child, positions, lines)


def build_static_svg(tree: dict[str, Any], *, title: str = "") -> str:
    """Return inline SVG for a top-down mind-map tree."""
    root = tree.get("root") if "root" in tree else tree
    if not isinstance(root, dict):
        root = {"id": "root", "label": "Root", "children": []}
    positions_list: list[dict[str, Any]] = []
    _layout_node(root, 0, PAD + NODE_W, positions_list)
    if positions_list:
        min_x = min(p["x"] for p in positions_list)
        if min_x < PAD:
            shift = PAD - min_x
            for p in positions_list:
                p["x"] += shift
    width = max(int(math.ceil(max((p["x"] + p["w"] for p in positions_list), default=NODE_W) + PAD)), 320)
    max_y = max((p["y"] + p["h"] for p in positions_list), default=NODE_H)
    height = int(max_y + PAD)
    pos_map = {p["id"]: p for p in positions_list}
    lines: list[str] = []
    _build_connectors(root, pos_map, lines)
    nodes: list[str] = []
    for p in positions_list:
        rx = 6 if p["is_root"] else 4
        stroke = "#0f766e" if p["is_root"] else "#cbd5e1"
        fill = "#f0fdfa" if p["is_root"] else "#ffffff"
        fw = "700" if p["depth"] <= 1 else "600"
        fs = 12 if p["is_root"] else 10.5
        nodes.append(
            f'<rect x="{p["x"]:.1f}" y="{p["y"]:.1f}" width="{p["w"]:.1f}" height="{p["h"]:.1f}" '
            f'rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="1.25"/>'
        )
        nodes.append(
            f'<text x="{p["x"] + p["w"] / 2:.1f}" y="{p["y"] + p["h"] / 2 + 4:.1f}" '
            f'text-anchor="middle" font-family="system-ui,sans-serif" font-size="{fs}" '
            f'font-weight="{fw}" fill="#0f172a">{e(p["label"])}</text>'
        )
    title_el = ""
    if title:
        title_el = (
            f'<text x="{width / 2:.1f}" y="16" text-anchor="middle" '
            f'font-family="system-ui,sans-serif" font-size="11" font-weight="600" '
            f'fill="#64748b">{e(title)}</text>'
        )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'width="{width}" height="{height}" role="img" '
        f'aria-label="{e(title or "Mind map")}">'
        f'<rect width="100%" height="100%" fill="#ffffff"/>'
        f"{title_el}"
        f'{"".join(lines)}'
        f'{"".join(nodes)}'
        f"</svg>"
    )


def _tree_payload(tree: dict[str, Any] | None = None) -> dict[str, Any]:
    if tree is None:
        return get_ks_creation_mindmap_demo()
    if "root" in tree:
        return tree
    return {"version": 1, "title": "", "root": tree}


def render_mindmap_static(
    tree: dict[str, Any] | None = None,
    *,
    mount_id: str = "ks-mindmap-static-1",
    printable: bool = True,
    expandable: bool = True,
) -> str:
    payload = _tree_payload(tree)
    root = payload["root"]
    title = str(payload.get("title") or "")
    svg = build_static_svg({"root": root}, title=title)
    printable_cls = " ks-mindmap--printable" if printable else ""
    trigger = ""
    if expandable:
        trigger = ' forge-diagram-trigger" onclick="openDiagramModal(this)"'
    else:
        trigger = '"'
    return (
        f'<div class="ks-mindmap ks-mindmap--static{printable_cls}" id="{e(mount_id)}" '
        f'{_attrs(HASH_MMS, "mindmap-static")}>'
        f'<div class="ks-mindmap__viewport{trigger}>'
        f"{svg}"
        f"</div></div>"
    )


def render_mindmap_dynamic(
    tree: dict[str, Any] | None = None,
    *,
    mount_id: str = "ks-mindmap-dynamic-1",
    collapsible: bool = True,
    initial_depth: int = 1,
) -> str:
    payload = _tree_payload(tree)
    data = _json_for_script_tag(payload)
    collapse_flag = "1" if collapsible else "0"
    return (
        f'<div class="ks-mindmap ks-mindmap--dynamic" id="{e(mount_id)}" '
        f'data-ks-mindmap="1" data-ks-mindmap-collapsible="{collapse_flag}" '
        f'data-ks-mindmap-initial-depth="{initial_depth}" '
        f'{_attrs(HASH_MMD, "mindmap-dynamic")}>'
        f'<script type="application/json" data-ks-mindmap-data>{data}</script>'
        f'<div class="ks-mindmap__viewport" data-ks-mindmap-viewport role="img" '
        f'aria-label="{e(str(payload.get("title") or "Mind map"))}"></div>'
        f"</div>"
    )


def render_mindmap_editable(
    *,
    mode: str = "dynamic",
    mount_id: str = "ks-mindmap-editable-1",
    tree: dict[str, Any] | None = None,
    load_url: str = "",
    save_url: str = "",
    save_demo: bool = True,
    mindmap_id: str = "ks-creation",
) -> str:
    payload = _tree_payload(tree)
    inline = _json_for_script_tag(payload) if not load_url else ""
    load_attr = f' data-ks-mindmap-load-url="{e(load_url)}"' if load_url else ""
    save_attr = f' data-ks-mindmap-save-url="{e(save_url)}"' if save_url else ""
    demo_attr = ' data-ks-mindmap-save-demo="1"' if save_demo else ""
    inline_script = ""
    if inline:
        inline_script = (
            f'<script type="application/json" data-ks-mindmap-data>{inline}</script>'
        )
    return (
        f'<div class="ks-mindmap ks-mindmap--editable" id="{e(mount_id)}" '
        f'data-ks-mindmap-editable="1" data-ks-mindmap-mode="{e(mode)}" '
        f'data-ks-mindmap-id="{e(mindmap_id)}"{load_attr}{save_attr}{demo_attr} '
        f'{_attrs(HASH_MME, "mindmap-editable")}>'
        f'<div class="ks-mindmap__toolbar" data-ks-mindmap-toolbar>'
        f'<button type="button" class="btn btn-sm btn-outline-secondary" data-ks-mindmap-add-child '
        f'disabled>Add child</button>'
        f'<button type="button" class="btn btn-sm btn-outline-secondary" data-ks-mindmap-add-sibling '
        f'disabled>Add sibling</button>'
        f'<button type="button" class="btn btn-sm btn-outline-secondary" data-ks-mindmap-delete '
        f'disabled>Delete</button>'
        f'<button type="button" class="btn btn-sm btn-forge" data-ks-mindmap-save>Save</button>'
        f'<button type="button" class="btn btn-sm btn-outline-secondary" data-ks-mindmap-reload>Reload</button>'
        f'<span class="ks-mindmap__status forge-support small ms-2" data-ks-mindmap-status></span>'
        f"</div>"
        f"{inline_script}"
        f'<div class="ks-mindmap__editor">'
        f'<label class="ks-mindmap__label-field forge-support small">Selected label '
        f'<input type="text" class="form-control form-control-sm" data-ks-mindmap-label-input disabled>'
        f"</label>"
        f'<div class="ks-mindmap__viewport" data-ks-mindmap-viewport role="application" '
        f'aria-label="Editable mind map"></div>'
        f"</div></div>"
    )


def _attrs(hash_id: str, name: str) -> str:
    return ks_hash_attrs(hash_id, "component", name)


__all__ = [
    "HASH_MMD",
    "HASH_MME",
    "HASH_MMS",
    "build_static_svg",
    "get_ks_creation_mindmap_demo",
    "render_mindmap_dynamic",
    "render_mindmap_editable",
    "render_mindmap_static",
]
