"""Compile UX audit rule handbook .md siblings into showcase HTML pages."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = (
    REPO_ROOT / "tools" / "website-ux-auditor" / "design-rules" / "registry.generated.json"
)
RULE_PAGES_DIR = REPO_ROOT / "docs" / "design" / "ux-audit" / "rule-pages"
MANIFEST_PATH = RULE_PAGES_DIR / "rule-pages.manifest.json"
SHOWCASE_RULE_DIR = "ux-audit-rules"

sys.path.insert(0, str(REPO_ROOT / "components"))
sys.path.insert(0, str(REPO_ROOT / "forge-autodoc"))

from components import e  # noqa: E402
from forge_autodoc.markdown_conv import markdown_to_handbook_html  # noqa: E402
from layouts import showcase_page  # noqa: E402
from ks_catalog_hashes import page_main_attrs  # noqa: E402


def kebab_from_rule_id(rule_id: str) -> str:
    return (
        str(rule_id or "")
        .lower()
        .replace(".", "-")
        .replace("_", "-")
    )


def parse_front_matter(raw: str) -> tuple[dict[str, str], str]:
    text = raw or ""
    m = re.match(r"^---\r?\n([\s\S]*?)\r?\n---\r?\n?", text)
    if not m:
        return {}, text
    front: dict[str, str] = {}
    for line in m.group(1).splitlines():
        if ":" not in line:
            continue
        key, val = line.split(":", 1)
        front[key.strip()] = val.strip().strip("'\"")
    return front, text[m.end() :]


def split_sections(body: str) -> list[tuple[str, str]]:
    parts = re.split(r"(?m)^##\s+", body)
    sections: list[tuple[str, str]] = []
    if parts and not parts[0].strip():
        parts = parts[1:]
    elif parts and parts[0].strip() and not body.lstrip().startswith("##"):
        sections.append(("", parts[0].strip()))
        parts = parts[1:]
    for part in parts:
        if not part.strip():
            continue
        lines = part.split("\n", 1)
        title = lines[0].strip()
        content = lines[1] if len(lines) > 1 else ""
        sections.append((title, content.strip()))
    return sections


def extract_html_fence(section_body: str) -> tuple[str, str]:
    m = re.search(r"```html\s*\n([\s\S]*?)```", section_body, re.IGNORECASE)
    if not m:
        return section_body, ""
    html = m.group(1).strip()
    rest = (section_body[: m.start()] + section_body[m.end() :]).strip()
    return rest, html


def render_example_block(label: str, html: str) -> str:
    if not html:
        return ""
    return (
        f'<div class="forge-card p-3 mb-4 ks-section">'
        f'<p class="ks-section-title mb-2">{e(label)}</p>'
        '<div class="ux-rule-example border rounded p-3" '
        'style="border-color:var(--forge-border)!important">'
        f"{html}"
        "</div>"
        "</div>"
    )


def render_section(title: str, body: str) -> str:
    low = title.lower()
    if "before example" in low or "after example" in low:
        rest, html = extract_html_fence(body)
        label = "Before (failing example)" if "before" in low else "After (passing example)"
        blocks = [render_example_block(label, html)]
        if rest:
            blocks.append(
                f'<div class="mt-3">{markdown_to_handbook_html(rest)}</div>'
            )
        if not blocks:
            return ""
        return (
            f'<section class="ks-section" id="{e(_anchor_slug(title))}">'
            f'<h2 class="ks-section-title">{e(title)}</h2>'
            f'{"".join(blocks)}'
            f"</section>"
        )

    html = markdown_to_handbook_html(body) if body.strip() else ""
    if not html:
        return ""
    return (
        f'<section class="ks-section" id="{e(_anchor_slug(title))}">'
        f'<h2 class="ks-section-title">{e(title)}</h2>'
        f"{html}"
        f"</section>"
    )


def _anchor_slug(title: str) -> str:
    return re.sub(r"[^a-z0-9-]+", "-", title.lower()).strip("-")


def compile_rule_body(raw_md: str) -> tuple[dict[str, str], str]:
    front, body = parse_front_matter(raw_md)
    sections_html = []
    for title, content in split_sections(body):
        block = render_section(title, content)
        if block:
            sections_html.append(block)
    return front, "\n".join(sections_html)


def load_registry() -> dict:
    if not REGISTRY_PATH.is_file():
        return {}
    return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))


def load_manifest() -> dict:
    if not MANIFEST_PATH.is_file():
        return {}
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def rule_row_from_registry(registry: dict, rule_id: str) -> dict | None:
    for r in registry.get("deterministicRules") or []:
        if r.get("id") == rule_id:
            return r
    for r in registry.get("aiRules") or []:
        if r.get("id") == rule_id:
            return r
    return None


def placeholder_body(rule_id: str, registry: dict, manifest_row: dict | None) -> str:
    row = rule_row_from_registry(registry, rule_id) or {}
    status = (manifest_row or {}).get("status") or "missing"
    return f"""\
