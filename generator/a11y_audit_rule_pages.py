"""Compile accessibility audit rule handbook .md siblings into showcase HTML pages."""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = (
    REPO_ROOT / "tools" / "website-a11y-auditor" / "design-rules" / "registry.generated.json"
)
RULE_PAGES_DIR = REPO_ROOT / "docs/design/a11y-audit/rule-pages"
MANIFEST_PATH = RULE_PAGES_DIR / "rule-pages.manifest.json"
SHOWCASE_RULE_DIR = "a11y-audit-rules"

sys.path.insert(0, str(REPO_ROOT / "generator"))
sys.path.insert(0, str(REPO_ROOT / "components"))
sys.path.insert(0, str(REPO_ROOT / "forge-autodoc"))

from components import e  # noqa: E402
from layouts import showcase_page  # noqa: E402
from ks_catalog_hashes import page_main_attrs  # noqa: E402

# Reuse UX rule-page compilers (parsers, example embeds, markdown sections).
import ux_audit_rule_pages as _ux  # noqa: E402

kebab_from_rule_id = _ux.kebab_from_rule_id
parse_front_matter = _ux.parse_front_matter
split_sections = _ux.split_sections
extract_before_example_html = _ux.extract_before_example_html
extract_after_example_html = _ux.extract_after_example_html
render_example_block = _ux.render_example_block
compile_rule_body = _ux.compile_rule_body
build_toc_from_sections = _ux.build_toc_from_sections
_anchor_slug = _ux._anchor_slug
sanitize_embedded_example_html = _ux.sanitize_embedded_example_html


def showcase_a11y_audit_build_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d")


def examples_gallery_href() -> str:
    return f"a11y-audit-ecosystem-examples.html?v={showcase_a11y_audit_build_stamp()}"


def load_registry() -> dict:
    if not REGISTRY_PATH.is_file():
        return {}
    return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))


def load_manifest() -> dict:
    if not MANIFEST_PATH.is_file():
        return {}
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def registry_row_for_rule(registry: dict, rule_id: str) -> dict | None:
    for lane_key in ("deterministicRules", "aiRules"):
        for row in registry.get(lane_key) or []:
            if row.get("id") == rule_id:
                return row
    return None


def catalog_rule_summary(
    rule_id: str,
    *,
    manifest_row: dict | None = None,
    registry: dict | None = None,
) -> str:
    reg = registry if registry is not None else load_registry()
    reg_row = registry_row_for_rule(reg, rule_id)
    scope = (reg_row or {}).get("scope") or (manifest_row or {}).get("scope") or ""
    scope_note = f"{scope} scope · " if scope else ""
    slug = kebab_from_rule_id(rule_id)
    md_path = RULE_PAGES_DIR / f"{slug}.md"
    if md_path.is_file():
        raw = md_path.read_text(encoding="utf-8")
        front, _ = parse_front_matter(raw)
        summary = (front.get("summary") or "").strip()
        if summary:
            return _ux._truncate_summary(f"{scope_note}{summary}")
    area = (reg_row or {}).get("area") or "accessibility"
    return _ux._truncate_summary(f"{scope_note}{area}")


def meta_banner(front: dict[str, str], manifest_row: dict | None) -> str:
    page_version = front.get("page_version") or (manifest_row or {}).get("contentVersion") or "—"
    generated_at = front.get("generated_at") or (manifest_row or {}).get("generatedAt") or "—"
    lane = front.get("lane") or (manifest_row or {}).get("lane") or "—"
    scope = front.get("scope") or (manifest_row or {}).get("scope") or "—"
    rule_id = front.get("rule_id") or (manifest_row or {}).get("id") or "—"
    reg_fp = front.get("registry_fingerprint") or (manifest_row or {}).get("registryFingerprint") or "—"
    page_status = (manifest_row or {}).get("status") or "—"
    return f"""\
<!-- a11y-rule-handbook page_version={e(page_version)} generated_at={e(generated_at)} -->
<div class="forge-callout forge-callout-surface mb-4">
  <p class="callout-label">Accessibility rule handbook metadata</p>
  <dl class="ag-spec mb-0">
    <dt>Rule</dt><dd><code>{e(rule_id)}</code> · lane <code>{e(lane)}</code> · scope <code>{e(scope)}</code></dd>
    <dt>Page status</dt><dd>{e(page_status)}</dd>
    <dt>page_version</dt><dd><code>{e(page_version)}</code></dd>
    <dt>generated_at</dt><dd>{e(generated_at)}</dd>
    <dt>registry_fingerprint</dt><dd><code>{e(reg_fp)}</code></dd>
  </dl>
</div>"""


