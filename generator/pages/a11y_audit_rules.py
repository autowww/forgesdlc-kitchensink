"""Accessibility audit rules handbook overview — links to per-rule showcase pages."""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
GENERATOR_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(GENERATOR_ROOT))

from components import e  # noqa: E402
from a11y_audit_rule_pages import (  # noqa: E402
    catalog_rule_summary,
    examples_gallery_href,
    kebab_from_rule_id,
    registry_row_for_rule,
)

MANIFEST_PATH = REPO_ROOT / "docs/design/a11y-audit/rule-pages/rule-pages.manifest.json"
REGISTRY_PATH = (
    REPO_ROOT / "tools/website-a11y-auditor/design-rules/registry.generated.json"
)
COMPLIANCE_PATH = (
    REPO_ROOT / "tools/website-a11y-auditor/design-rules/compliance-profiles.generated.json"
)
TRACEABILITY_PATH = (
    REPO_ROOT / "tools/website-a11y-auditor/design-rules/standards-traceability.generated.json"
)

_GALLERY = examples_gallery_href()


def _load_manifest() -> dict:
    if MANIFEST_PATH.is_file():
        return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    return {}


def _load_registry() -> dict:
    if REGISTRY_PATH.is_file():
        return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    return {}


def _load_compliance_profiles() -> dict:
    if COMPLIANCE_PATH.is_file():
        return json.loads(COMPLIANCE_PATH.read_text(encoding="utf-8"))
    return {}


def _compliance_profiles_table() -> str:
    data = _load_compliance_profiles()
    profiles = data.get("profiles") or []
    if not profiles:
        return (
            "<p class='forge-support'>Run <code>npm run blend-rules</code> in "
            "<code>tools/website-a11y-auditor</code> to generate "
            "<code>compliance-profiles.generated.json</code>.</p>"
        )
    disclaimer = data.get("disclaimer") or ""
    lines = [
        f"<p class='forge-support'>{e(disclaimer)}</p>",
        '<div class="table-responsive ux-rule-catalog-table-wrap">',
        '<table class="table forge-table ux-rule-catalog-table">',
        "<thead><tr>",
        "<th>Profile</th>",
        "<th>WCAG</th>",
        "<th>Axe tags</th>",
        "<th>DET standards tags</th>",
        "</tr></thead><tbody>",
    ]
    for p in profiles:
        pid = p.get("id") or ""
        lines.append(
            "<tr>"
            f"<td><code>{e(pid)}</code><br><span class='ux-rule-catalog-summary'>"
            f"{e(p.get('label') or '')}</span></td>"
            f"<td>{e(p.get('wcagVersion') or '—')} {e(p.get('level') or '')}</td>"
            f"<td><code style='font-size:0.75em'>{e(', '.join(p.get('axeTags') or []))}</code></td>"
            f"<td><code style='font-size:0.75em'>{e(', '.join(p.get('detStandardsTags') or []))}</code></td>"
            "</tr>"
        )
    lines.append("</tbody></table></div>")
    lines.append(
        "<p class='forge-support mt-3'>CLI: "
        "<code>--standard &lt;profile-id&gt;</code> or "
        "<code>--compliance-profile &lt;profile-id&gt;</code>. "
        "See <code>docs/design/a11y-audit/compliance-profiles.md</code>.</p>"
    )
    return "\n".join(lines)


def _load_traceability() -> dict:
    if TRACEABILITY_PATH.is_file():
        return json.loads(TRACEABILITY_PATH.read_text(encoding="utf-8"))
    return {}


_PRINCIPLE_NAMES = {
    "1": "Perceivable",
    "2": "Operable",
    "3": "Understandable",
    "4": "Robust",
}


