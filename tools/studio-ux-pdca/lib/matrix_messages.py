"""Operator-facing Matrix/Element message builders for Studio UX PDCA.

Keep forge-agents `forge_studio_ux_notify.messages` aligned when changing formats.
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path
from typing import Any


def load_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


def clean_purpose(raw: str, *, page_title: str = "", fallback: str = "") -> str:
    """Strip markdown headings / wiki dump noise into one operator sentence."""
    text = (raw or "").strip()
    if not text:
        if page_title:
            return f"Review and uplift {page_title}"
        return fallback or "Studio UX PDCA page review"

    lines: list[str] = []
    for line in text.replace("\r\n", "\n").split("\n"):
        cleaned = re.sub(r"^#{1,6}\s*", "", line.strip())
        cleaned = re.sub(r"^\*\*(.+?)\*\*:?\s*", r"\1: ", cleaned)
        cleaned = cleaned.strip(" -*")
        if not cleaned:
            continue
        lower = cleaned.lower()
        if lower in {"dual-wiki context", "feature ids", "wiki context", "context"}:
            continue
        if lower.startswith("feature id"):
            continue
        if lower.startswith("page:"):
            # Prefer the human title already passed separately.
            continue
        lines.append(cleaned)

    joined = " ".join(lines)
    joined = re.sub(r"\s+", " ", joined).strip()
    if not joined or joined.lower().startswith("dual-wiki"):
        if page_title:
            return f"Review and uplift {page_title}"
        return fallback or "Studio UX PDCA page review"
    if len(joined) > 160:
        joined = joined[:157].rstrip() + "…"
    return joined


def short_cycle_ref(cycle_dir: Path) -> str:
    """Prefer pages/<slug>/iter-NNN over absolute workbench paths."""
    parts = list(cycle_dir.resolve().parts)
    for i, part in enumerate(parts):
        if part == "pages" and i + 2 < len(parts):
            return "/".join(parts[i : i + 3])
    for i, part in enumerate(parts):
        if part == "studio-ux-pdca" and i + 1 < len(parts):
            return "/".join(parts[i + 1 :])
    return cycle_dir.name


def _fmt_score(value: Any) -> str:
    if value is None or value == "?":
        return "?"
    try:
        num = float(value)
    except (TypeError, ValueError):
        return str(value)
    if num == int(num):
        return str(int(num))
    return f"{num:.1f}"


def _gate_flags(gates: dict[str, Any], scores: dict[str, Any]) -> dict[str, bool | None]:
    g = gates.get("gates") if isinstance(gates.get("gates"), dict) else {}
    return {
        "pytest": _tri_state(g.get("pytest_ok"), scores.get("pytest_ok")),
        "playwright": _tri_state(g.get("playwright_ok"), scores.get("playwright_ok")),
        "dual_wiki": _tri_state(g.get("dual_wiki_ok"), scores.get("dual_wiki_ok")),
        "score": _tri_state(g.get("score_ok"), None),
        "deterministic": _tri_state(g.get("deterministic_ok"), scores.get("deterministic_ok")),
        "passed": _tri_state(g.get("passed"), None),
    }


def _tri_state(*values: Any) -> bool | None:
    for value in values:
        if value is True:
            return True
        if value is False:
            return False
    return None


def format_gate_line(gates: dict[str, Any], scores: dict[str, Any] | None = None) -> str:
    scores = scores or {}
    flags = _gate_flags(gates, scores)
    parts: list[str] = []
    for key, label in (
        ("pytest", "pytest"),
        ("playwright", "playwright"),
        ("dual_wiki", "dual-wiki"),
        ("score", "score"),
        ("deterministic", "DET"),
    ):
        state = flags[key]
        if state is True:
            parts.append(f"{label} OK")
        elif state is False:
            parts.append(f"{label} FAIL")
    return " · ".join(parts) if parts else "gates pending"


def verdict_label(gates: dict[str, Any], scores: dict[str, Any] | None = None) -> str:
    scores = scores or {}
    flags = _gate_flags(gates, scores)
    if flags["passed"] is True:
        return "PASS"
    if flags["passed"] is False:
        return "FAIL"
    # No aggregate pass flag — infer from available checks.
    hard = [flags["pytest"], flags["playwright"], flags["dual_wiki"], flags["score"]]
    if any(v is False for v in hard):
        return "FAIL"
    if all(v is True for v in hard if v is not None) and any(v is True for v in hard):
        return "PASS"
    return "SCORE-ONLY"


def score_line(scores: dict[str, Any], gates: dict[str, Any] | None = None) -> str:
    before = _fmt_score((scores.get("before") or {}).get("overall"))
    after = _fmt_score((scores.get("after") or {}).get("overall"))
    try:
        delta = float(after) - float(before)
        delta_s = f"{delta:+.0f}" if delta == int(delta) else f"{delta:+.1f}"
    except (TypeError, ValueError):
        delta_s = "?"

    gate_meta = (gates or {}).get("score_gate") or {}
    thr = gate_meta.get("thresholds") or {}
    need_bits: list[str] = []
    if thr.get("absolute_pass") is not None:
        need_bits.append(f"abs≥{thr['absolute_pass']}")
    if thr.get("improvement_delta") is not None:
        need_bits.append(f"Δ≥{thr['improvement_delta']}")
    need = f" ({', '.join(need_bits)})" if need_bits else ""
    reason = gate_meta.get("reason")
    extra = f" — {reason}" if reason else ""
    return f"{before}→{after} ({delta_s}){need}{extra}"


def _suggestion_items(cycle_dir: Path) -> list[dict[str, Any]]:
    for name in ("prioritized-suggestions.json", "assessment.json"):
        data = load_json(cycle_dir / name)
        raw = data.get("prioritized_suggestions")
        if isinstance(raw, list) and raw:
            return [s for s in raw if isinstance(s, dict)]
    prompts = sorted((cycle_dir / "pdca-prompts").glob("*.md")) if (cycle_dir / "pdca-prompts").is_dir() else []
    items: list[dict[str, Any]] = []
    for path in prompts[:5]:
        title = path.stem
        text = path.read_text(encoding="utf-8", errors="replace")
        m = re.search(r"Implement \*\*only\*\* this ranked change:\s*\*\*(.+?)\*\*", text)
        if m:
            title = m.group(1).strip()
        else:
            m2 = re.search(r"^#\s+(.+)$", text, re.M)
            if m2:
                title = m2.group(1).strip()
        items.append({"title": title, "rank": len(items) + 1})
    return items


def suggestion_bullets(cycle_dir: Path, *, limit: int = 5) -> list[str]:
    items = _suggestion_items(cycle_dir)[:limit]
    bullets: list[str] = []
    for item in items:
        title = str(item.get("title") or "Suggestion").strip()
        axis = item.get("axis")
        uplift = item.get("expected_uplift")
        bits = [title]
        meta = []
        if axis:
            meta.append(str(axis))
        if uplift:
            meta.append(f"uplift={uplift}")
        if meta:
            bits.append(f"({', '.join(meta)})")
        bullets.append(" ".join(bits))
    if bullets:
        return bullets

    # Fallback: first sentence of changes-summary / findings
    summary_path = cycle_dir / "changes-summary.md"
    if summary_path.exists():
        summary = summary_path.read_text(encoding="utf-8").strip()
        first = re.split(r"(?<=[.!?])\s+", summary, maxsplit=1)[0].strip()
        if first:
            if len(first) > 140:
                first = first[:137].rstrip() + "…"
            return [first]
    findings = load_json(cycle_dir / "assessment.json").get("findings") or []
    for finding in findings[:3]:
        if not isinstance(finding, dict):
            continue
        axis = finding.get("axis") or "finding"
        ev = str(finding.get("evidence") or "").strip()
        if len(ev) > 120:
            ev = ev[:117].rstrip() + "…"
        bullets.append(f"{axis}: {ev}" if ev else str(axis))
    return bullets or ["(see workbench assessment)"]


def applied_cursor_count(cycle_dir: Path) -> tuple[int, int]:
    """Return (applied_or_planned, total) from prompts on disk."""
    prompts_dir = cycle_dir / "pdca-prompts"
    total = len(list(prompts_dir.glob("*.md"))) if prompts_dir.is_dir() else 0
    if total == 0:
        if (cycle_dir / "pdca-prompt.md").exists():
            return (1, 1)
        return (0, 0)
    # Cursor runs leave agent logs inconsistently; treat prompt count as planned.
    return (total, total)


def build_start_message(
    *,
    consumer_id: str,
    page_slug: str,
    page_title: str,
    page_path: str,
    purpose: str,
    campaign_id: str,
    cycle_dir: Path,
    page_index: int | None = None,
    page_total: int | None = None,
) -> str:
    purpose_clean = clean_purpose(purpose, page_title=page_title)
    progress = ""
    if page_index and page_total:
        progress = f"\nProgress: page {page_index}/{page_total}"
    title = page_title or page_slug
    return (
        f"**[{consumer_id}] START** · `{page_slug}`\n"
        f"Campaign: `{campaign_id}`\n"
        f"Page: {title}\n"
        f"Route: `{page_path or '—'}`\n"
        f"Purpose: {purpose_clean}"
        f"{progress}\n"
        f"Ref: `{short_cycle_ref(cycle_dir)}`"
    )


def build_complete_message(
    *,
    consumer_id: str,
    page_slug: str,
    iteration: int,
    cycle_dir: Path,
    campaign_id: str = "",
    page_index: int | None = None,
    page_total: int | None = None,
    cursor_applied: int | None = None,
    cursor_total: int | None = None,
) -> str:
    scores = load_json(cycle_dir / "scores.json")
    gates = load_json(cycle_dir / "gates.json")
    verdict = verdict_label(gates, scores)
    gate_line = format_gate_line(gates, scores)
    bullets = suggestion_bullets(cycle_dir)
    planned, planned_total = applied_cursor_count(cycle_dir)
    applied = cursor_applied if cursor_applied is not None else planned
    total = cursor_total if cursor_total is not None else planned_total

    lines = [
        f"**[{consumer_id}] {verdict}** · `{page_slug}` · iter {iteration}",
        f"Score: {score_line(scores, gates)}",
        f"Gates: {gate_line}",
    ]
    if total:
        lines.append(f"Cursor: applied/planned {applied}/{total}")
    if bullets:
        lines.append("Focus:")
        for bullet in bullets[:5]:
            lines.append(f"- {bullet}")
    progress = ""
    if page_index and page_total:
        progress = f"\nCampaign: `{campaign_id or '—'}` · page {page_index}/{page_total}"
    elif campaign_id:
        progress = f"\nCampaign: `{campaign_id}`"
    lines.append(f"Ref: `{short_cycle_ref(cycle_dir)}`{progress}")
    return "\n".join(lines)


def build_progress_message(
    *,
    consumer_id: str,
    page_slug: str,
    iteration: int,
    status: str,
    detail: str = "",
    campaign_id: str = "",
) -> str:
    status_clean = (status or "working").strip()
    detail_clean = (detail or "").strip()
    lines = [
        f"**[{consumer_id}] …** · `{page_slug}` · iter {iteration}",
        f"Status: {status_clean}",
    ]
    if detail_clean:
        lines.append(detail_clean)
    if campaign_id:
        lines.append(f"Campaign: `{campaign_id}`")
    return "\n".join(lines)


def build_campaign_message(
    *,
    consumer_id: str,
    campaign_id: str,
    event: str,
    page_total: int = 0,
    pages_done: int = 0,
    status: str = "",
    campaign_dir: Path | None = None,
) -> str:
    if event == "campaign-start":
        head = "CAMPAIGN START"
    elif event == "campaign-complete":
        head = "CAMPAIGN DONE"
    else:
        head = event.upper()
    lines = [
        f"**[{consumer_id}] {head}**",
        f"Campaign: `{campaign_id}`",
    ]
    if page_total:
        lines.append(f"Pages: {pages_done}/{page_total} done" if event == "campaign-complete" else f"Pages queued: {page_total}")
    if status:
        lines.append(f"Status: {status}")
    if campaign_dir is not None:
        lines.append(f"Ref: `{campaign_dir.name}`")
    return "\n".join(lines)


def matrix_message_content(body: str, *, msgtype: str = "m.text") -> dict[str, Any]:
    """Build Element-friendly rich text without requiring the markdown package."""
    text = (body or "").strip()
    if not text:
        return {"msgtype": msgtype, "body": ""}
    return {
        "msgtype": msgtype,
        "body": text,
        "format": "org.matrix.custom.html",
        "formatted_body": _markdownish_to_html(text),
    }


def _markdownish_to_html(text: str) -> str:
    lines = text.split("\n")
    out: list[str] = []
    in_list = False

    def close_list() -> None:
        nonlocal in_list
        if in_list:
            out.append("</ul>")
            in_list = False

    for line in lines:
        bullet = re.match(r"^[-*]\s+(.+)$", line)
        if bullet:
            if not in_list:
                out.append("<ul>")
                in_list = True
            out.append(f"<li>{_inline_md(bullet.group(1))}</li>")
            continue
        close_list()
        if not line.strip():
            out.append("<br/>")
            continue
        out.append(f"<p>{_inline_md(line)}</p>")
    close_list()
    return "".join(out)


def _inline_md(text: str) -> str:
    escaped = html.escape(text)

    def code_repl(match: re.Match[str]) -> str:
        return f"<code>{match.group(1)}</code>"

    def bold_repl(match: re.Match[str]) -> str:
        return f"<strong>{match.group(1)}</strong>"

    escaped = re.sub(r"`([^`]+)`", code_repl, escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", bold_repl, escaped)
    return escaped


def image_label(kind: str, page_slug: str) -> str:
    label = "Before" if kind == "before" else "After" if kind == "after" else kind.title()
    return f"{label} — {page_slug}"
