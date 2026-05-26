"""Compile auditor/fixing ecosystem chapter + all-rule example gallery for showcase."""

from __future__ import annotations

import json
from pathlib import Path

from components import e
from forge_autodoc.markdown_conv import markdown_to_handbook_html
from ks_catalog_hashes import page_main_attrs
from layouts import showcase_page

from ux_audit_rule_pages import (
    RULE_PAGES_DIR,
    MANIFEST_PATH,
    REGISTRY_PATH,
    examples_gallery_href,
    extract_after_example_html,
    extract_before_example_html,
    kebab_from_rule_id,
    load_manifest,
    load_registry,
    parse_front_matter,
    render_example_block,
    split_sections,
    _anchor_slug,
    _footer,
)

REPO_ROOT = Path(__file__).resolve().parent.parent
ECOSYSTEM_MD = REPO_ROOT / "docs" / "design" / "ux-audit" / "auditor-fixing-ecosystem.md"
PILOT_REGISTRY_PATH = (
    REPO_ROOT
    / "tools"
    / "website-ux-auditor"
    / "lib"
    / "ux-deterministic-fixers"
    / "pilot-registry.json"
)


def load_pilot_registry() -> dict[str, dict]:
    if not PILOT_REGISTRY_PATH.is_file():
        return {}
    data = json.loads(PILOT_REGISTRY_PATH.read_text(encoding="utf-8"))
    return {r["ruleId"]: r for r in data.get("rules") or [] if r.get("ruleId")}


def compile_ecosystem_markdown(md_path: Path) -> str:
    """Render auditor-fixing-ecosystem.md body (skip gallery section — generated separately)."""
    if not md_path.is_file():
        return "<p class='forge-support'>Missing auditor-fixing-ecosystem.md</p>"
    raw = md_path.read_text(encoding="utf-8")
    _, body = parse_front_matter(raw)
    parts: list[str] = []
    for title, content in split_sections(body):
        low = title.lower()
        if "full example gallery" in low:
            parts.append(
                '<section class="ks-section" id="afe-gallery">'
                '<h2 class="ks-section-title">Full example gallery</h2>'
                "<p>Before/After HTML for <strong>every</strong> rule in the manifest is compiled "
                f'into <a href="{e(examples_gallery_href())}">Before/After gallery</a> '
                "from the same <code>rule-pages/*.md</code> siblings used by fixtures and fixers.</p>"
                "</section>"
            )
            continue
        if "before example" in low or "after example" in low:
            continue
        html = markdown_to_handbook_html(content) if content.strip() else ""
        if not html:
            continue
        parts.append(
            f'<section class="ks-section" id="{e(_anchor_slug(title))}">'
            f'<h2 class="ks-section-title">{e(title)}</h2>'
            f"{html}"
            "</section>"
        )
    return "\n".join(parts)


def _fixer_meta_row(rule_id: str, lane: str, pilot: dict[str, dict]) -> str:
    if lane == "ai":
        return (
            "<dt>Fixer</dt><dd><em>AI lane</em> — Cursor agent "
            "(<code>invoke-ai-ruleset-harness.sh</code> / remediation plans)</dd>"
        )
    row = pilot.get(rule_id)
    if not row:
        return "<dt>Fixer</dt><dd>Not in pilot registry (stub or not yet wired)</dd>"
    modes = ", ".join(row.get("harnessModes") or [])
    return (
        f"<dt>Fixer</dt><dd><code>{e(row.get('fixerId') or '—')}</code> · "
        f"verify <code>{e(row.get('verifyMode') or '—')}</code>"
        f"{f' · harness <code>{e(modes)}</code>' if modes else ''}</dd>"
    )