def _principle_coverage_table(by_principle: dict) -> str:
    if not by_principle:
        return ""
    lines = [
        '<div class="table-responsive ux-rule-catalog-table-wrap mt-2">',
        '<table class="table forge-table ux-rule-catalog-table">',
        "<thead><tr>",
        "<th>Principle</th>",
        "<th>Covered</th>",
        "<th>Manual expected</th>",
        "<th>Uncovered</th>",
        "<th>Total</th>",
        "</tr></thead><tbody>",
    ]
    for key in sorted(by_principle.keys(), key=lambda k: int(k) if str(k).isdigit() else 99):
        row = by_principle[key]
        label = _PRINCIPLE_NAMES.get(str(key), f"Principle {key}")
        lines.append(
            "<tr>"
            f"<td>{e(label)}</td>"
            f"<td>{row.get('covered', 0)}</td>"
            f"<td>{row.get('manualExpected', 0)}</td>"
            f"<td>{row.get('uncovered', 0)}</td>"
            f"<td>{row.get('total', 0)}</td>"
            "</tr>"
        )
    lines.append("</tbody></table></div>")
    return "\n".join(lines)


def _traceability_section() -> str:
    data = _load_traceability()
    profiles = data.get("profiles") or {}
    if not profiles:
        return (
            "<p class='forge-support'>Run <code>npm run blend-rules</code> to generate "
            "<code>standards-traceability.generated.json</code>.</p>"
        )
    lines = [
        f"<p class='forge-support'>{e(data.get('disclaimer') or '')}</p>",
        "<p>See <code>docs/design/a11y-audit/standards-traceability.md</code> and "
        "<code>standards-traceability-gaps.md</code> for full gap lists.</p>",
    ]
    for pid in ("wcag21aa", "wcag22aa"):
        p = profiles.get(pid)
        if not p:
            continue
        s = p.get("summary") or {}
        lines.append(f"<h3 class='h6 mt-4'>{e(pid)}</h3>")
        lines.append("<dl class='ag-spec'>")
        lines.append(f"<dt>Success criteria</dt><dd>{s.get('totalCriteria', '—')}</dd>")
        lines.append(f"<dt>Covered</dt><dd>{s.get('covered', '—')}</dd>")
        lines.append(f"<dt>Manual expected</dt><dd>{s.get('manualExpected', '—')}</dd>")
        lines.append(f"<dt>Uncovered gaps</dt><dd>{s.get('uncovered', '—')}</dd>")
        lines.append(f"<dt>Untied rules</dt><dd>{s.get('untiedRuleCount', '—')}</dd>")
        lines.append("</dl>")
        by_principle = s.get("byPrinciple") or {}
        if by_principle:
            lines.append("<p class='forge-support mb-1'>Coverage by WCAG principle:</p>")
            lines.append(_principle_coverage_table(by_principle))
        uncovered = (p.get("gaps") or {}).get("uncoveredCriteria") or []
        untied = (p.get("gaps") or {}).get("untiedRules") or []
        if uncovered:
            lines.append("<details class='mb-2'><summary>Uncovered criteria (sample)</summary><ul>")
            for cid in uncovered[:20]:
                row = next((c for c in p.get("criteria") or [] if c.get("criterionId") == cid), {})
                lines.append(
                    f"<li><code>{e(cid)}</code> — {e(row.get('title') or '')}</li>"
                )
            if len(uncovered) > 20:
                lines.append(f"<li class='forge-support'>… {len(uncovered) - 20} more in gaps doc</li>")
            lines.append("</ul></details>")
        if untied:
            lines.append("<details class='mb-2'><summary>Untied rules</summary><ul>")
            for u in untied:
                lines.append(f"<li><code>{e(u.get('ruleId') or '')}</code> ({e(u.get('lane') or '')})</li>")
            lines.append("</ul></details>")
    return "\n".join(lines)


def _status_badge(status: str) -> str:
    s = status or "missing"
    cls = {
        "current": "forge-badge forge-badge-success",
        "stale": "forge-badge forge-badge-warning",
        "missing": "forge-badge forge-badge-danger",
    }.get(s, "forge-badge")
    return f'<span class="{cls}">{e(s)}</span>'


def _scope_chip(registry: dict, rule_id: str) -> str:
    row = registry_row_for_rule(registry, rule_id)
    scope = (row or {}).get("scope") or ""
    if not scope:
        return ""
    return f' <span class="forge-badge ms-1">{e(scope)}</span>'


