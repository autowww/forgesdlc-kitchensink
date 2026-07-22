"""KS roadmap primitives — static SVG, dynamic drill-down, editable drag + date table."""
from __future__ import annotations

import html as html_mod
import json
from typing import Any

try:
    from .ks_hash_attrs import ks_hash_attrs
    from .nested_roadmap import get_nested_roadmap_demo_config
except ImportError:
    from ks_hash_attrs import ks_hash_attrs
    from nested_roadmap import get_nested_roadmap_demo_config

HASH_RMS = "Rms"
HASH_RMD = "Rmd"
HASH_RME = "Rme"

GUTTER_W = 108
COL_W = 88
TRACK_H = 52
HEADER_H = 32
BAR_H = 26
PAD = 16
BAR_TONES = ("#0e7490", "#059669", "#d97706", "#7c3aed")


def e(s: str) -> str:
    return html_mod.escape(s, quote=True)


def _json_for_script_tag(obj: Any) -> str:
    raw = json.dumps(obj, ensure_ascii=False, sort_keys=False)
    return raw.replace("</", "<\\/")


def _column_dates() -> dict[str, dict[str, str]]:
    return {
        "q1": {"start": "2026-01-01", "end": "2026-03-31"},
        "q2": {"start": "2026-04-01", "end": "2026-06-30"},
        "q3": {"start": "2026-07-01", "end": "2026-09-30"},
        "q4": {"start": "2026-10-01", "end": "2026-12-31"},
    }


def upgrade_to_v2(doc: dict[str, Any]) -> dict[str, Any]:
    """Normalize v1 Level or partial doc into RoadmapDocument v2."""
    if doc.get("version") == 2 and "date_rows" in doc:
        return doc
    level = doc
    if "columns" not in level and "bars" in doc.get("level", {}):
        level = doc["level"]
    cols = []
    dates = _column_dates()
    for c in level.get("columns") or []:
        cid = str(c.get("id") or "")
        col = {"id": cid, "label": str(c.get("label") or cid)}
        if c.get("start"):
            col["start"] = c["start"]
        if c.get("end"):
            col["end"] = c["end"]
        if "start" not in col and cid in dates:
            col.update(dates[cid])
        cols.append(col)
    bars = level.get("bars") or []
    date_rows: list[dict[str, Any]] = list(doc.get("date_rows") or [])
    if not date_rows:
        for bar in bars:
            eid = str(bar.get("epic_id") or bar.get("id") or "")
            sc = dates.get(str(bar.get("startColumnId") or ""), {})
            ec = dates.get(str(bar.get("endColumnId") or ""), {})
            date_rows.append(
                {
                    "epic_id": eid,
                    "label": str(bar.get("label") or ""),
                    "initial_start": sc.get("start", ""),
                    "initial_end": sc.get("end", ""),
                    "target_start": sc.get("start", ""),
                    "target_end": ec.get("end", ""),
                }
            )
    return {
        "version": 2,
        "roadmap_id": str(doc.get("roadmap_id") or "demo-portfolio"),
        "rel_path": str(doc.get("rel_path") or "ROADMAP.md"),
        "title": str(level.get("title") or doc.get("title") or "Roadmap"),
        "columns": cols,
        "tracks": list(level.get("tracks") or []),
        "bars": bars,
        "date_rows": date_rows,
    }


def get_roadmap_demo_doc() -> dict[str, Any]:
    """v2 demo document from nested roadmap fixture."""
    base = get_nested_roadmap_demo_config()
    doc = upgrade_to_v2(base)
    doc["roadmap_id"] = "demo-reliability"
    doc["rel_path"] = "ROADMAP.md"
    doc["date_rows"] = [
        {
            "epic_id": "r-epic",
            "label": "Reliability program",
            "initial_start": "2026-01-01",
            "initial_end": "2026-03-31",
            "target_start": "2026-01-01",
            "target_end": "2026-09-30",
        },
        {
            "epic_id": "p-launch",
            "label": "Launch track",
            "initial_start": "2026-04-01",
            "initial_end": "2026-06-30",
            "target_start": "2026-04-01",
            "target_end": "2026-12-31",
        },
        {
            "epic_id": "p-hotfix",
            "label": "Hardening window",
            "initial_start": "2026-10-01",
            "initial_end": "2026-12-31",
            "target_start": "2026-10-01",
            "target_end": "2026-12-31",
        },
    ]
    for bar in doc["bars"]:
        if bar.get("id") == "r-epic":
            bar["epic_id"] = "r-epic"
        elif bar.get("id") == "p-launch":
            bar["epic_id"] = "p-launch"
        elif bar.get("id") == "p-hotfix":
            bar["epic_id"] = "p-hotfix"
    return doc