def render_rule_gallery_section(
    rule_id: str,
    *,
    manifest_row: dict | None,
    pilot: dict[str, dict],
) -> str:
    slug = kebab_from_rule_id(rule_id)
    md_path = RULE_PAGES_DIR / f"{slug}.md"
    lane = (manifest_row or {}).get("lane") or "—"
    title = rule_id
    front: dict[str, str] = {}
    before_html = ""
    after_html = ""

    if md_path.is_file():
        raw = md_path.read_text(encoding="utf-8")
        front, _ = parse_front_matter(raw)
        title = front.get("title") or rule_id
        before_html = extract_before_example_html(raw)
        after_html = extract_after_example_html(raw)

    anchor = f"ex-{slug}"
    detail_href = f"ux-audit-rules/{slug}.html"
    examples: list[str] = []
    if before_html:
        examples.append(render_example_block("Before (failing example)", before_html))
    else:
        examples.append(
            '<p class="forge-support">No <code>## Before example</code> fenced HTML in handbook.</p>'
        )
    if after_html:
        examples.append(render_example_block("After (passing example)", after_html))
    else:
        examples.append(
            '<p class="forge-support">No <code>## After example</code> fenced HTML in handbook.</p>'
        )

    meta_dl = _fixer_meta_row(rule_id, lane, pilot)
    page_status = (manifest_row or {}).get("status") or "—"

    return f"""
<section class="ks-section ux-ecosystem-rule" id="{e(anchor)}">
  <h2 class="ks-section-title"><code>{e(rule_id)}</code> — {e(title)}</h2>
  <div class="forge-callout forge-callout-surface mb-3">
    <dl class="ag-spec mb-0">
      <dt>Lane</dt><dd><code>{e(lane)}</code> · page <span class="forge-badge">{e(page_status)}</span></dd>
      {meta_dl}
      <dt>Full handbook</dt><dd><a class="btn btn-sm btn-forge-outline" href="{e(detail_href)}">Open handbook</a>
      <span class="forge-support"> — purpose, fixer, remediation, examples</span></dd>
    </dl>
  </div>
  {"".join(examples)}
</section>
"""


def build_examples_body_html() -> str:
    manifest = load_manifest()
    pilot = load_pilot_registry()
    rules = manifest.get("rules") or []
    if not rules:
        registry = load_registry()
        det = [{"id": r["id"], "lane": "deterministic"} for r in registry.get("deterministicRules") or [] if r.get("id")]
        ai = [{"id": r["id"], "lane": "ai"} for r in registry.get("aiRules") or [] if r.get("id")]
        rules = det + ai

    det_rules = sorted([r for r in rules if r.get("lane") == "deterministic"], key=lambda r: r.get("id") or "")
    ai_rules = sorted([r for r in rules if r.get("lane") == "ai"], key=lambda r: r.get("id") or "")
    manifest_by_id = {r["id"]: r for r in rules if r.get("id")}

    intro = """
<section class="ks-section" id="ex-intro">
  <div class="forge-callout forge-callout-surface mb-4">
    <p class="mb-2"><strong>Before/After gallery only.</strong> For purpose, passing/failing signals,
    <strong>how the rule is fixed</strong>, evidence, and remediation — open the
    <a href="ux-audit-rules.html">rule catalog</a> and use <em>Open page</em>
    (example: <a href="ux-audit-rules/det-nav-dedup.html">DET.NAV.DEDUP</a>).</p>
    <p class="forge-support mb-0">Scroll for rendered examples, or jump via the index below.</p>
  </div>
  <p class="mb-0"><a href="ux-audit-ecosystem.html">&larr; Auditor &amp; fixing ecosystem</a></p>
</section>
"""

    def _rule_index_table(rules: list[dict], *, label: str) -> str:
        rows = []
        for r in rules:
            rid = r.get("id") or ""
            if not rid:
                continue
            slug = kebab_from_rule_id(rid)
            rows.append(
                "<tr>"
                f'<td><code>{e(rid)}</code></td>'
                f'<td><a href="#ex-{e(slug)}">Examples</a> · '
                f'<a href="ux-audit-rules/{e(slug)}.html">Handbook</a></td>'
                "</tr>"
            )
        if not rows:
            return ""
        return (
            f'<details class="ux-audit-examples-index mb-4" id="ex-index-{e(label.lower())}">'
            f'<summary class="forge-support mb-2">{e(label)} ({len(rows)}) — jump to rule</summary>'
            '<div class="forge-table-wrap mt-2"><table class="table table-sm mb-0">'
            "<thead><tr><th scope=\"col\">Rule</th><th scope=\"col\">Links</th></tr></thead>"
            f"<tbody>{''.join(rows)}</tbody></table></div></details>"
        )

    det_nav = _rule_index_table(det_rules, label="DET rules")
    ai_nav = _rule_index_table(ai_rules, label="AI rules")

    sections = [intro, det_nav]
    for r in det_rules:
        rid = r.get("id") or ""
        if not rid:
            continue
        sections.append(
            render_rule_gallery_section(rid, manifest_row=manifest_by_id.get(rid), pilot=pilot)
        )
    if ai_rules:
        sections.append(
            '<section class="ks-section" id="ex-ai-heading">'
            '<h2 class="ks-section-title">AI rules</h2></section>'
        )
        sections.append(ai_nav)
    for r in ai_rules:
        rid = r.get("id") or ""
        if not rid:
            continue
        sections.append(
            render_rule_gallery_section(rid, manifest_row=manifest_by_id.get(rid), pilot=pilot)
        )
    return "\n".join(sections)


