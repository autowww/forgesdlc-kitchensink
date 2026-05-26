"""Compile UX audit rule handbook .md siblings into showcase HTML pages."""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = (
    REPO_ROOT / "tools" / "website-ux-auditor" / "design-rules" / "registry.generated.json"
)
PILOT_REGISTRY_PATH = (
    REPO_ROOT
    / "tools"
    / "website-ux-auditor"
    / "lib"
    / "ux-deterministic-fixers"
    / "pilot-registry.json"
)
RULE_PAGES_DIR = REPO_ROOT / "docs" / "design" / "ux-audit" / "rule-pages"
MANIFEST_PATH = RULE_PAGES_DIR / "rule-pages.manifest.json"
SHOWCASE_RULE_DIR = "ux-audit-rules"

_BOOTSTRAP_SUMMARY_MARKERS = (
    "harness bootstrap",
    "bootstrap page for the det ruleset harness",
    "bootstrap page for",
)

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


_RULE_ID_IN_CODE_HTML = re.compile(
    r"<code>((?:DET|AI)\.[A-Z0-9][A-Z0-9_.]*)</code>"
)
_RULE_ID_IN_MARKDOWN = re.compile(r"`((?:DET|AI)\.[A-Z0-9][A-Z0-9_.]*)`")


def handbook_rule_ids(
    *,
    registry: dict | None = None,
    manifest: dict | None = None,
) -> set[str]:
    """Rule IDs that have (or should have) a showcase handbook detail page."""
    ids: set[str] = set()
    manifest = manifest if manifest is not None else load_manifest()
    for row in manifest.get("rules") or []:
        rid = row.get("id")
        if rid:
            ids.add(str(rid))
    registry = registry if registry is not None else load_registry()
    for lane_key in ("deterministicRules", "aiRules"):
        for row in registry.get(lane_key) or []:
            rid = row.get("id")
            if rid:
                ids.add(str(rid))
    return ids


def parse_related_rules_list(raw_md: str) -> list[str]:
    """YAML list under related_rules: in rule page front matter."""
    m = re.match(r"^---\r?\n([\s\S]*?)\r?\n---", raw_md or "")
    if not m:
        return []
    ids: list[str] = []
    in_related = False
    for line in m.group(1).splitlines():
        if re.match(r"^related_rules:\s*\[\s*\]\s*$", line):
            return []
        if re.match(r"^related_rules:\s*$", line):
            in_related = True
            continue
        if in_related:
            item = re.match(r"^\s+-\s+(.+)$", line)
            if item:
                ids.append(item.group(1).strip().strip("'\""))
                continue
            if line.strip() and not line.startswith(" "):
                break
    return ids


def handbook_rule_title(
    rule_id: str,
    *,
    registry: dict | None = None,
    rule_pages_dir: Path | None = None,
) -> str:
    slug = kebab_from_rule_id(rule_id)
    md_path = (rule_pages_dir or RULE_PAGES_DIR) / f"{slug}.md"
    if md_path.is_file():
        front, _ = parse_front_matter(md_path.read_text(encoding="utf-8"))
        title = (front.get("title") or "").strip()
        if title:
            return title
    row = registry_row_for_rule(registry or load_registry(), rule_id) or {}
    return str(row.get("name") or row.get("title") or rule_id)


def rule_detail_page_href(rule_id: str, *, prefix: str = "") -> str:
    return f"{prefix}{kebab_from_rule_id(rule_id)}.html"


def linkify_rule_ids_in_html(
    html: str,
    known_ids: set[str],
    *,
    href_prefix: str = "",
    rule_pages_dir: Path | None = None,
    registry: dict | None = None,
) -> str:
    """Link <code>RULE.ID</code> to sibling handbook pages when the rule is in known_ids."""
    if not html or not known_ids:
        return html

    def _repl(match: re.Match[str]) -> str:
        rid = match.group(1)
        if rid not in known_ids:
            return match.group(0)
        href = rule_detail_page_href(rid, prefix=href_prefix)
        title = handbook_rule_title(
            rid, registry=registry, rule_pages_dir=rule_pages_dir
        )
        return (
            f'<a href="{e(href)}" class="ux-rule-crosslink text-cyan" '
            f'style="text-decoration:none" title="{e(title)} — UX rule handbook">'
            f"<code>{e(rid)}</code></a>"
        )

    return _RULE_ID_IN_CODE_HTML.sub(_repl, html)