def _rules_reader_table(
    rules: list[dict],
    *,
    lane: str,
    registry: dict,
) -> str:
    rows = sorted(
        [r for r in rules if r.get("lane") == lane],
        key=lambda r: r.get("id") or "",
    )
    if not rows:
        return "<p class='forge-support'>No rules in manifest for this lane.</p>"

    intro = (
        "<p class='forge-support mb-3'>Each rule has its own page under "
        "<code>a11y-audit-rules/</code> — click the rule id or <strong>Open page</strong> for "
        "purpose, scope, Before/After, and remediation.</p>"
    )
    lines = [
        intro,
        '<div class="table-responsive ux-rule-catalog-table-wrap">',
        '<table class="table forge-table ux-rule-catalog-table">',
        "<thead><tr>",
        "<th>Rule</th>",
        "<th>Scope</th>",
        "<th>What it checks</th>",
        "<th>Examples</th>",
        "<th>Open page</th>",
        "</tr></thead><tbody>",
    ]
    for r in rows:
        rid = r.get("id") or ""
        slug = kebab_from_rule_id(rid)
        page_href = f"a11y-audit-rules/{slug}.html"
        examples_href = f"{_GALLERY}#ex-{slug}"
        summary = catalog_rule_summary(rid, manifest_row=r, registry=registry)
        scope = r.get("scope") or (registry_row_for_rule(registry, rid) or {}).get("scope") or "—"
        lines.append(
            "<tr>"
            f'<td class="ux-rule-catalog-rule">'
            f'<a href="{e(page_href)}" class="text-cyan" style="text-decoration:none">'
            f"<code>{e(rid)}</code></a>"
            f' <span class="ms-1">{_status_badge(r.get("status") or "missing")}</span>'
            f"</td>"
            f"<td><code>{e(scope)}</code></td>"
            f'<td class="ux-rule-catalog-summary">{e(summary)}</td>'
            f'<td><a href="{e(examples_href)}">Before/After</a></td>'
            f'<td><a class="btn btn-sm btn-forge-outline" href="{e(page_href)}">Open page</a></td>'
            "</tr>"
        )
    lines.append("</tbody></table></div>")
    return "\n".join(lines)


PAGE = {
    "slug": "a11y-audit-rules",
    "title": "Accessibility audit rules",
    "intro": (
        "Handbook for DET.A11Y.* and AI.A11Y.* rules used by the website accessibility auditor."
    ),
    "family": "Patterns",
    "layout": "showcase",
    "order": 12,
    "toc": [
        ("aar-ecosystem", "Auditor ecosystem"),
        ("aar-compliance", "Compliance profiles"),
        ("aar-traceability", "Traceability matrix"),
        ("aar-lifecycle", "Lifecycle"),
        ("aar-refresh", "Refresh handbook"),
        ("aar-summary", "Coverage summary"),
        ("aar-det", "Deterministic rules"),
        ("aar-ai", "AI rules"),
    ],
}


def extra_css() -> str:
    return """
    .ux-rule-catalog-table td { vertical-align: top; }
    .ux-rule-catalog-summary {
      max-width: 42rem;
      font-size: 0.9rem;
      color: var(--forge-text-2);
      line-height: 1.45;
    }
    .ux-rule-catalog-rule code { font-size: 0.85em; }
    .ux-rule-catalog-table-wrap { overflow-x: visible; }
    """