def render_wcag_criteria_section(rule_id: str, registry: dict | None) -> str:
    row = registry_row_for_rule(registry or {}, rule_id) or {}
    criteria = row.get("wcagCriteria") or []
    if not criteria:
        return ""
    chips = ", ".join(f"<code>{e(c)}</code>" for c in criteria)
    return (
        '<section class="ks-section" id="wcag-criteria">'
        '<h2 class="ks-section-title">Related WCAG success criteria</h2>'
        f"<p class='forge-support mb-0'>Indicative mapping for compliance reporting — "
        f"not a conformance claim. Criteria: {chips}</p>"
        "</section>"
    )


def render_fixer_remediation_section(
    rule_id: str,
    front: dict[str, str],
    manifest_row: dict | None,
) -> str:
    lane = (front.get("lane") or (manifest_row or {}).get("lane") or "").lower()
    scope = front.get("scope") or (manifest_row or {}).get("scope") or "generic"
    lines: list[str] = []
    if lane == "ai":
        lines.append(
            "<p><strong>AI lane</strong> — enable with <code>--enable-ai</code>. "
            "Judgment runs via Cursor/agent using prompts under "
            "<code>design-rules/ai/prompts/generated/</code>.</p>"
        )
    else:
        slug_scope = "generic" if scope == "generic" else "ks"
        lines.append(
            f"<p><strong>Deterministic lane</strong> — scope <code>{e(scope)}</code>. "
            f"Detected by <code>det-a11y-{e(slug_scope)}-*.check.js</code> "
            "or the axe lane for WCAG-tagged violations.</p>"
        )
        lines.append(
            "<ul>"
            "<li><strong>Harness:</strong> "
            "<code>auditor-tests/invoke-a11y-ruleset-harness.sh</code> on the Before fixture.</li>"
            "<li><strong>Audit:</strong> "
            "<code>analyze-website-a11y.mjs --only-deterministic-rule-ids "
            f"{e(rule_id)}</code></li>"
            "</ul>"
        )
    lines.append(
        "<p class='forge-support mb-0'>Module: "
        f"<code>{e(front.get('source_rule') or 'design-rules/deterministic/generated')}</code>. "
        "See <strong>Before</strong> / <strong>After</strong> below.</p>"
    )
    return (
        '<section class="ks-section" id="how-this-rule-is-fixed">'
        '<h2 class="ks-section-title">How this rule is checked</h2>'
        f'{"".join(lines)}'
        "</section>"
    )


def placeholder_body(rule_id: str, registry: dict, manifest_row: dict | None) -> str:
    status = (manifest_row or {}).get("status") or "missing"
    return f"""\
<section class="ks-section">
  <h2 class="ks-section-title">Handbook page not generated</h2>
  <p class="forge-support">Status: <strong>{e(status)}</strong>. Run
  <code>python3 generator/bootstrap_a11y_rule_pages.py</code> then rebuild showcase.</p>
  <dl class="ag-spec">
    <dt>Rule</dt><dd><code>{e(rule_id)}</code></dd>
  </dl>
</section>"""


def _detail_sidebar_html() -> str:
    return (
        '<p class="nav-section-label">Accessibility audit</p>'
        '<div class="nav-rail">'
        '<a class="nav-link" href="../a11y-audit-ecosystem.html">Auditor ecosystem</a>'
        '<a class="nav-link" href="../a11y-audit-rules.html">Rule catalog</a>'
        f'<a class="nav-link" href="../{e(examples_gallery_href())}">Before/After gallery</a>'
        '<a class="nav-link" href="../ux-audit-rules.html">UX audit rules</a>'
        '<a class="nav-link" href="../for-agents.html">Design system (agents)</a>'
        "</div>"
    )


def _footer() -> str:
    return (
        '<hr class="forge-divider">'
        '<footer class="text-center pb-4">'
        '<p class="forge-support">Accessibility audit rule handbook · forgesdlc-kitchensink</p>'
        "</footer>"
    )


