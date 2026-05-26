"""UX audit rules handbook overview — links to per-rule showcase pages."""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
GENERATOR_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(GENERATOR_ROOT))

from components import e  # noqa: E402
from ux_audit_rule_pages import (  # noqa: E402
    catalog_rule_summary,
    examples_gallery_href,
    kebab_from_rule_id,
    registry_row_for_rule,
)

MANIFEST_PATH = REPO_ROOT / "docs" / "design" / "ux-audit" / "rule-pages" / "rule-pages.manifest.json"
REGISTRY_PATH = (
    REPO_ROOT / "tools" / "website-ux-auditor" / "design-rules" / "registry.generated.json"
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


def _status_badge(status: str) -> str:
    s = status or "missing"
    cls = {
        "current": "forge-badge forge-badge-success",
        "stale": "forge-badge forge-badge-warning",
        "missing": "forge-badge forge-badge-danger",
    }.get(s, "forge-badge")
    return f'<span class="{cls}">{e(s)}</span>'


def _area_chip(registry: dict, rule_id: str) -> str:
    row = registry_row_for_rule(registry, rule_id)
    area = (row or {}).get("area") or ""
    if not area:
        return ""
    label = area.replace("_", " ")
    return f' <span class="forge-support small ms-1">({e(label)})</span>'


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
        "<code>ux-audit-rules/</code> — click the rule id or <strong>Open page</strong> for "
        "purpose, how it is fixed, Before/After, and remediation.</p>"
    )
    lines = [
        intro,
        '<div class="table-responsive ux-rule-catalog-table-wrap">',
        '<table class="table forge-table ux-rule-catalog-table">',
        "<thead><tr>",
        "<th>Rule</th>",
        "<th>What it checks</th>",
        "<th>Examples</th>",
        "<th>Open page</th>",
        "</tr></thead><tbody>",
    ]
    for r in rows:
        rid = r.get("id") or ""
        slug = kebab_from_rule_id(rid)
        page_href = f"ux-audit-rules/{slug}.html"
        examples_href = f"{_GALLERY}#ex-{slug}"
        summary = catalog_rule_summary(rid, manifest_row=r, registry=registry)
        lines.append(
            "<tr>"
            f'<td class="ux-rule-catalog-rule">'
            f'<a href="{e(page_href)}" class="text-cyan" style="text-decoration:none">'
            f"<code>{e(rid)}</code></a>"
            f"{_area_chip(registry, rid)}"
            f' <span class="ms-1">{_status_badge(r.get("status") or "missing")}</span>'
            f"</td>"
            f'<td class="ux-rule-catalog-summary">{e(summary)}</td>'
            f'<td><a href="{e(examples_href)}">Before/After</a></td>'
            f'<td><a class="btn btn-sm btn-forge-outline" href="{e(page_href)}">Open page</a></td>'
            "</tr>"
        )
    lines.append("</tbody></table></div>")
    return "\n".join(lines)


def _rules_maintainer_table(rules: list[dict], *, lane: str) -> str:
    rows = sorted(
        [r for r in rules if r.get("lane") == lane],
        key=lambda r: r.get("id") or "",
    )
    if not rows:
        return ""
    lines = [
        '<table class="table table-sm forge-table mb-0">',
        "<thead><tr>",
        "<th>Rule</th><th>Registry</th><th>Page</th>"
        "<th>page_version</th><th>generated_at</th>",
        "</tr></thead><tbody>",
    ]
    for r in rows:
        rid = r.get("id") or ""
        lines.append(
            "<tr>"
            f"<td><code>{e(rid)}</code></td>"
            f"<td>{e(r.get('registryStatus') or '—')}</td>"
            f"<td>{_status_badge(r.get('status') or 'missing')}</td>"
            f"<td><code class='small'>{e((r.get('pageVersion') or r.get('contentVersion') or '—')[:16])}…</code></td>"
            f"<td class='small'>{e(r.get('generatedAt') or '—')}</td>"
            "</tr>"
        )
    lines.append("</tbody></table>")
    return "\n".join(lines)


def _lane_section(rules: list[dict], *, lane: str, section_id: str, title: str, registry: dict) -> str:
    reader = _rules_reader_table(rules, lane=lane, registry=registry)
    maint = _rules_maintainer_table(rules, lane=lane)
    maint_block = ""
    if maint:
        maint_block = f"""
<details class="ux-rule-catalog-maintainer mt-3">
  <summary class="forge-support">Maintainer metadata (versions, fingerprints)</summary>
  <div class="mt-2">{maint}</div>
</details>"""
    return f"""
<section class="ks-section" id="{e(section_id)}">
  <h2 class="ks-section-title">{e(title)}</h2>
  {reader}
  {maint_block}
</section>"""