def render() -> str:
    manifest = _load_manifest()
    registry = _load_registry()
    summary = manifest.get("summary") or {}
    rules = manifest.get("rules") or []
    reg_fp = manifest.get("registryFingerprint") or registry.get("fingerprint") or "—"
    gallery = _GALLERY

    if not rules and registry:
        det = [
            {
                "id": r["id"],
                "lane": "deterministic",
                "scope": r.get("scope"),
                "registryStatus": r.get("status"),
                "status": "missing",
            }
            for r in registry.get("deterministicRules") or []
        ]
        ai = [
            {
                "id": r["id"],
                "lane": "ai",
                "scope": r.get("scope"),
                "registryStatus": r.get("status"),
                "status": "missing",
            }
            for r in registry.get("aiRules") or []
        ]
        rules = det + ai
        summary = {
            "total": len(rules),
            "deterministic": len(det),
            "ai": len(ai),
            "current": 0,
            "stale": 0,
            "missing": len(rules),
        }

    return f"""
<section class="ks-section" id="aar-ecosystem">
  <h2 class="ks-section-title">Accessibility auditor ecosystem</h2>
  <p>Every rule has a handbook page at
  <code>a11y-audit-rules/&lt;rule-id-kebab&gt;.html</code>
  (example: <a href="a11y-audit-rules/det-a11y-generic-lang.html">DET.A11Y.GENERIC.LANG</a>).
  See <a href="a11y-audit-ecosystem.html">Accessibility auditor ecosystem</a> for lanes (axe, DET, AI),
  standards presets, and KS auto-detection.
  <a href="{e(gallery)}">Before/After gallery</a> shows all rule fixtures on one page.</p>
</section>

<section class="ks-section" id="aar-compliance">
  <h2 class="ks-section-title">Compliance profiles</h2>
  <p>Named bundles map procurement frameworks (ADA, Section 508, EN 301 549) to axe tag sets and
  which <code>DET.A11Y.*</code> rules run. The axe lane carries most WCAG automation (~80+ rules);
  the 17 deterministic rules are Forge supplements — not one rule per WCAG success criterion.</p>
  {_compliance_profiles_table()}
</section>

<section class="ks-section" id="aar-traceability">
  <h2 class="ks-section-title">Standards traceability matrix (RTM)</h2>
  <p>Maps WCAG 2.1 AA and 2.2 AA success criteria to axe-core rules and Forge
  <code>DET.A11Y.*</code> / <code>AI.A11Y.*</code> rules. Regenerated by
  <code>npm run blend-rules</code>.</p>
  {_traceability_section()}
</section>

<section class="ks-section" id="aar-lifecycle">
  <h2 class="ks-section-title">Lifecycle</h2>
  <p>Canonical definitions live under <code>docs/design/a11y-audit/</code>. The blender emits
  <code>registry.generated.json</code>. Handbook pages live in
  <code>docs/design/a11y-audit/rule-pages/</code> and compile to
  <code>showcase/a11y-audit-rules/</code>.</p>
  <ol>
    <li><strong>Blend</strong> — <code>npm run blend-rules</code> in <code>tools/website-a11y-auditor</code>.</li>
    <li><strong>Bootstrap pages</strong> — <code>python3 generator/bootstrap_a11y_rule_pages.py</code> (initial/stub refresh).</li>
    <li><strong>build-showcase</strong> — compiles ecosystem, gallery, and per-rule HTML.</li>
  </ol>
</section>

<section class="ks-section" id="aar-refresh">
  <h2 class="ks-section-title">Refresh handbook</h2>
  <pre class="forge-code"><code>cd tools/website-a11y-auditor
npm run blend-rules
cd ../..
python3 generator/bootstrap_a11y_rule_pages.py
python3 generator/build-showcase.py</code></pre>
</section>

<section class="ks-section" id="aar-summary">
  <h2 class="ks-section-title">Coverage summary</h2>
  <dl class="ag-spec">
    <dt>Registry fingerprint</dt><dd><code>{e(reg_fp)}</code></dd>
    <dt>Total rules</dt><dd>{summary.get('total', len(rules))}</dd>
    <dt>Deterministic</dt><dd>{summary.get('deterministic', '—')}</dd>
    <dt>AI</dt><dd>{summary.get('ai', '—')}</dd>
    <dt>Handbook current</dt><dd>{summary.get('current', 0)}</dd>
  </dl>
</section>

<section class="ks-section" id="aar-det">
  <h2 class="ks-section-title">Deterministic rules (DET.A11Y.*)</h2>
  {_rules_reader_table(rules, lane='deterministic', registry=registry)}
</section>

<section class="ks-section" id="aar-ai">
  <h2 class="ks-section-title">AI rules (AI.A11Y.*)</h2>
  {_rules_reader_table(rules, lane='ai', registry=registry)}
</section>
"""