def _level_from_doc(doc: dict[str, Any]) -> dict[str, Any]:
    d = upgrade_to_v2(doc)
    return {
        "version": d.get("version", 2),
        "title": d["title"],
        "columns": d["columns"],
        "tracks": d["tracks"],
        "bars": d["bars"],
    }


def _col_index(columns: list[dict[str, Any]]) -> dict[str, int]:
    return {str(c["id"]): i for i, c in enumerate(columns)}


def build_static_svg(level: dict[str, Any], *, title: str = "") -> str:
    """Server-render one-level swimlane SVG (no drill-down)."""
    columns = level.get("columns") or []
    tracks = level.get("tracks") or []
    bars = level.get("bars") or []
    ncols = max(len(columns), 1)
    ntracks = max(len(tracks), 1)
    width = PAD * 2 + GUTTER_W + ncols * COL_W
    height = PAD * 2 + HEADER_H + ntracks * TRACK_H
    cmap = _col_index(columns)
    parts: list[str] = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'width="{width}" height="{height}" role="img" '
        f'aria-label="{e(title or level.get("title") or "Roadmap")}">',
        '<rect width="100%" height="100%" fill="#ffffff"/>',
    ]
    if title or level.get("title"):
        parts.append(
            f'<text x="{width / 2:.1f}" y="{PAD + 10}" text-anchor="middle" '
            f'font-family="system-ui,sans-serif" font-size="11" font-weight="600" '
            f'fill="#64748b">{e(title or level.get("title") or "")}</text>'
        )
    gx = PAD + GUTTER_W
    gy = PAD + HEADER_H
    for i, col in enumerate(columns):
        cx = gx + i * COL_W + COL_W / 2
        parts.append(
            f'<text x="{cx:.1f}" y="{PAD + HEADER_H - 8}" text-anchor="middle" '
            f'font-size="10" font-weight="700" fill="#64748b">{e(col.get("label", ""))}</text>'
        )
        parts.append(
            f'<line x1="{gx + i * COL_W:.1f}" y1="{gy:.1f}" '
            f'x2="{gx + i * COL_W:.1f}" y2="{height - PAD:.1f}" '
            f'stroke="#e2e8f0" stroke-width="1"/>'
        )
    bars_by_track: dict[str, list] = {}
    for bar in bars:
        tid = str(bar.get("trackId") or "")
        bars_by_track.setdefault(tid, []).append(bar)
    for ti, track in enumerate(tracks):
        ty = gy + ti * TRACK_H
        parts.append(
            f'<text x="{PAD + 4:.1f}" y="{ty + TRACK_H / 2 + 4:.1f}" '
            f'font-size="10" font-weight="600" fill="#0f172a">{e(track.get("label", ""))}</text>'
        )
        parts.append(
            f'<line x1="{gx:.1f}" y1="{ty + TRACK_H:.1f}" x2="{width - PAD:.1f}" '
            f'y2="{ty + TRACK_H:.1f}" stroke="#e2e8f0" stroke-width="1"/>'
        )
        for bi, bar in enumerate(bars_by_track.get(str(track.get("id")), [])):
            si = cmap.get(str(bar.get("startColumnId")))
            ei = cmap.get(str(bar.get("endColumnId")))
            if si is None or ei is None:
                continue
            bx = gx + si * COL_W + 4
            bw = (ei - si + 1) * COL_W - 8
            by = ty + (TRACK_H - BAR_H) / 2
            tone = BAR_TONES[bi % len(BAR_TONES)]
            child = bar.get("child")
            badge = ""
            if child and (child.get("bars") or []):
                badge = " +"
            parts.append(
                f'<rect x="{bx:.1f}" y="{by:.1f}" width="{bw:.1f}" height="{BAR_H:.1f}" '
                f'rx="4" fill="{tone}" fill-opacity="0.15" stroke="{tone}" stroke-width="1.25"/>'
            )
            parts.append(
                f'<text x="{bx + bw / 2:.1f}" y="{by + BAR_H / 2 + 4:.1f}" '
                f'text-anchor="middle" font-size="9.5" font-weight="600" fill="#0f172a">'
                f'{e(str(bar.get("label", "")) + badge)}</text>'
            )
    parts.append("</svg>")
    return "".join(parts)