PAGE = {
    "slug": "ux-audit-rules",
    "title": "UX audit rules",
    "intro": "Versioned handbook for deterministic (DET) and AI audit rules used by the website UX auditor.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 10,
    "toc": [
        ("uar-ecosystem", "Auditor & fixing"),
        ("uar-lifecycle", "Lifecycle"),
        ("uar-refresh", "Refresh handbook"),
        ("uar-summary", "Coverage summary"),
        ("uar-det", "Deterministic rules"),
        ("uar-ai", "AI rules"),
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
    .ux-rule-catalog-maintainer summary { cursor: pointer; font-weight: 600; }
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
                "registryStatus": r.get("status"),
                "status": "missing",
            }
            for r in registry.get("deterministicRules") or []
        ]
        ai = [
            {
                "id": r["id"],
                "lane": "ai",
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
<section class="ks-section" id="uar-ecosystem">
  <h2 class="ks-section-title">Auditor &amp; fixing ecosystem</h2>
  <p>Every rule in the registry has its own handbook page at
  <code>ux-audit-rules/&lt;rule-id-kebab&gt;.html</code>
  (example: <a href="ux-audit-rules/det-nav-dedup.html">DET.NAV.DEDUP</a>).
  For ruleset harnesses and fixers, see
  <a href="ux-audit-ecosystem.html">Auditor &amp; fixing ecosystem</a>.
  Optional <a href="{e(gallery)}">Before/After gallery</a> scrolls all rule fixtures on one page.
  For WCAG/axe and <code>DET.A11Y.*</code> campaigns, see the sibling
  <a href="a11y-audit-rules.html">Accessibility audit rules</a> catalog and
  <a href="a11y-audit-ecosystem-examples.html">a11y Before/After gallery</a>.</p>
</section>

<section class="ks-section" id="uar-lifecycle">
  <h2 class="ks-section-title">Lifecycle</h2>
  <p>Canonical rule definitions live under <code>docs/design/ux-audit/</code>. The blender emits
  <code>registry.generated.json</code>. Handbook detail pages are agent-written Markdown siblings in
  <code>docs/design/ux-audit/rule-pages/</code> and compile to HTML under
  <code>showcase/ux-audit-rules/</code> (one HTML file per rule).</p>
  <ol>
    <li><strong>Blend</strong> — refresh registry from design docs and implementations.</li>
    <li><strong>pagegen</strong> — one Cursor agent per stale/missing rule writes the <code>.md</code> sibling.</li>
    <li><strong>build-showcase</strong> — compiles overview + detail HTML (no agents at build time).</li>
  </ol>
</section>

<section class="ks-section" id="uar-refresh">
  <h2 class="ks-section-title">Refresh handbook</h2>
  <pre class="forge-code"><code>cd tools/website-ux-auditor
npm run blend-rules
npm run pagegen -- --lane both --max-rules 10
npm run pagegen:manifest

cd ../..
python3 generator/build-showcase.py</code></pre>
  <p class="forge-support">Use <code>npm run pagegen -- --dry-run</code> between batches until no targets remain.
  Bump an implementation file to change <code>contentVersion</code>; stale pages appear in the table below.</p>
</section>

<section class="ks-section" id="uar-summary">
  <h2 class="ks-section-title">Coverage summary</h2>
  <dl class="ag-spec">
    <dt>Registry fingerprint</dt><dd><code>{e(reg_fp)}</code></dd>
    <dt>Total rules</dt><dd>{summary.get('total', len(rules))}</dd>
    <dt>Deterministic</dt><dd>{summary.get('deterministic', '—')}</dd>
    <dt>AI</dt><dd>{summary.get('ai', '—')}</dd>
    <dt>Handbook current</dt><dd>{summary.get('current', 0)}</dd>
    <dt>Stale</dt><dd>{summary.get('stale', 0)}</dd>
    <dt>Missing</dt><dd>{summary.get('missing', 0)}</dd>
  </dl>
</section>

{_lane_section(rules, lane='deterministic', section_id='uar-det', title='Deterministic rules (DET)', registry=registry)}

{_lane_section(rules, lane='ai', section_id='uar-ai', title='AI rules', registry=registry)}
"""