def showcase_ux_audit_build_stamp() -> str:
    """Cache-bust query for UX audit showcase HTML (UTC date)."""
    return datetime.now(timezone.utc).strftime("%Y%m%d")


def examples_gallery_href() -> str:
    return f"ux-audit-ecosystem-examples.html?v={showcase_ux_audit_build_stamp()}"


def registry_row_for_rule(registry: dict, rule_id: str) -> dict | None:
    for lane_key in ("deterministicRules", "aiRules"):
        for row in registry.get(lane_key) or []:
            if row.get("id") == rule_id:
                return row
    return None


def _truncate_summary(text: str, *, limit: int = 200) -> str:
    t = re.sub(r"\s+", " ", (text or "").strip())
    if len(t) <= limit:
        return t
    return t[: limit - 1].rstrip() + "…"


def _first_sentence_plain(markdown: str) -> str:
    text = markdown or ""
    text = re.sub(r"```[\s\S]*?```", " ", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return ""
    m = re.match(r"^(.+?[.!?])(\s|$)", text)
    return (m.group(1) if m else text[:200]).strip()


def _is_bootstrap_summary(summary: str) -> bool:
    low = (summary or "").lower()
    return any(marker in low for marker in _BOOTSTRAP_SUMMARY_MARKERS)


def catalog_rule_summary(
    rule_id: str,
    *,
    manifest_row: dict | None = None,
    registry: dict | None = None,
    rule_pages_dir: Path | None = None,
) -> str:
    """One–two line catalog blurb: front matter summary → Purpose → registry fallback."""
    slug = kebab_from_rule_id(rule_id)
    md_path = (rule_pages_dir or RULE_PAGES_DIR) / f"{slug}.md"
    reg = registry if registry is not None else load_registry()
    reg_row = registry_row_for_rule(reg, rule_id)

    if md_path.is_file():
        raw = md_path.read_text(encoding="utf-8")
        front, _ = parse_front_matter(raw)
        summary = (front.get("summary") or "").strip()
        if summary and not _is_bootstrap_summary(summary):
            return _truncate_summary(summary)
        purpose_md = extract_section_body(raw, "purpose")
        if purpose_md:
            sent = _first_sentence_plain(purpose_md)
            if sent and "bootstrap page" not in sent.lower()[:100]:
                return _truncate_summary(sent)
        if summary:
            return (
                "Harness stub — open the handbook page for fixture context, "
                "Before/After, and remediation."
            )

    area = (reg_row or {}).get("area") or (manifest_row or {}).get("area") or ""
    sev = (reg_row or {}).get("defaultSeverity") or ""
    parts = [p for p in (area.replace("_", " "), sev) if p]
    if parts:
        return _truncate_summary(" · ".join(parts))
    return "Open the handbook page for purpose, how it is fixed, Before/After, and remediation."


def verify_ux_audit_rule_pages(output_dir: Path) -> None:
    """Fail the build when any manifest rule lacks a compiled handbook HTML sibling."""
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
            "[showcase] Missing ux-audit-rules handbook pages for: "
            + ", ".join(missing)
        )

    if out_dir.is_dir():
        built = {p.stem for p in out_dir.glob("*.html")}
        extra = sorted(built - expected_slugs)
        if extra:
            print(f"[showcase] Note: extra ux-audit-rules pages (not in manifest): {', '.join(extra)}")

    print(
        f"[showcase] Verified {len(expected_slugs)} ux-audit-rules/*.html "
        f"(one page per rule)"
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


def extract_section_body(raw_md: str, section_title_substring: str) -> str:
    """Return body text for the first ## section whose title contains substring (case-insensitive)."""
    _, body = parse_front_matter(raw_md)
    for title, content in split_sections(body):
        if section_title_substring.lower() in title.lower():
            return content
    return ""


def extract_before_example_html(raw_md: str) -> str:
    """HTML from the ## Before example fenced block, or empty string."""
    section = extract_section_body(raw_md, "before example")
    if not section:
        return ""
    _, html = extract_html_fence(section)
    return sanitize_embedded_example_html(html)


def extract_after_example_html(raw_md: str) -> str:
    """HTML from the ## After example fenced block, or empty string."""
    section = extract_section_body(raw_md, "after example")
    if not section:
        return ""
    _, html = extract_html_fence(section)
    return sanitize_embedded_example_html(html)


# Host showcase pages use <main id="main">. Rule fixtures must not embed document landmarks.
_EMBED_LANDMARK_REPLACEMENTS = (
    ("html", "data-ks-embed-html"),
    ("head", "data-ks-embed-head"),
    ("body", "data-ks-embed-body"),
    ("main", "data-ks-embed-main"),
)


def sanitize_embedded_example_html(html: str) -> str:
    """Make handbook fixture HTML safe inside showcase <main> (no nested landmarks / duplicate ids)."""
    if not html or not html.strip():
        return html
    out = html
    for tag, attrs in _EMBED_LANDMARK_REPLACEMENTS:
        out = re.sub(rf"<{tag}(\s|>)", rf"<div {attrs}\1", out, flags=re.IGNORECASE)
        out = re.sub(rf"</{tag}\s*>", "</div>", out, flags=re.IGNORECASE)
    out = re.sub(r'\srole=(["\'])main\1', "", out, flags=re.IGNORECASE)
    # Failing fixtures may include inline scripts (e.g. DET.JS.PROGRESSIVE); never run in showcase.
    out = re.sub(
        r"<script\b[\s\S]*?</script>",
        '<p class="forge-support mb-0"><em>Inline script omitted in showcase embed '
        "(see handbook source).</em></p>",
        out,
        flags=re.IGNORECASE,
    )

    def _prefix_id(match: re.Match[str]) -> str:
        quote, val = match.group(1), match.group(2)
        if val.startswith("ks-embed-"):
            return match.group(0)
        return f'id={quote}ks-embed-{val}{quote}'

    out = re.sub(r'\bid=(["\'])([^"\']+)\1', _prefix_id, out)

    # Inert diagram modal samples (active + #diagramModal breaks host pages and global JS).
    out = re.sub(
        r'class=(["\'])([^"\']*)\bdiagram-modal-backdrop\b\s+active\b([^"\']*)\1',
        r'class=\1\2diagram-modal-backdrop\3\1',
        out,
        flags=re.IGNORECASE,
    )
    if "ks-embed-diagramModal" in out and "hidden" not in out.lower():
        out = re.sub(
            r'(<div[^>]*\bid=(["\'])ks-embed-diagramModal\2)([^>]*)(>)',
            r'\1\3 hidden aria-hidden="true"\4',
            out,
            count=1,
            flags=re.IGNORECASE,
        )
    return out


def render_example_block(label: str, html: str) -> str:
    if not html:
        return ""
    safe_html = sanitize_embedded_example_html(html)
    return (
        f'<div class="forge-card p-3 mb-4 ks-section">'
        f'<p class="ks-section-title mb-2">{e(label)}</p>'
        '<div class="ux-rule-example border rounded p-3" '
        'style="border-color:var(--forge-border)!important">'
        '<div class="ux-rule-example-scene" data-ks-example="true">'
        f"{safe_html}"
        "</div>"
        "</div>"
        "</div>"
    )


def render_related_rules_section(
    body: str,
    front_related: list[str],
    known_ids: set[str],
    *,
    registry: dict | None = None,
    rule_pages_dir: Path | None = None,
) -> str:
    title = "Related rules"
    html = markdown_to_handbook_html(body) if body.strip() else ""
    html = linkify_rule_ids_in_html(
        html,
        known_ids,
        rule_pages_dir=rule_pages_dir,
        registry=registry,
    )
    listed = set(_RULE_ID_IN_MARKDOWN.findall(body or ""))
    listed.update(_RULE_ID_IN_CODE_HTML.findall(html))
    missing = [rid for rid in front_related if rid in known_ids and rid not in listed]
    if missing:
        reg = registry or load_registry()
        extra_items = []
        for rid in missing:
            href = rule_detail_page_href(rid)
            label = handbook_rule_title(
                rid, registry=reg, rule_pages_dir=rule_pages_dir
            )
            blurb = catalog_rule_summary(
                rid, registry=reg, rule_pages_dir=rule_pages_dir
            )
            link = (
                f'<a href="{e(href)}" class="ux-rule-crosslink text-cyan" '
                f'style="text-decoration:none" title="{e(label)} — UX rule handbook">'
                f"<code>{e(rid)}</code></a>"
            )
            extra_items.append(
                f"<li>{link} — {e(blurb)}</li>" if blurb else f"<li>{link}</li>"
            )
        extra = "\n".join(extra_items)
        if re.search(r"<ul\b", html, re.IGNORECASE):
            html = re.sub(
                r"(</ul>\s*)$",
                f"{extra}\n\\1",
                html.strip(),
                count=1,
                flags=re.IGNORECASE,
            )
        elif extra_items:
            html = f"<ul>\n{extra}\n</ul>\n{html}".strip()
    if not html:
        return ""
    return (
        f'<section class="ks-section" id="{e(_anchor_slug(title))}">'
        f'<h2 class="ks-section-title">{e(title)}</h2>'
        f"{html}"
        f"</section>"
    )


def render_section(
    title: str,
    body: str,
    *,
    known_rule_ids: set[str] | None = None,
    rule_pages_dir: Path | None = None,
    registry: dict | None = None,
) -> str:
    low = title.lower()
    if "before example" in low or "after example" in low:
        rest, html = extract_html_fence(body)
        html = sanitize_embedded_example_html(html)
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
    if known_rule_ids:
        html = linkify_rule_ids_in_html(
            html,
            known_rule_ids,
            rule_pages_dir=rule_pages_dir,
            registry=registry,
        )
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


def compile_rule_body(
    raw_md: str,
    *,
    known_rule_ids: set[str] | None = None,
    registry: dict | None = None,
    manifest: dict | None = None,
    rule_pages_dir: Path | None = None,
) -> tuple[dict[str, str], str]:
    registry = registry or load_registry()
    manifest = manifest if manifest is not None else load_manifest()
    known = known_rule_ids or handbook_rule_ids(registry=registry, manifest=manifest)
    front, body = parse_front_matter(raw_md)
    front_related = parse_related_rules_list(raw_md)
    sections_html = []
    for title, content in split_sections(body):
        if title.strip().lower() == "related rules":
            block = render_related_rules_section(
                content,
                front_related,
                known,
                registry=registry,
                rule_pages_dir=rule_pages_dir,
            )
        else:
            block = render_section(
                title,
                content,
                known_rule_ids=known,
                rule_pages_dir=rule_pages_dir,
                registry=registry,
            )
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


def load_pilot_registry() -> dict[str, dict]:
    if not PILOT_REGISTRY_PATH.is_file():
        return {}
    data = json.loads(PILOT_REGISTRY_PATH.read_text(encoding="utf-8"))
    return {r["ruleId"]: r for r in data.get("rules") or [] if r.get("ruleId")}


def render_fixer_remediation_section(
    rule_id: str,
    front: dict[str, str],
    manifest_row: dict | None,
) -> str:
    """How this rule is detected and fixed (deterministic fixer lane or AI agent)."""
    lane = (front.get("lane") or (manifest_row or {}).get("lane") or "").lower()
    pilot = load_pilot_registry()
    lines: list[str] = []

    if lane == "ai":
        lines.append(
            "<p>This is an <strong>AI-enabled</strong> rule. Pass/fail requires model judgment; "
            "there is no deterministic fixer in the pilot registry.</p>"
        )
        lines.append(
            "<ul>"
            "<li><strong>Harness:</strong> <code>invoke-ai-ruleset-harness.sh</code> runs "
            "<code>design-rules/ai/run-design-ai-rule.sh</code> on the <strong>Before</strong> "
            "fixture and expects findings with matching <code>principleId</code>.</li>"
            "<li><strong>Remediation:</strong> Cursor agent plans from "
            "<code>forge-ux-remediation.plan.md</code> after sitewide audit — not handbook After copy.</li>"
            "</ul>"
        )
    else:
        row = pilot.get(rule_id)
        if not row:
            lines.append(
                "<p>Not in the deterministic fixer pilot registry (stub or not yet wired). "
                "Use the <strong>After example</strong> below as the target state and remediate manually "
                "or extend <code>pilot-registry.json</code>.</p>"
            )
        else:
            fixer_id = row.get("fixerId") or "—"
            modes = ", ".join(row.get("harnessModes") or []) or "standalone"
            verify = row.get("verifyMode") or "expect_rule_clean"
            lines.append(
                f"<p>Pilot deterministic fixer: <code>{e(fixer_id)}</code> · "
                f"harness mode <code>{e(modes)}</code> · verify <code>{e(verify)}</code>.</p>"
            )
            if fixer_id == "handbook_after":
                lines.append(
                    "<ul>"
                    "<li><strong>Harness:</strong> "
                    "<code>apply-harness-fixture-remediation.py</code> copies the "
                    "<strong>After example</strong> HTML from this handbook page onto the defect fixture, "
                    "then <code>invoke-det-ruleset-remediation-verify.sh</code> re-audits and expects "
                    "<strong>zero</strong> findings for this rule.</li>"
                    "<li><strong>Production sites:</strong> "
                    "<code>run-website-ux-remediation-loop.sh</code> runs "
                    "<code>handbook_html_patch</code> (HTML patches in "
                    "<code>lib/ux-deterministic-fixers/fixers/patches/</code>) before invoking the "
                    "Cursor agent when the quality gate still fails.</li>"
                    "</ul>"
                )
            elif fixer_id == "repo_overlay":
                lines.append(
                    "<ul>"
                    "<li><strong>Harness:</strong> fixture includes a repo overlay tree; "
                    "<code>remediate_repo_overlay()</code> writes catalog/repo files, then applies "
                    "After HTML when present.</li>"
                    "<li><strong>Production:</strong> <code>repo_overlay</code> Node adapter patches "
                    "the website repository (contracts, registry JSON, CSS, Python stubs).</li>"
                    "</ul>"
                )
            else:
                lines.append(
                    f"<p>See fixer module for <code>{e(fixer_id)}</code> in "
                    "<code>lib/ux-deterministic-fixers/</code>.</p>"
                )

    lines.append(
        "<p class='forge-support mb-0'>Detection module: "
        f"<code>{e(front.get('source_rule') or 'design-rules/deterministic or ai generated modules')}</code>. "
        "Scroll down for <strong>Before</strong> / <strong>After</strong> examples and "
        "<strong>Evidence and remediation</strong> steps.</p>"
    )

    return (
        '<section class="ks-section" id="how-this-rule-is-fixed">'
        '<h2 class="ks-section-title">How this rule is fixed</h2>'
        f'{"".join(lines)}'
        "</section>"
    )


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
        known_ids = handbook_rule_ids(registry=registry, manifest=manifest)
        front, body_html = compile_rule_body(
            raw,
            known_rule_ids=known_ids,
            registry=registry,
            manifest=manifest,
            rule_pages_dir=RULE_PAGES_DIR,
        )
        title = front.get("title") or rule_id
        toc = (
            '<a class="nav-link" href="#how-this-rule-is-fixed">How this rule is fixed</a>\n'
            + build_toc_from_sections(raw)
        )
    else:
        toc = '<a class="nav-link" href="#how-this-rule-is-fixed">How this rule is fixed</a>\n'
        body_html = placeholder_body(rule_id, registry, manifest_row)

    meta = meta_banner(front, manifest_row)
    fixer_html = render_fixer_remediation_section(rule_id, front, manifest_row)
    full_body = meta + fixer_html + body_html

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
        '<p class="nav-section-label">UX audit</p>'
        '<div class="nav-rail">'
        '<a class="nav-link" href="../ux-audit-ecosystem.html">Auditor &amp; fixing</a>'
        '<a class="nav-link" href="../ux-audit-rules.html">Rule catalog</a>'
        f'<a class="nav-link" href="../{e(examples_gallery_href())}">Before/After gallery</a>'
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