def render_rule_detail_html(
    rule_id: str,
    *,
    registry: dict | None = None,
    manifest: dict | None = None,
) -> str:
    registry = registry or load_registry()
    manifest = manifest or load_manifest()
    manifest_by_id = {r["id"]: r for r in manifest.get("rules") or [] if r.get("id")}
    manifest_row = manifest_by_id.get(rule_id)
    slug = kebab_from_rule_id(rule_id)
    md_path = RULE_PAGES_DIR / f"{slug}.md"
    title = rule_id
    front: dict[str, str] = {}
    body_html = ""

    if md_path.is_file():
        raw = md_path.read_text(encoding="utf-8")
        known_ids = _ux.handbook_rule_ids(registry=registry, manifest=manifest)
        front, body_html = compile_rule_body(
            raw,
            known_rule_ids=known_ids,
            registry=registry,
            manifest=manifest,
            rule_pages_dir=RULE_PAGES_DIR,
        )
        title = front.get("title") or rule_id
        wcag_toc = (
            '<a class="nav-link" href="#wcag-criteria">WCAG criteria</a>\n'
            if (registry_row_for_rule(registry, rule_id) or {}).get("wcagCriteria")
            else ""
        )
        toc = (
            wcag_toc
            + '<a class="nav-link" href="#how-this-rule-is-fixed">How this rule is checked</a>\n'
            + build_toc_from_sections(raw)
        )
    else:
        toc = '<a class="nav-link" href="#how-this-rule-is-fixed">How this rule is checked</a>\n'
        body_html = placeholder_body(rule_id, registry, manifest_row)

    full_body = (
        meta_banner(front, manifest_row)
        + render_wcag_criteria_section(rule_id, registry)
        + render_fixer_remediation_section(rule_id, front, manifest_row)
        + body_html
    )

    breadcrumb = (
        '<nav aria-label="breadcrumb">'
        '<ol class="breadcrumb mb-1" style="font-size:0.75rem">'
        '<li class="breadcrumb-item">'
        '<a href="../index.html" class="text-cyan" style="text-decoration:none">Home</a>'
        '</li>'
        '<li class="breadcrumb-item">'
        '<a href="../a11y-audit-rules.html" class="text-cyan" style="text-decoration:none">'
        "Accessibility audit rules</a>"
        '</li>'
        f'<li class="breadcrumb-item active text-dim" aria-current="page">{e(title)}</li>'
        '</ol></nav>'
    )

    return showcase_page(
        browser_title=f"{title} — Accessibility audit rules",
        brand_name="Kitchen Sink",
        brand_subtitle="Accessibility audit rules",
        page_title=title,
        breadcrumb_html=breadcrumb,
        sidebar_html=_detail_sidebar_html(),
        body_html=full_body,
        toc_html=toc,
        footer_html=_footer(),
        theme_css_href="../assets/forge-theme.css",
        theme_js_href="../assets/forge-theme.js",
        extra_js=["../assets/showcase.js"],
        ks_page_attrs=page_main_attrs(slug),
    )


def verify_a11y_audit_rule_pages(output_dir: Path) -> None:
    manifest = load_manifest()
    rules = manifest.get("rules") or []
    if not rules:
        registry = load_registry()
        det = [r.get("id") for r in registry.get("deterministicRules") or [] if r.get("id")]
        ai = [r.get("id") for r in registry.get("aiRules") or [] if r.get("id")]
        rules = [{"id": rid} for rid in sorted(det + ai)]

    out_dir = output_dir / SHOWCASE_RULE_DIR
    missing: list[str] = []
    expected_slugs: set[str] = set()
    for row in rules:
        rid = row.get("id")
        if not rid:
            continue
        slug = kebab_from_rule_id(rid)
        expected_slugs.add(slug)
        if not (out_dir / f"{slug}.html").is_file():
            missing.append(rid)

    if missing:
        raise SystemExit(
            "[showcase] Missing a11y-audit-rules handbook pages for: " + ", ".join(missing)
        )
    print(
        f"[showcase] Verified {len(expected_slugs)} a11y-audit-rules/*.html "
        f"(one page per rule)"
    )


def write_a11y_audit_rule_pages(output_dir: Path, all_pages: list[dict] | None = None) -> int:
    registry = load_registry()
    manifest = load_manifest()
    rules = manifest.get("rules") or []
    if not rules:
        det = [r.get("id") for r in registry.get("deterministicRules") or [] if r.get("id")]
        ai = [r.get("id") for r in registry.get("aiRules") or [] if r.get("id")]
        rules = [{"id": rid} for rid in sorted(det + ai)]

    out_dir = output_dir / SHOWCASE_RULE_DIR
    out_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for row in rules:
        rule_id = row.get("id")
        if not rule_id:
            continue
        slug = kebab_from_rule_id(rule_id)
        html = render_rule_detail_html(rule_id, registry=registry, manifest=manifest)
        (out_dir / f"{slug}.html").write_text(html, encoding="utf-8")
        count += 1
    return count
