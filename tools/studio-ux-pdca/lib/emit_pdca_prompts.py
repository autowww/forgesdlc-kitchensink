"""Split GPT assessment into ranked PDCA prompts (max N per cycle)."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

MAX_SUGGESTIONS = int(os.environ.get("STUDIO_UX_MAX_SUGGESTIONS_PER_CYCLE", "5"))

SEVERITY_RANK = {"blocker": 0, "critical": 1, "major": 2, "warn": 3, "minor": 4}
UPLIFT_RANK = {"high": 0, "medium": 1, "low": 2}

DEFAULT_CHECK = [
    "pytest -q",
    "cd studio-ui && npx playwright test tests/api-smoke.spec.ts",
]
WIKI_CHECK = "scripts/fm-studio-enterprise-pdca/check-dual-wiki-master.sh"


def _slugify(value: str, *, max_len: int = 48) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", (value or "suggestion").lower()).strip("-")
    return (slug or "suggestion")[:max_len]


def _coerce_str_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        text = value.strip()
        return [text] if text else []
    if isinstance(value, list):
        out: list[str] = []
        for item in value:
            if item is None:
                continue
            text = str(item).strip()
            if text:
                out.append(text)
        return out
    return [str(value).strip()] if str(value).strip() else []


def _is_wiki_page(page_meta: dict[str, Any] | None) -> bool:
    if not page_meta:
        return False
    if page_meta.get("requires_dual_wiki_gate"):
        return True
    title = (page_meta.get("title") or "").lower()
    return any(k in title for k in ("wiki", "graph", "dual-wiki"))


def _finding_sort_key(finding: dict[str, Any], *, wiki_page: bool) -> tuple[int, int, int]:
    sev = SEVERITY_RANK.get(str(finding.get("severity", "minor")).lower(), 9)
    axis = str(finding.get("axis", ""))
    wiki_boost = 0 if wiki_page and axis == "wiki_functionality" else 1
    uplift = UPLIFT_RANK.get(str(finding.get("expected_uplift", "")).lower(), 2)
    return (sev, wiki_boost, uplift)


def _render_pdca_markdown(
    suggestion: dict[str, Any],
    *,
    rank: int,
    total: int,
    wiki_page: bool,
) -> str:
    """Render Plan/Do/Check/Adjust from structured fields (preferred over legacy markdown)."""
    title = suggestion.get("title") or f"Suggestion {rank}"
    rule = suggestion.get("rule_id") or "null"
    ks = suggestion.get("suggested_ks_component") or "null"
    evidence = suggestion.get("evidence") or suggestion.get("uplift_rationale") or ""

    plan = _coerce_str_list(suggestion.get("plan"))
    if not plan:
        plan = [
            f"Goal: {title}",
            f"Rule: `{rule}`",
            f"Axis: {suggestion.get('axis', '—')}",
            f"Expected uplift: {suggestion.get('expected_uplift', 'medium')}",
            f"KS component: `{ks}`",
        ]
        if evidence:
            plan.append(f"Evidence: {evidence}")

    do_items = _coerce_str_list(suggestion.get("do"))
    if not do_items:
        do_items = [
            "Remount IA for this single job before cosmetic polish.",
            "Reuse KS primitives (`Svc`, `Ftb`, `Sab`, `Cap`, `studio-ui/src/ks/*`).",
        ]
        if wiki_page:
            do_items.append("Preserve dual-wiki/graph behavior on wiki pages.")

    check_items = _coerce_str_list(suggestion.get("check")) or list(DEFAULT_CHECK)
    if wiki_page and WIKI_CHECK not in check_items:
        check_items.append(WIKI_CHECK)

    adjust_items = _coerce_str_list(suggestion.get("adjust"))
    if not adjust_items:
        adjust_items = [
            "If gates fail, revert cosmetic tweaks and keep this suggestion's IA change."
        ]

    def _bullets(items: list[str]) -> str:
        return "\n".join(f"- {item}" for item in items)

    return (
        f"# Studio UX PDCA — suggestion {rank} of {total}\n\n"
        f"## Scope\n\n"
        f"Implement **only** this ranked change: **{title}**.\n"
        f"Do not bundle other remounts from the assessment in this pass.\n\n"
        f"## Plan\n\n{_bullets(plan)}\n\n"
        f"## Do\n\n{_bullets(do_items)}\n\n"
        f"## Check\n\n{_bullets(check_items)}\n\n"
        f"## Adjust\n\n{_bullets(adjust_items)}\n"
    )


def _fallback_pdca_prompt(
    suggestion: dict[str, Any], *, rank: int, total: int, wiki_page: bool
) -> str:
    return _render_pdca_markdown(suggestion, rank=rank, total=total, wiki_page=wiki_page)


def _suggestion_from_finding(
    finding: dict[str, Any], *, rank: int, wiki_gaps: list[str]
) -> dict[str, Any]:
    axis = finding.get("axis") or "job_budget"
    rule = finding.get("rule_id") or "null"
    title_bits = [str(finding.get("severity", "finding")).title(), axis.replace("_", " ")]
    if rule and rule != "null":
        title_bits.append(rule)
    wiki_note = ""
    if axis == "wiki_functionality" and wiki_gaps:
        wiki_note = wiki_gaps[0]
    evidence = finding.get("evidence") or wiki_note or ""
    return {
        "rank": rank,
        "id": _slugify(f"{axis}-{rule}"),
        "title": " — ".join(title_bits),
        "axis": axis,
        "rule_id": rule,
        "severity": finding.get("severity"),
        "expected_uplift": "high"
        if finding.get("severity") in ("blocker", "critical", "major")
        else "medium",
        "uplift_rationale": wiki_note or (finding.get("evidence") or "")[:280],
        "suggested_ks_component": finding.get("suggested_ks_component"),
        "evidence": evidence,
        "plan": [],
        "do": [],
        "check": [],
        "adjust": [],
    }


def normalize_prioritized_suggestions(
    assessment: dict[str, Any],
    page_meta: dict[str, Any] | None = None,
    *,
    max_suggestions: int = MAX_SUGGESTIONS,
) -> list[dict[str, Any]]:
    wiki_page = _is_wiki_page(page_meta)
    scores = assessment.get("scores") or {}
    wiki_score = scores.get("wiki_functionality", 100)
    overall = scores.get("overall", 0)

    raw = list(assessment.get("prioritized_suggestions") or [])
    if not raw:
        findings = sorted(
            list(assessment.get("findings") or []),
            key=lambda f: _finding_sort_key(f, wiki_page=wiki_page),
        )
        wiki_gaps = list(assessment.get("wiki_gaps") or [])
        raw = [
            _suggestion_from_finding(f, rank=i + 1, wiki_gaps=wiki_gaps)
            for i, f in enumerate(findings[:max_suggestions])
        ]

    if overall >= 85 and not any(
        str(s.get("severity", "")).lower() in ("blocker", "critical") for s in raw
    ):
        max_suggestions = min(max_suggestions, 2)

    normalized: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for idx, item in enumerate(raw):
        if len(normalized) >= max_suggestions:
            break
        if not isinstance(item, dict):
            continue
        rank = int(item.get("rank") or len(normalized) + 1)
        sid = _slugify(str(item.get("id") or item.get("title") or f"s{rank}"))
        if sid in seen_ids:
            sid = f"{sid}-{rank}"
        seen_ids.add(sid)
        normalized.append(
            {
                "rank": len(normalized) + 1,
                "id": sid,
                "title": item.get("title") or f"Suggestion {len(normalized) + 1}",
                "axis": item.get("axis"),
                "rule_id": item.get("rule_id"),
                "severity": item.get("severity"),
                "expected_uplift": item.get("expected_uplift") or "medium",
                "uplift_rationale": item.get("uplift_rationale") or "",
                "suggested_ks_component": item.get("suggested_ks_component"),
                "evidence": item.get("evidence") or item.get("uplift_rationale") or "",
                "plan": _coerce_str_list(item.get("plan")),
                "do": _coerce_str_list(item.get("do")),
                "check": _coerce_str_list(item.get("check")),
                "adjust": _coerce_str_list(item.get("adjust")),
            }
        )

    normalized.sort(
        key=lambda s: (
            int(s.get("rank") or 99),
            UPLIFT_RANK.get(str(s.get("expected_uplift", "medium")).lower(), 2),
        )
    )
    for i, s in enumerate(normalized, 1):
        s["rank"] = i

    if wiki_page and wiki_score < 85:
        has_wiki = any(s.get("axis") == "wiki_functionality" for s in normalized)
        if not has_wiki:
            gaps = assessment.get("wiki_gaps") or []
            wiki_finding = next(
                (f for f in assessment.get("findings") or [] if f.get("axis") == "wiki_functionality"),
                None,
            )
            if wiki_finding and len(normalized) >= max_suggestions:
                normalized[-1] = _suggestion_from_finding(
                    wiki_finding, rank=max_suggestions, wiki_gaps=gaps
                )
                normalized[-1]["rank"] = max_suggestions
                normalized[-1]["expected_uplift"] = "high"
            elif gaps or wiki_finding:
                extra = _suggestion_from_finding(
                    wiki_finding
                    or {
                        "severity": "warn",
                        "axis": "wiki_functionality",
                        "rule_id": "null",
                        "evidence": gaps[0] if gaps else "Dual-wiki affordances incomplete",
                        "suggested_ks_component": "Cap",
                    },
                    rank=len(normalized) + 1,
                    wiki_gaps=gaps,
                )
                extra["title"] = "Strengthen dual-wiki evidence and cross-link path"
                extra["expected_uplift"] = "high"
                if len(normalized) < max_suggestions:
                    normalized.append(extra)
                    for i, s in enumerate(normalized, 1):
                        s["rank"] = i

    return normalized[:max_suggestions]


def emit_pdca_prompts(
    assessment: dict[str, Any],
    cycle_dir: Path,
    page_meta: dict[str, Any] | None = None,
    *,
    max_suggestions: int = MAX_SUGGESTIONS,
) -> dict[str, Any]:
    cycle_dir = Path(cycle_dir)
    wiki_page = _is_wiki_page(page_meta)
    suggestions = normalize_prioritized_suggestions(
        assessment, page_meta, max_suggestions=max_suggestions
    )
    prompts_dir = cycle_dir / "pdca-prompts"
    prompts_dir.mkdir(parents=True, exist_ok=True)
    for old in prompts_dir.glob("*.md"):
        old.unlink()

    paths: list[str] = []
    total = len(suggestions)
    for s in suggestions:
        rank = int(s["rank"])
        fname = f"{rank:02d}-{_slugify(s['id'])}.md"
        body = _render_pdca_markdown(s, rank=rank, total=total, wiki_page=wiki_page)
        header = (
            f"<!-- studio-ux-pdca: suggestion {rank}/{total} — implement this change only -->\n\n"
        )
        out_path = prompts_dir / fname
        out_path.write_text(header + body + ("\n" if not body.endswith("\n") else ""), encoding="utf-8")
        paths.append(str(out_path))
        s["pdca_prompt_file"] = fname

    index_lines = [
        "# Studio UX PDCA — prioritized batch",
        "",
        f"**Suggestions this cycle:** {total} (max {max_suggestions}, highest UX uplift first)",
        "",
        "Execute files in `pdca-prompts/` **in numeric order**. Each prompt is one scoped remount.",
        "",
        "| Rank | File | Title | Uplift | Rule |",
        "|------|------|-------|--------|------|",
    ]
    for s in suggestions:
        index_lines.append(
            f"| {s['rank']} | `{s.get('pdca_prompt_file', '')}` | {s.get('title', '')} | "
            f"{s.get('expected_uplift', '')} | `{s.get('rule_id', 'null')}` |"
        )
    if assessment.get("changes_summary"):
        index_lines.extend(["", "## Assessment summary", "", assessment["changes_summary"]])
    index_path = cycle_dir / "pdca-prompt.md"
    index_path.write_text("\n".join(index_lines) + "\n", encoding="utf-8")

    manifest = {
        "max_suggestions": max_suggestions,
        "count": total,
        "suggestions": suggestions,
    }
    manifest_path = cycle_dir / "prioritized-suggestions.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    assessment["prioritized_suggestions"] = suggestions
    assessment["_pdca_prompt_count"] = total
    assessment.pop("pdca_prompt", None)
    return {
        "ok": True,
        "count": total,
        "index_path": str(index_path),
        "manifest_path": str(manifest_path),
        "prompt_paths": paths,
    }
