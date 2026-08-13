"""Load enterprise app UX ruleset for Studio UX PDCA (GPT prompts)."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

RULESET_PATH = Path(__file__).resolve().parent / "enterprise-app-ruleset.json"


@lru_cache(maxsize=1)
def load_ruleset(path: Path | None = None) -> dict[str, Any]:
    p = path or RULESET_PATH
    return json.loads(p.read_text(encoding="utf-8"))


def allowed_rule_ids(ruleset: dict[str, Any] | None = None) -> set[str]:
    data = ruleset or load_ruleset()
    return {r["id"] for r in data.get("rules", [])}


def handbook_url(rule_id: str, ks_public_base: str, ruleset: dict[str, Any] | None = None) -> str | None:
    data = ruleset or load_ruleset()
    base = ks_public_base.rstrip("/")
    for row in data.get("rules", []):
        if row.get("id") == rule_id and row.get("handbookSlug"):
            return f"{base}/cases/showcase/ux-audit-rules/{row['handbookSlug']}.html"
    return None


def format_prompt_appendix(ks_public_base: str, ruleset: dict[str, Any] | None = None) -> str:
    data = ruleset or load_ruleset()
    base = ks_public_base.rstrip("/")
    lines = [
        "## Enterprise app UX ruleset (Studio PDCA pack)",
        "",
        f"Canonical standard: `{data.get('standardPath', '')}`",
        f"ENT.APP contracts: `{data.get('enterpriseAppContractsPath', 'docs/design/enterprise-app/README.md')}`",
        f"Rule catalog index: {base}/cases/showcase/ux-audit-rules.html",
        "",
        "Cite **only** rule IDs from this closed pack (or `null` when no rule applies):",
        "",
        "| Rule ID | Axis | Lane | Remediation | Handbook |",
        "|---------|------|------|-------------|----------|",
    ]
    for row in data.get("rules", []):
        rid = row.get("id", "")
        url = handbook_url(rid, base, data)
        link = f"[open]({url})" if url else "—"
        ks = row.get("suggestedKsComponent") or "—"
        lines.append(
            f"| `{rid}` | {row.get('axis', '')} | {row.get('lane', '')} | {ks} | {link} |"
        )
    lines.extend(
        [
            "",
            "### KS remediation components (closed list)",
            "",
        ]
    )
    for comp in data.get("ksComponents", []):
        lines.append(f"- **{comp['id']}** — {comp['name']}. {comp.get('useWhen', '')}.")
    lines.extend(
        [
            "",
            "Studio pages use **`DET.STUDIO.JOB_BUDGET`**, not marketing **`DET.SECTION.SINGLE_JOB`**.",
        ]
    )
    return "\n".join(lines)


def validate_findings(findings: list[dict[str, Any]], ruleset: dict[str, Any] | None = None) -> list[str]:
    """Return warnings for rule_ids outside the closed pack."""
    allowed = allowed_rule_ids(ruleset)
    warnings: list[str] = []
    for f in findings:
        rid = f.get("rule_id")
        if rid in (None, "", "null"):
            continue
        if rid not in allowed:
            warnings.append(f"finding cites out-of-pack rule_id: {rid}")
    return warnings