<section class="ks-section">
  <h2 class="ks-section-title">Handbook page not generated</h2>
  <p class="forge-support">Status: <strong>{e(status)}</strong>. Run pagegen from
  <code>tools/website-ux-auditor</code> to create the Markdown sibling, then rebuild the showcase.</p>
  <pre class="forge-code"><code>npm run pagegen -- --only-rule {e(rule_id)}</code></pre>
  <dl class="ag-spec">
    <dt>Registry status</dt><dd>{e(row.get("status") or "—")}</dd>
    <dt>Source</dt><dd><code>{e(row.get("sourceRule") or "—")}</code></dd>
  </dl>
</section>"""


def meta_banner(front: dict[str, str], manifest_row: dict | None) -> str:
    page_version = front.get("page_version") or (manifest_row or {}).get("contentVersion") or "—"
    generated_at = front.get("generated_at") or (manifest_row or {}).get("generatedAt") or "—"
    lane = front.get("lane") or (manifest_row or {}).get("lane") or "—"
    rule_id = front.get("rule_id") or (manifest_row or {}).get("id") or "—"
    reg_fp = front.get("registry_fingerprint") or (manifest_row or {}).get("registryFingerprint") or "—"
    page_status = (manifest_row or {}).get("status") or "—"
    return f"""\
<!-- ux-rule-handbook page_version={e(page_version)} generated_at={e(generated_at)} -->
<div class="forge-callout forge-callout-surface mb-4">
  <p class="callout-label">Rule handbook metadata</p>
  <dl class="ag-spec mb-0">
    <dt>Rule</dt><dd><code>{e(rule_id)}</code> · lane <code>{e(lane)}</code></dd>
    <dt>Page status</dt><dd>{e(page_status)}</dd>
    <dt>page_version</dt><dd><code>{e(page_version)}</code></dd>
    <dt>generated_at</dt><dd>{e(generated_at)}</dd>
    <dt>registry_fingerprint</dt><dd><code>{e(reg_fp)}</code></dd>
  </dl>
</div>"""


def build_toc_from_sections(raw_md: str) -> str:
    _, body = parse_front_matter(raw_md)
    links = []
    for title, _ in split_sections(body):
        if not title:
            continue
        links.append(f'<a class="nav-link" href="#{_anchor_slug(title)}">{e(title)}</a>')
    return "\n".join(links)


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
        front, body_html = compile_rule_body(raw)
        title = front.get("title") or rule_id
        toc = build_toc_from_sections(raw)
    else:
        toc = ""
        body_html = placeholder_body(rule_id, registry, manifest_row)

    meta = meta_banner(front, manifest_row)
    full_body = meta + body_html

    breadcrumb = (
        '<nav aria-label="breadcrumb">'
        '<ol class="breadcrumb mb-1" style="font-size:0.75rem">'
        '<li class="breadcrumb-item">'
        '<a href="../index.html" class="text-cyan" style="text-decoration:none">Home</a>'
        '</li>'
        '<li class="breadcrumb-item">'
        '<a href="../ux-audit-rules.html" class="text-cyan" style="text-decoration:none">UX audit rules</a>'
        '</li>'
        f'<li class="breadcrumb-item active text-dim" aria-current="page">{e(title)}</li>'
        '</ol></nav>'
    )

    return showcase_page(
        browser_title=f"{title} — UX audit rules",
        brand_name="Kitchen Sink",
        brand_subtitle="UX audit rules",
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


def _detail_sidebar_html() -> str:
    return (
        '<p class="nav-section-label">Handbook</p>'
        '<div class="nav-rail">'
        '<a class="nav-link" href="../ux-audit-rules.html">Overview</a>'
        '<a class="nav-link" href="../for-agents.html">Design system (agents)</a>'
        "</div>"
    )


def _footer() -> str:
    return (
        '<hr class="forge-divider">'
        '<footer class="text-center pb-4">'
        '<p class="forge-support">UX audit rule handbook · forgesdlc-kitchensink</p>'
        "</footer>"
    )


def write_ux_audit_rule_pages(output_dir: Path, all_pages: list[dict] | None = None) -> int:
    """Write showcase/ux-audit-rules/*.html from manifest + .md siblings."""
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