def render_roadmap_modal_shell(*, modal_id: str = "ksNestedRoadmapModal") -> str:
    from nested_roadmap import render_nested_roadmap_modal_shell

    return render_nested_roadmap_modal_shell(modal_id=modal_id)


def render_roadmap_static(
    doc: dict[str, Any] | None = None,
    *,
    mount_id: str = "ks-roadmap-static-1",
    printable: bool = True,
    expandable: bool = True,
) -> str:
    payload = upgrade_to_v2(doc or get_roadmap_demo_doc())
    level = _level_from_doc(payload)
    svg = build_static_svg(level, title=str(payload.get("title") or ""))
    printable_cls = " ks-roadmap--printable" if printable else ""
    trigger = (
        ' forge-diagram-trigger" onclick="openDiagramModal(this)"'
        if expandable
        else '"'
    )
    return (
        f'<div class="ks-roadmap ks-roadmap--static{printable_cls}" id="{e(mount_id)}" '
        f'{_attrs(HASH_RMS, "roadmap-static")}>'
        f'<div class="ks-roadmap__viewport{trigger}>'
        f"{svg}</div></div>"
    )


def render_roadmap_dynamic(
    doc: dict[str, Any] | None = None,
    *,
    roadmap_id: str = "ks-roadmap-dynamic-1",
    include_modal_shell: bool = True,
) -> str:
    payload = upgrade_to_v2(doc or get_roadmap_demo_doc())
    level = _level_from_doc(payload)
    data = _json_for_script_tag(level)
    hid = e(roadmap_id)
    shell = render_roadmap_modal_shell() if include_modal_shell else ""
    return (
        shell
        + f'<div class="ks-nested-roadmap ks-roadmap ks-roadmap--dynamic" id="{hid}" '
        f'data-ks-roadmap="1" data-ks-nested-roadmap="1" data-ks-nrm-modal="ksNestedRoadmapModal" '
        f'{_attrs(HASH_RMD, "roadmap-dynamic")}>'
        f'<script type="application/json" data-ks-nrm-config>{data}</script>'
        f'<div class="ks-nested-roadmap__chrome">'
        f'<div class="ks-nested-roadmap__nav d-flex flex-wrap align-items-center gap-2 mb-2">'
        f'<button type="button" class="btn btn-sm btn-outline-secondary ks-nrm-up" '
        f'data-ks-nrm-up hidden>Up one level</button>'
        f'<button type="button" class="btn btn-sm btn-outline-secondary ks-nrm-root" '
        f'data-ks-nrm-root hidden>Reset to root</button></div>'
        f'<div class="ks-nested-roadmap__title h5 mb-2" role="navigation" aria-label="Roadmap trail">'
        f'<span class="ks-nested-roadmap__breadcrumb forge-support" data-ks-nrm-bc></span>'
        f"</div></div>"
        f'<div class="ks-nested-roadmap__viewport" data-ks-nrm-viewport></div></div>'
    )


def render_roadmap_date_table_fragment(
    date_rows: list[dict[str, Any]],
    *,
    rel_path: str = "ROADMAP.md",
) -> str:
    """Date table markup for embedding in editable roadmap (no outer card wrapper)."""
    if not date_rows:
        return (
            '<p class="forge-support small mb-0">No date rows in document.</p>'
        )
    header = "".join(
        f"<th scope='col'>{h}</th>"
        for h in ("Epic", "Initial start", "Initial end", "Target start", "Target end")
    )
    body = ""
    for i, r in enumerate(date_rows):
        eid = str(r.get("epic_id") or "")
        lab = str(r.get("label") or "")[:56]
        body += f"<tr data-roadmap-row-key='{e(eid or f'__row_{i}')}' data-epic-id='{e(eid)}'>"
        body += (
            f"<td><span class='text-muted small'>{e(lab)}</span>"
            f"{f'<code class=\"ms-1\">{e(eid)}</code>' if eid else ''}</td>"
        )
        for key in ("initial_start", "initial_end", "target_start", "target_end"):
            val = str(r.get(key) or "")
            body += (
                f"<td><input type='date' class='form-control form-control-sm "
                f"forge-roadmap-date-input ks-roadmap-date-input' data-field='{e(key)}' "
                f"value='{e(val)}' aria-label='{e(key)}' /></td>"
            )
        body += "</tr>"
    return (
        f'<div class="ks-roadmap__date-table" data-ks-roadmap-date-table>'
        f'<p class="forge-support small mb-2">Dates sync with swimlane bars '
        f'(<code>{e(rel_path)}</code>).</p>'
        f'<div class="table-responsive"><table class="table table-sm table-bordered mb-0">'
        f"<thead><tr>{header}</tr></thead><tbody>{body}</tbody></table></div></div>"
    )