def _ecosystem_sidebar(*, active: str) -> str:
  ecosystem_cls = " active" if active == "ecosystem" else ""
  examples_cls = " active" if active == "examples" else ""
  rules_cls = " active" if active == "rules" else ""
  return (
      '<p class="nav-section-label">UX audit</p>'
      '<div class="nav-rail">'
      f'<a class="nav-link{ecosystem_cls}" href="ux-audit-ecosystem.html">Auditor &amp; fixing</a>'
      f'<a class="nav-link{rules_cls}" href="ux-audit-rules.html">Rule catalog</a>'
      f'<a class="nav-link{examples_cls}" href="{e(examples_gallery_href())}">Before/After gallery</a>'
      '<a class="nav-link" href="for-agents.html">Design system (agents)</a>'
      "</div>"
  )


def render_ecosystem_chapter_html() -> str:
    body = compile_ecosystem_markdown(ECOSYSTEM_MD)
    breadcrumb = (
        '<nav aria-label="breadcrumb">'
        '<ol class="breadcrumb mb-1" style="font-size:0.75rem">'
        '<li class="breadcrumb-item">'
        '<a href="index.html" class="text-cyan" style="text-decoration:none">Home</a>'
        "</li>"
        '<li class="breadcrumb-item active text-dim" aria-current="page">'
        "Auditor &amp; fixing ecosystem</li>"
        "</ol></nav>"
    )
    return showcase_page(
        browser_title="Auditor & fixing ecosystem — Forge Design System",
        brand_name="Kitchen Sink",
        brand_subtitle="UX audit",
        page_title="Auditor & fixing ecosystem",
        breadcrumb_html=breadcrumb,
        sidebar_html=_ecosystem_sidebar(active="ecosystem"),
        body_html=body,
        toc_html="",
        footer_html=_footer(),
        theme_css_href="assets/forge-theme.css",
        theme_js_href="assets/forge-theme.js",
        extra_js=["assets/showcase.js"],
        ks_page_attrs=page_main_attrs("ux-audit-ecosystem"),
    )


def render_examples_gallery_html() -> str:
    body = build_examples_body_html()
    manifest = load_manifest()
    summary = manifest.get("summary") or {}
    total = summary.get("total") or len(manifest.get("rules") or [])
    breadcrumb = (
        '<nav aria-label="breadcrumb">'
        '<ol class="breadcrumb mb-1" style="font-size:0.75rem">'
        '<li class="breadcrumb-item">'
        '<a href="index.html" class="text-cyan" style="text-decoration:none">Home</a>'
        "</li>"
        '<li class="breadcrumb-item">'
        '<a href="ux-audit-ecosystem.html" class="text-cyan" style="text-decoration:none">'
        "Auditor &amp; fixing</a>"
        "</li>"
        f'<li class="breadcrumb-item active text-dim" aria-current="page">'
        f"All rule examples ({e(str(total))})</li>"
        "</ol></nav>"
    )
    examples_css = """
    .ux-audit-examples-index summary { cursor: pointer; font-weight: 600; }
    .ux-rule-example [data-ks-embed-main] { display: block; max-width: 100%; }
    .ux-rule-example .diagram-modal-backdrop { position: relative; inset: auto; }
    """
    return showcase_page(
        browser_title="UX audit — all rule examples — Forge Design System",
        brand_name="Kitchen Sink",
        brand_subtitle="UX audit examples",
        page_title="All rule examples",
        breadcrumb_html=breadcrumb,
        sidebar_html=_ecosystem_sidebar(active="examples"),
        body_html=body,
        toc_html="",
        footer_html=_footer(),
        theme_css_href="assets/forge-theme.css",
        theme_js_href="assets/forge-theme.js",
        extra_css=examples_css,
        extra_js=["assets/showcase.js"],
        ks_page_attrs=page_main_attrs("ux-audit-ecosystem-examples"),
    )


def write_ux_audit_ecosystem_pages(output_dir: Path) -> int:
    """Write ux-audit-ecosystem.html and ux-audit-ecosystem-examples.html."""
    (output_dir / "ux-audit-ecosystem.html").write_text(
        render_ecosystem_chapter_html(), encoding="utf-8"
    )
    (output_dir / "ux-audit-ecosystem-examples.html").write_text(
        render_examples_gallery_html(), encoding="utf-8"
    )
    return 2
