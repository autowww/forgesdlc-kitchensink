"""UX audit rules handbook overview — links to per-rule showcase pages."""

from __future__ import annotations

import json
from pathlib import Path

from components import e

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MANIFEST_PATH = REPO_ROOT / "docs" / "design" / "ux-audit" / "rule-pages" / "rule-pages.manifest.json"
REGISTRY_PATH = (
    REPO_ROOT / "tools" / "website-ux-auditor" / "design-rules" / "registry.generated.json"
)


def _kebab(rule_id: str) -> str:
    return rule_id.lower().replace(".", "-").replace("_", "-")


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


def _rules_table(rules: list[dict], *, lane: str) -> str:
    rows = [r for r in rules if r.get("lane") == lane]
    if not rows:
        return "<p class='forge-support'>No rules in manifest for this lane.</p>"
    lines = [
        '<div class="table-responsive">',
        '<table class="table forge-table">',
        "<thead><tr>",
        "<th>Rule</th><th>Registry</th><th>Page</th><th>page_version</th><th>generated_at</th><th>Detail</th>",
        "</tr></thead><tbody>",
    ]
    for r in rows:
        rid = r.get("id") or ""
        slug = _kebab(rid)
        detail = f'ux-audit-rules/{slug}.html'
        lines.append(
            "<tr>"
            f"<td><code>{e(rid)}</code></td>"
            f"<td>{e(r.get('registryStatus') or '—')}</td>"
            f"<td>{_status_badge(r.get('status') or 'missing')}</td>"
            f"<td><code class='small'>{e((r.get('pageVersion') or r.get('contentVersion') or '—')[:16])}…</code></td>"
            f"<td class='small'>{e(r.get('generatedAt') or '—')}</td>"
            f'<td><a href="{e(detail)}">{e(slug)}</a></td>'
            "</tr>"
        )
    lines.append("</tbody></table></div>")
    return "\n".join(lines)


PAGE = {
    "slug": "ux-audit-rules",
    "title": "UX audit rules",
    "intro": "Versioned handbook for deterministic (DET) and AI audit rules used by the website UX auditor.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 10,
    "toc": [
        ("uar-lifecycle", "Lifecycle"),
        ("uar-refresh", "Refresh handbook"),
        ("uar-summary", "Coverage summary"),
        ("uar-det", "Deterministic rules"),
        ("uar-ai", "AI rules"),
    ],
}


def render() -> str:
    manifest = _load_manifest()
    registry = _load_registry()
    summary = manifest.get("summary") or {}
    rules = manifest.get("rules") or []
    reg_fp = manifest.get("registryFingerprint") or registry.get("fingerprint") or "—"

    if not rules and registry:
        det = [{"id": r["id"], "lane": "deterministic", "registryStatus": r.get("status"), "status": "missing"} for r in registry.get("deterministicRules") or []]
        ai = [{"id": r["id"], "lane": "ai", "registryStatus": r.get("status"), "status": "missing"} for r in registry.get("aiRules") or []]
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
<section class="ks-section" id="uar-lifecycle">
  <h2 class="ks-section-title">Lifecycle</h2>
  <p>Canonical rule definitions live under <code>docs/design/ux-audit/</code>. The blender emits
  <code>registry.generated.json</code>. Handbook detail pages are agent-written Markdown siblings in
  <code>docs/design/ux-audit/rule-pages/</code> and compile to HTML under
  <code>showcase/ux-audit-rules/</code>.</p>
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

<section class="ks-section" id="uar-det">
  <h2 class="ks-section-title">Deterministic rules (DET)</h2>
  {_rules_table(rules, lane='deterministic')}
</section>

<section class="ks-section" id="uar-ai">
  <h2 class="ks-section-title">AI rules</h2>
  {_rules_table(rules, lane='ai')}
</section>
"""