def render_roadmap_editable(
    *,
    mode: str = "dynamic",
    mount_id: str = "ks-roadmap-editable-1",
    doc: dict[str, Any] | None = None,
    load_url: str = "",
    save_url: str = "",
    save_demo: bool = True,
    roadmap_id: str = "demo-portfolio",
) -> str:
    payload = upgrade_to_v2(doc or get_roadmap_demo_doc())
    inline = _json_for_script_tag(payload) if not load_url else ""
    load_attr = f' data-ks-roadmap-load-url="{e(load_url)}"' if load_url else ""
    save_attr = f' data-ks-roadmap-save-url="{e(save_url)}"' if save_url else ""
    demo_attr = ' data-ks-roadmap-save-demo="1"' if save_demo else ""
    inline_script = ""
    if inline:
        inline_script = (
            f'<script type="application/json" data-ks-roadmap-data>{inline}</script>'
        )
    date_table = render_roadmap_date_table_fragment(
        payload.get("date_rows") or [],
        rel_path=str(payload.get("rel_path") or "ROADMAP.md"),
    )
    modal = render_roadmap_modal_shell() if mode == "dynamic" else ""
    return (
        modal
        + f'<div class="ks-roadmap ks-roadmap--editable" id="{e(mount_id)}" '
        f'data-ks-roadmap-editable="1" data-ks-roadmap-mode="{e(mode)}" '
        f'data-ks-roadmap-id="{e(roadmap_id)}"{load_attr}{save_attr}{demo_attr} '
        f'{_attrs(HASH_RME, "roadmap-editable")}>'
        f'<div class="ks-roadmap__toolbar" data-ks-roadmap-toolbar>'
        f'<button type="button" class="btn btn-sm btn-outline-secondary" data-ks-roadmap-add-bar>Add bar</button>'
        f'<button type="button" class="btn btn-sm btn-outline-secondary" data-ks-roadmap-delete-bar disabled>Delete bar</button>'
        f'<button type="button" class="btn btn-sm btn-forge" data-ks-roadmap-save>Save</button>'
        f'<button type="button" class="btn btn-sm btn-outline-secondary" data-ks-roadmap-reload>Reload</button>'
        f'<span class="ks-roadmap__status forge-support small ms-2" data-ks-roadmap-status></span>'
        f"</div>"
        f"{inline_script}"
        f'<div class="ks-roadmap__editor">'
        f'<div class="ks-nested-roadmap ks-roadmap__swimlane-wrap">'
        f'<div class="ks-nested-roadmap__viewport ks-roadmap__swimlane" '
        f'data-ks-roadmap-viewport data-ks-nrm-viewport></div></div>'
        f"{date_table}"
        f"</div></div>"
    )


def render_nested_roadmap(
    *,
    config: dict[str, Any],
    roadmap_id: str = "ks-nested-roadmap-1",
    include_modal_shell: bool = True,
) -> str:
    """Backward-compatible alias — see ``roadmap.render_roadmap_dynamic``."""
    return render_roadmap_dynamic(
        config,
        roadmap_id=roadmap_id,
        include_modal_shell=include_modal_shell,
    )


def _attrs(hash_id: str, name: str) -> str:
    return ks_hash_attrs(hash_id, "component", name)


__all__ = [
    "HASH_RMD",
    "HASH_RME",
    "HASH_RMS",
    "build_static_svg",
    "get_roadmap_demo_doc",
    "render_nested_roadmap",
    "render_roadmap_date_table_fragment",
    "render_roadmap_dynamic",
    "render_roadmap_editable",
    "render_roadmap_modal_shell",
    "render_roadmap_static",
    "upgrade_to_v2",
]
