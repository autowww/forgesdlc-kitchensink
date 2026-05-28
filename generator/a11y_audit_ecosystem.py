"""Compile accessibility auditor ecosystem chapter + example gallery for showcase."""

from __future__ import annotations

import json
from pathlib import Path

from components import e
from forge_autodoc.markdown_conv import markdown_to_handbook_html
from ks_catalog_hashes import page_main_attrs
from layouts import showcase_page

from a11y_audit_rule_pages import (
    RULE_PAGES_DIR,
    examples_gallery_href,
    extract_after_example_html,
    extract_before_example_html,
    kebab_from_rule_id,
    load_manifest,
    load_registry,
    parse_front_matter,
    registry_row_for_rule,
    render_example_block,
    split_sections,
)

REPO_ROOT = Path(__file__).resolve().parent.parent
ECOSYSTEM_MD = REPO_ROOT / "docs/design/a11y-audit/auditor-ecosystem.md"
STANDARDS_DIR = REPO_ROOT / "docs/design/a11y-audit/standards"
RTM_PROFILE_IDS = (
    "wcag20a",
    "wcag20aa",
    "wcag20aaa",
    "wcag21a",
    "wcag21aa",
    "wcag21aaa",
    "wcag22a",
    "wcag22aa",
    "wcag22aaa",
    "wcag30bronze",
    "wcag30silver",
    "wcag30gold",
)


def _anchor_slug(title: str) -> str:
    import re

    return re.sub(r"[^a-z0-9-]+", "-", title.lower()).strip("-")


def _footer() -> str:
    return (
        '<hr class="forge-divider">'
        '<footer class="text-center pb-4">'
        '<p class="forge-support">Accessibility audit · forgesdlc-kitchensink</p>'
        "</footer>"
    )


def _standards_rtm_showcase_block() -> str:
    rows = []
    for pid in RTM_PROFILE_IDS:
        md_path = STANDARDS_DIR / f"{pid}.md"
        if md_path.is_file():
            rows.append(
                f"<tr><td><code>{e(pid)}</code></td>"
                f'<td><a href="../docs/design/a11y-audit/standards/{e(pid)}.md">'
                f"Handbook (source)</a></td></tr>"
            )
    if not rows:
        return ""
    return (
        '<div class="forge-callout forge-callout-surface mt-3">'
        "<p><strong>Standards packs (RTM)</strong> — per-profile traceability in the design handbook "
        '(not copied into showcase HTML; open from repo or handbook build):</p>'
        '<div class="forge-table-wrap"><table class="table table-sm mb-2">'
        '<thead><tr><th scope="col">Pack</th><th scope="col">Handbook</th></tr></thead>'
        f"<tbody>{''.join(rows)}</tbody></table></div>"
        '<p class="forge-support mb-0">Also: '
        "<code>standards-traceability-matrix.md</code>, "
        "<code>standards/README.md</code>, "
        "<code>axe-unmappable-rules.md</code>.</p>"
        "</div>"
    )


