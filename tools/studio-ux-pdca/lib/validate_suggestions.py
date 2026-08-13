"""Validate prioritized_suggestions from ChatGPT Studio UX assessments."""

from __future__ import annotations

from typing import Any

from load_ruleset import allowed_rule_ids

VALID_AXES = {
    "page_identity",
    "job_budget",
    "control_density",
    "human_outcome",
    "wiki_functionality",
    "enterprise_ux",
    "human_friendliness",
}
VALID_SEVERITIES = {"blocker", "critical", "major", "warn", "minor"}
VALID_UPLIFT = {"high", "medium", "low"}
VALID_KS = {"Svc", "Ftb", "Sab", "Cap", "null", None, ""}
MAX_DO_ITEMS = 6


def _is_wiki_page(page_meta: dict[str, Any] | None) -> bool:
    if not page_meta:
        return False
    if page_meta.get("requires_dual_wiki_gate"):
        return True
    title = (page_meta.get("title") or "").lower()
    return any(k in title for k in ("wiki", "graph", "dual-wiki"))


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


def validate_suggestions(
    assessment: dict[str, Any],
    page_meta: dict[str, Any] | None = None,
    *,
    max_suggestions: int = 5,
    ruleset_allowed: set[str] | None = None,
) -> dict[str, Any]:
    """Validate and normalize prioritized_suggestions; return warnings + capped list."""
    allowed = ruleset_allowed or allowed_rule_ids()
    warnings: list[str] = []
    raw = list(assessment.get("prioritized_suggestions") or [])
    wiki_page = _is_wiki_page(page_meta)
    scores = assessment.get("scores") or {}
    wiki_score = scores.get("wiki_functionality", 100)

    if assessment.get("pdca_prompt"):
        warnings.append("legacy top-level pdca_prompt is ignored; use structured plan/do/check/adjust")

    normalized: list[dict[str, Any]] = []
    for idx, item in enumerate(raw):
        if len(normalized) >= max_suggestions:
            warnings.append(f"truncated suggestions beyond max {max_suggestions}")
            break
        if not isinstance(item, dict):
            warnings.append(f"suggestion[{idx}] is not an object — skipped")
            continue

        rid = item.get("rule_id")
        if rid not in (None, "", "null") and rid not in allowed:
            warnings.append(f"suggestion[{idx}] cites out-of-pack rule_id: {rid}")

        axis = item.get("axis")
        if axis and axis not in VALID_AXES:
            warnings.append(f"suggestion[{idx}] has unknown axis: {axis}")

        sev = str(item.get("severity", "")).lower()
        if sev and sev not in VALID_SEVERITIES:
            warnings.append(f"suggestion[{idx}] has unknown severity: {sev}")

        uplift = str(item.get("expected_uplift", "medium")).lower()
        if uplift not in VALID_UPLIFT:
            warnings.append(f"suggestion[{idx}] has unknown expected_uplift: {uplift}")

        do_items = _coerce_str_list(item.get("do"))
        if not do_items:
            legacy = (item.get("pdca_prompt") or "").strip()
            if legacy:
                warnings.append(
                    f"suggestion[{idx}] uses legacy pdca_prompt markdown — prefer structured do[]"
                )
            else:
                warnings.append(f"suggestion[{idx}] missing non-empty do[] — will use emit fallback")
        elif len(do_items) > MAX_DO_ITEMS:
            warnings.append(
                f"suggestion[{idx}] do[] has {len(do_items)} items (laundry-list) — cap at {MAX_DO_ITEMS}"
            )
            do_items = do_items[:MAX_DO_ITEMS]

        if item.get("pdca_prompt"):
            warnings.append(f"suggestion[{idx}] pdca_prompt field ignored — harness renders markdown locally")

        normalized.append(
            {
                **item,
                "plan": _coerce_str_list(item.get("plan")),
                "do": do_items,
                "check": _coerce_str_list(item.get("check")),
                "adjust": _coerce_str_list(item.get("adjust")),
            }
        )

    if wiki_page and wiki_score < 85:
        has_wiki = any(s.get("axis") == "wiki_functionality" for s in normalized)
        if not has_wiki:
            warnings.append(
                "wiki/graph page with wiki_functionality < 85 lacks wiki-axis suggestion — emit may inject fallback"
            )

    return {
        "warnings": warnings,
        "suggestions": normalized[:max_suggestions],
        "truncated": len(raw) > max_suggestions,
    }