def compile_ecosystem_markdown(md_path: Path) -> str:
    if not md_path.is_file():
        return "<p class='forge-support'>Missing auditor-ecosystem.md</p>"
    raw = md_path.read_text(encoding="utf-8")
    _, body = parse_front_matter(raw)
    parts: list[str] = []
    for title, content in split_sections(body):
        low = title.lower()
        if "standards traceability matrix" in low:
            html = markdown_to_handbook_html(content) if content.strip() else ""
            parts.append(
                f'<section class="ks-section" id="{e(_anchor_slug(title))}">'
                f'<h2 class="ks-section-title">{e(title)}</h2>'
                f"{html}"
                f"{_standards_rtm_showcase_block()}"
                "</section>"
            )
            continue
        if "full example gallery" in low:
            parts.append(
                '<section class="ks-section" id="afe-gallery">'
                '<h2 class="ks-section-title">Full example gallery</h2>'
                "<p>Before/After HTML for <strong>every</strong> rule is compiled "
                f'into <a href="{e(examples_gallery_href())}">Before/After gallery</a> '
                "from <code>docs/design/a11y-audit/rule-pages/*.md</code>.</p>"
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


def _scope_meta_row(rule_id: str, registry: dict) -> str:
    row = registry_row_for_rule(registry, rule_id) or {}
    scope = row.get("scope") or "—"
    standards = ", ".join(row.get("standards") or []) or "—"
    return (
        f"<dt>Scope</dt><dd><code>{e(scope)}</code> · standards: <code>{e(standards)}</code></dd>"
    )


def render_rule_gallery_section(
    rule_id: str,
    *,
    manifest_row: dict | None,
    registry: dict,
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
    detail_href = f"a11y-audit-rules/{slug}.html"
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

    page_status = (manifest_row or {}).get("status") or "—"

    return f"""
<section class="ks-section ux-ecosystem-rule" id="{e(anchor)}">
  <h2 class="ks-section-title"><code>{e(rule_id)}</code> — {e(title)}</h2>
  <div class="forge-callout forge-callout-surface mb-3">
    <dl class="ag-spec mb-0">
      <dt>Lane</dt><dd><code>{e(lane)}</code> · page <span class="forge-badge">{e(page_status)}</span></dd>
      {_scope_meta_row(rule_id, registry)}
      <dt>Full handbook</dt><dd><a class="btn btn-sm btn-forge-outline" href="{e(detail_href)}">Open handbook</a>
      <span class="forge-support"> — purpose, scope, Before/After, remediation</span></dd>
    </dl>
  </div>
  {"".join(examples)}
</section>
"""


def build_examples_body_html() -> str:
    manifest = load_manifest()
    registry = load_registry()
    rules = manifest.get("rules") or []
    if not rules:
        det = [{"id": r["id"], "lane": "deterministic"} for r in registry.get("deterministicRules") or [] if r.get("id")]
        ai = [{"id": r["id"], "lane": "ai"} for r in registry.get("aiRules") or [] if r.get("id")]
        rules = det + ai

    det_rules = sorted([r for r in rules if r.get("lane") == "deterministic"], key=lambda r: r.get("id") or "")
    ai_rules = sorted([r for r in rules if r.get("lane") == "ai"], key=lambda r: r.get("id") or "")
    manifest_by_id = {r["id"]: r for r in rules if r.get("id")}

    intro = """
<section class="ks-section" id="ex-intro">
  <div class="forge-callout forge-callout-surface mb-4">
    <p class="mb-2"><strong>Before/After gallery only.</strong> For purpose, scope, WCAG/axe context,
    and remediation — open the
    <a href="a11y-audit-rules.html">rule catalog</a> and use <em>Open page</em>
    (example: <a href="a11y-audit-rules/det-a11y-generic-lang.html">DET.A11Y.GENERIC.LANG</a>).</p>
    <p class="forge-support mb-0">Scroll for rendered examples, or jump via the index below.</p>
  </div>
  <p class="mb-0"><a href="a11y-audit-ecosystem.html">&larr; Accessibility auditor ecosystem</a></p>
</section>
"""

    def _rule_index_table(rules_list: list[dict], *, label: str) -> str:
        rows = []
        for r in rules_list:
            rid = r.get("id") or ""
            if not rid:
                continue
            slug = kebab_from_rule_id(rid)
            rows.append(
                "<tr>"
                f'<td><code>{e(rid)}</code></td>'
                f'<td><a href="#ex-{e(slug)}">Examples</a> · '
                f'<a href="a11y-audit-rules/{e(slug)}.html">Handbook</a></td>'
                "</tr>"
            )
        if not rows:
            return ""
        return (
            f'<details class="ux-audit-examples-index mb-4" id="ex-index-{e(label.lower())}">'
            f'<summary class="forge-support mb-2">{e(label)} ({len(rows)}) — jump to rule</summary>'
            '<div class="forge-table-wrap mt-2"><table class="table table-sm mb-0">'
            '<thead><tr><th scope="col">Rule</th><th scope="col">Links</th></tr></thead>'
            f"<tbody>{''.join(rows)}</tbody></table></div></details>"
        )

    sections = [intro, _rule_index_table(det_rules, label="DET.A11Y rules")]
    for r in det_rules:
        rid = r.get("id") or ""
        if rid:
            sections.append(
                render_rule_gallery_section(rid, manifest_row=manifest_by_id.get(rid), registry=registry)
            )
    if ai_rules:
        sections.append(
            '<section class="ks-section" id="ex-ai-heading">'
            '<h2 class="ks-section-title">AI rules</h2></section>'
        )
        sections.append(_rule_index_table(ai_rules, label="AI.A11Y rules"))
    for r in ai_rules:
        rid = r.get("id") or ""
        if rid:
            sections.append(
                render_rule_gallery_section(rid, manifest_row=manifest_by_id.get(rid), registry=registry)
            )
    return "\n".join(sections)


def _ecosystem_sidebar(*, active: str) -> str:
    ecosystem_cls = " active" if active == "ecosystem" else ""
    examples_cls = " active" if active == "examples" else ""
    rules_cls = " active" if active == "rules" else ""
    return (
        '<p class="nav-section-label">Accessibility audit</p>'
        '<div class="nav-rail">'
        f'<a class="nav-link{ecosystem_cls}" href="a11y-audit-ecosystem.html">Auditor ecosystem</a>'
        f'<a class="nav-link{rules_cls}" href="a11y-audit-rules.html">Rule catalog</a>'
        f'<a class="nav-link{examples_cls}" href="{e(examples_gallery_href())}">Before/After gallery</a>'
        '<a class="nav-link" href="ux-audit-ecosystem.html">UX audit (related)</a>'
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
        "Accessibility auditor ecosystem</li>"
        "</ol></nav>"
    )
    return showcase_page(
        browser_title="Accessibility auditor ecosystem — Forge Design System",
        brand_name="Kitchen Sink",
        brand_subtitle="Accessibility audit",
        page_title="Accessibility auditor ecosystem",
        breadcrumb_html=breadcrumb,
        sidebar_html=_ecosystem_sidebar(active="ecosystem"),
        body_html=body,
        toc_html="",
        footer_html=_footer(),
        theme_css_href="assets/forge-theme.css",
        theme_js_href="assets/forge-theme.js",
        extra_js=["assets/showcase.js"],
        ks_page_attrs=page_main_attrs("a11y-audit-ecosystem"),
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
        '<a href="a11y-audit-ecosystem.html" class="text-cyan" style="text-decoration:none">'
        "Accessibility auditor</a>"
        "</li>"
        f'<li class="breadcrumb-item active text-dim" aria-current="page">'
        f"All rule examples ({e(str(total))})</li>"
        "</ol></nav>"
    )
    examples_css = """
    .ux-audit-examples-index summary { cursor: pointer; font-weight: 600; }
    .ux-rule-example [data-ks-embed-main] { display: block; max-width: 100%; }
    """
    return showcase_page(
        browser_title="Accessibility audit — all rule examples — Forge Design System",
        brand_name="Kitchen Sink",
        brand_subtitle="Accessibility audit examples",
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
        ks_page_attrs=page_main_attrs("a11y-audit-ecosystem-examples"),
    )


def write_a11y_audit_ecosystem_pages(output_dir: Path) -> int:
    (output_dir / "a11y-audit-ecosystem.html").write_text(
        render_ecosystem_chapter_html(), encoding="utf-8"
    )
    (output_dir / "a11y-audit-ecosystem-examples.html").write_text(
        render_examples_gallery_html(), encoding="utf-8"
    )
    return 2
