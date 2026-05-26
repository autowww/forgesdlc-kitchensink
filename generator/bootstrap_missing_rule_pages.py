#!/usr/bin/env python3
"""Write rule-page markdown with Before/After HTML for harness gap rules (no Cursor agent)."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
RULE_PAGES_DIR = REPO_ROOT / "docs" / "design" / "ux-audit" / "rule-pages"
REGISTRY_PATH = (
    REPO_ROOT / "tools" / "website-ux-auditor" / "design-rules" / "registry.generated.json"
)
sys.path.insert(0, str(REPO_ROOT / "generator"))
from ux_audit_rule_pages import kebab_from_rule_id, load_registry  # noqa: E402

MAIN_OPEN = '<main id="main" class="doc-main px-4 py-4">'
MAIN_CLOSE = "</main>"

# (before_html, after_html) — body fragment unless rule uses full document in before
RULE_EXAMPLES: dict[str, tuple[str, str]] = {
    "DET.PAGE.LANG": (
        """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Missing lang</title></head>
<body><main id="main"><p class="forge-support">Root element omits lang.</p></main></body>
</html>""",
        """<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>With lang</title></head>
<body><main id="main"><p class="forge-support">Document language declared.</p></main></body>
</html>""",
    ),
    "DET.PAGE.TITLE": (
        """<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Home</title></head>
<body><main id="main"><p class="forge-support">Generic title placeholder.</p></main></body>
</html>""",
        """<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Forge SDLC — Governed delivery handbook</title></head>
<body><main id="main"><p class="forge-support">Descriptive page title.</p></main></body>
</html>""",
    ),
    "DET.PAGE.VIEWPORT": (
        """<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>No viewport</title></head>
<body><main id="main"><p class="forge-support">Missing responsive viewport meta.</p></main></body>
</html>""",
        """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>With viewport</title>
</head>
<body><main id="main"><p class="forge-support">Viewport meta present.</p></main></body>
</html>""",
    ),
    "DET.PAGE.MODE": (
        f"""<div class="landing-hero fs-landing-hero-band forge-section" data-ks-type="layout" data-ks-name="layout-landing">
  <div class="container-fluid"><h1 class="font-display mb-3">Product landing</h1></div>
</div>
<aside class="forge-sidebar col-lg-3 d-flex flex-column p-3" data-ks-hash="Ksr" data-ks-type="chrome-region" data-ks-name="doc-sidebar">
  <nav class="nav-scroll"><a href="/docs/a" class="nav-link">Chapter A</a><a href="/docs/b" class="nav-link">Chapter B</a>
  <a href="/docs/c" class="nav-link">Chapter C</a><a href="/docs/d" class="nav-link">Chapter D</a>
  <a href="/docs/e" class="nav-link">Chapter E</a><a href="/docs/f" class="nav-link">Chapter F</a></nav>
</aside>
{MAIN_OPEN}<p class="forge-support">Handbook sidebar competes with marketing hero.</p>{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}<section class="landing-hero"><h1 class="font-display">Product landing</h1>
<p class="forge-support">Single marketing mode without handbook chrome.</p></section>{MAIN_CLOSE}""",
    ),
    "DET.SECTION.HEADING": (
        f"""{MAIN_OPEN}
<h1 class="font-display">Page title</h1>
<h3 class="h5">Skipped level</h3>
<p class="forge-support">Heading hierarchy jumps from h1 to h3.</p>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}
<h1 class="font-display">Page title</h1>
<h2 class="h4">Section</h2>
<p class="forge-support">Sequential heading levels.</p>
{MAIN_CLOSE}""",
    ),
    "DET.SECTION.SINGLE_JOB": (
        f"""{MAIN_OPEN}
<h1 class="font-display">Platform overview</h1>
<section class="forge-card p-4 mb-4 ks-section" style="min-height:140px">
<h2 class="h4">Everything at once</h2>
<p class="forge-support">{'Get started quickstart install setup try sign up now. Pricing plan tier subscription cost license fee. Trust security governance boundary privacy audit evidence compliance posture. Outcome benefit value impact result why forge why choose. Forgesdlc lenses lcdl fleet platform blueprints ecosystem partners. Workflow stages lifecycle pipeline process from intent to ship. ' * 3}</p>
</section>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}
<h1 class="font-display">Governed delivery</h1>
<section class="forge-card p-4 mb-4" style="min-height:120px">
<h2 class="h4">Methodology spine</h2>
<p class="forge-support">One coherent topic: how Forge SDLC connects intent to evidence.</p>
</section>
{MAIN_CLOSE}""",
    ),
    "DET.LANDMARKS.REQUIRED": (
        """<div class="site-header border-bottom px-3 py-2"><p class="forge-brand mb-0">Forge</p></div>
<div class="doc-main px-4 py-4"><p class="forge-support">Content without main landmark.</p></div>
<footer class="py-3 text-center"><p class="forge-support mb-0">Footer</p></footer>""",
        f"""<header class="site-header border-bottom px-3 py-2"><p class="forge-brand mb-0">Forge</p></header>
{MAIN_OPEN}<p class="forge-support">Semantic main landmark wraps primary content.</p>{MAIN_CLOSE}
<footer class="py-3 text-center"><p class="forge-support mb-0">Footer</p></footer>""",
    ),
    "DET.MOTION.NO_AUTO_PLAY_FLASH": (
        f"""{MAIN_OPEN}
<style>@keyframes blink {{ from {{ opacity: 1; }} to {{ opacity: 0; }} }}
.risk {{ animation: blink 0.2s infinite; }}</style>
<p class="risk forge-support">High-frequency flashing text.</p>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}<p class="forge-support">No seizure-risk flash animation.</p>{MAIN_CLOSE}""",
    ),
    "DET.MOTION.PREFERS_REDUCED": (
        f"""{MAIN_OPEN}
<style>@media (prefers-reduced-motion: no-preference) {{ .spin {{ animation: spin 0.4s linear infinite; }} }}
@keyframes spin {{ to {{ transform: rotate(360deg); }} }}</style>
<div class="spin forge-card p-3">Always spins — ignores reduced motion.</div>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}
<style>@media (prefers-reduced-motion: reduce) {{ .spin {{ animation: none !important; }} }}</style>
<div class="spin forge-card p-3">Respects prefers-reduced-motion.</div>
{MAIN_CLOSE}""",
    ),
    "DET.NAV.FOCUS_ORDER": (
        """<header class="site-header px-3 py-2"><a href="#main" class="btn btn-sm btn-forge">Skip</a></header>
<div class="doc-main px-4 py-4" tabindex="0"><a href="/" class="btn btn-forge">Home</a></div>
<a href="/contact" class="btn btn-outline-secondary position-fixed" style="top:8px;right:8px;z-index:2000">Contact</a>""",
        f"""<header class="site-header px-3 py-2"><a href="#main" class="btn btn-sm btn-forge">Skip</a></header>
{MAIN_OPEN}<a href="/" class="btn btn-forge">Home</a>{MAIN_CLOSE}
<a href="/contact" class="btn btn-outline-secondary">Contact</a>""",
    ),
    "DET.NAV.BREADCRUMB": (
        """<header class="site-header px-3 py-2"><div class="site-header-content"><h1 class="h5 mb-0">Chapter</h1></div></header>
<aside class="forge-sidebar col-lg-3 d-flex flex-column p-3" data-ks-hash="Ksr" data-ks-type="chrome-region" data-ks-name="doc-sidebar">
<nav><a href="/docs" class="nav-link active">Docs</a></nav></aside>
<main id="main" class="px-4 py-4"><p class="forge-support">Doc hub without Kbc breadcrumb chrome.</p></main>""",
        """<header class="site-header px-3 py-2">
<nav class="ks-doc-breadcrumb" aria-label="Breadcrumb" hash="Kbc" data-ks-hash="Kbc" data-ks-type="chrome-region" data-ks-name="doc-breadcrumb">
<a href="/" class="forge-support text-cyan" style="text-decoration:none">Home</a><span aria-hidden="true"> / </span><span aria-current="page">Page</span>
</nav></header>
<aside class="forge-sidebar col-lg-3 d-flex flex-column p-3" hash="Ksr" data-ks-hash="Ksr" data-ks-type="chrome-region" data-ks-name="doc-sidebar"><nav><a href="/docs" class="nav-link active text-cyan">Docs</a></nav></aside>
<main id="main" class="px-4 py-4"><p class="forge-support">Kbc breadcrumb present on doc hub.</p></main>""",
    ),
    "DET.NAV.DEDUP": (
        """<header class="site-header px-3 py-2"><nav><a href="/docs/start" class="nav-link">Getting started</a></nav></header>
<aside class="forge-sidebar p-3" data-ks-hash="Ksr"><nav><a href="/docs/start" class="nav-link active">Getting started</a></nav></aside>
<main id="main" class="px-4 py-4"><p class="forge-support">Duplicate destination across bands.</p></main>""",
        """<header class="site-header px-3 py-2"><nav><a href="/product" class="nav-link">Product</a></nav></header>
<aside class="forge-sidebar p-3" data-ks-hash="Ksr"><nav><a href="/docs/start" class="nav-link active">Getting started</a></nav></aside>
<main id="main" class="px-4 py-4"><p class="forge-support">Distinct destinations per band.</p></main>""",
    ),
    "DET.NAV.DEPTH": (
        """<header class="site-header px-3 py-2"><nav aria-label="Site navigation" class="landing-nav">
<ul class="list-unstyled mb-0"><li><a href="/">Home</a>
<ul><li><a href="/a">A</a><ul><li><a href="/b">B</a><ul><li><a href="/c">C</a><ul><li><a href="/d">D</a></li></ul></li></ul></li></ul></li></ul></li></ul>
</nav></header><main id="main" class="px-4 py-4"><p class="forge-support">Global nav nesting exceeds depth cap.</p></main>""",
        """<header class="site-header px-3 py-2"><nav aria-label="Site navigation" class="landing-nav">
<ul class="list-unstyled mb-0"><li><a href="/">Home</a><ul><li><a href="/docs">Docs</a></li></ul></li></ul>
</nav></header><main id="main" class="px-4 py-4"><p class="forge-support">Shallow global nav.</p></main>""",
    ),
    "DET.NAV.IN_PAGE_TOC": (
        """<header class="site-header px-3 py-2"><div class="site-header-content"><h1 class="h5 mb-0">Chapter</h1></div></header>
<aside class="forge-sidebar col-lg-3 d-flex flex-column p-3" data-ks-hash="Ksr" data-ks-type="chrome-region" data-ks-name="doc-sidebar">
<nav><a href="/docs" class="nav-link active">Docs</a></nav></aside>"""
        + f"""
{MAIN_OPEN}
<h1 class="font-display">Long chapter</h1>
<p class="forge-support">{'word ' * 950}</p>
{MAIN_CLOSE}""",
        f"""<aside class="doc-toc ks-doc-toc" data-ks-hash="Ktx"><nav aria-label="On this page"><a href="#s1">Section</a></nav></aside>
{MAIN_OPEN}
<h1 class="font-display">Long chapter</h1>
<p id="s1" class="forge-support">{'word ' * 120}</p>
{MAIN_CLOSE}""",
    ),
    "DET.PROSE.LENGTH": (
        f"""{MAIN_OPEN}
<p class="forge-support">{'Governed delivery requires clarity across stakeholders and agents. ' * 12}</p>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}<p class="forge-support">Short paragraph within the word cap.</p>{MAIN_CLOSE}""",
    ),
    "DET.LAYOUT.GRID_CONSISTENCY": (
        f"""{MAIN_OPEN}
<section class="ks-section">
<p class="forge-support">{'Aligned prose block one with shared measure and enough words for grid scan. ' * 4}</p>
<p class="forge-support" style="margin-left:72px">{'Same section but gutter drift on block two with matching word count. ' * 4}</p>
</section>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}
<div class="doc-content"><p class="forge-support">Aligned prose block one.</p></div>
<div class="doc-content"><p class="forge-support">Aligned prose block two.</p></div>
{MAIN_CLOSE}""",
    ),
    "DET.THEME.CONTRAST_MIN": (
        f"""{MAIN_OPEN}
<p style="color:#5a5a5a;background:#606060" class="forge-support">Low contrast body text on muted panel.</p>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}<p class="forge-support" style="color:var(--forge-text-1);background:var(--forge-bg)">Token-backed contrast.</p>{MAIN_CLOSE}""",
    ),
    "DET.THEME.FONT_STACK": (
        """<!DOCTYPE html>
<html lang="en" data-forge-theme="forge">
<head>
  <meta charset="utf-8">
  <title>Font stack drift</title>
  <style>
    .drift-title { font-family: "Comic Sans MS", cursive; }
    .drift-body { font-family: Georgia, serif; }
  </style>
</head>
<body>
<main id="main" class="doc-main px-4 py-4">
  <h1 class="drift-title font-display mb-2">Wrong display stack</h1>
  <p class="drift-body forge-support mb-0">Body uses non-token font-family.</p>
</main>
</body>
</html>""",
        """<!DOCTYPE html>
<html lang="en" data-forge-theme="forge">
<head>
  <meta charset="utf-8">
  <title>Approved font stacks</title>
  <link rel="stylesheet" href="/assets/forge-theme.css">
</head>
<body>
<main id="main" class="doc-main px-4 py-4">
  <h1 class="font-display mb-2">Display uses Forge stack</h1>
  <p class="forge-support mb-0">Body and labels use theme token stacks only.</p>
</main>
</body>
</html>""",
    ),
    "DET.VISUAL.RHYTHM": (
        f"""{MAIN_OPEN}
<section class="forge-card p-3 mb-1 ks-section">Block A</section>
<section class="forge-card p-3 mb-5 ks-section">Block B</section>
<section class="forge-card p-3 mb-1 ks-section">Block C</section>
<section class="forge-card p-3 mb-5 ks-section">Block D</section>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}
<section class="forge-card p-3 mb-4 ks-section">Block A</section>
<section class="forge-card p-3 mb-4 ks-section">Block B</section>
<section class="forge-card p-3 mb-4 ks-section">Block C</section>
<section class="forge-card p-3 mb-4 ks-section">Block D</section>
{MAIN_CLOSE}""",
    ),
    "DET.SURFACE.ELEVATION_TOKEN": (
        f"""{MAIN_OPEN}
<div class="forge-card p-3" style="box-shadow:0 24px 80px rgba(0,0,0,0.55)">Ad-hoc deep shadow.</div>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}<div class="forge-card p-3">Uses design-system elevation tokens only.</div>{MAIN_CLOSE}""",
    ),
    "DET.HTML.EMPTY_INLINE": (
        f"""{MAIN_OPEN}<p class="forge-support">Label <strong></strong> with empty emphasis.</p>{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}<p class="forge-support">Label <strong>visible</strong> text.</p>{MAIN_CLOSE}""",
    ),
    "DET.JS.NO_CONSOLE_ERROR": (
        f"""{MAIN_OPEN}
<ul class="nav nav-tabs mb-3"><li><button type="button" class="btn btn-sm btn-forge" data-bs-toggle="tab" id="harnessErrTab">Trigger</button></li></ul>
<script>document.getElementById('harnessErrTab')?.addEventListener('click',()=>console.error('harness intentional console error'));</script>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}<button type="button" class="btn btn-forge">Safe</button>{MAIN_CLOSE}""",
    ),
    "DET.JS.PROGRESSIVE": (
        f"""{MAIN_OPEN}
<noscript><p class="forge-support">Brief noscript fallback only.</p></noscript>
<script>const m=document.getElementById('main');if(m)m.innerHTML='<p class="forge-support">'+'w '.repeat(200)+'</p>';</script>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}
<p class="forge-support">{'Same substantive copy visible with or without script. ' * 8}</p>
<noscript><p class="forge-support">Noscript fallback present.</p></noscript>
{MAIN_CLOSE}""",
    ),
    "DET.REACT.A11Y_ROLE": (
        f"""{MAIN_OPEN}
<div data-ks-react-root="true" data-ks-type="react-primitive" data-ks-hash="Rxp" data-ks-name="status-pill">
<button type="button" class="btn btn-sm btn-forge"></button>
</div>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}
<div data-ks-react-root="true" data-ks-type="react-primitive" data-ks-hash="Rxp" data-ks-name="status-pill" role="status">
<button type="button" class="btn btn-sm btn-forge" aria-label="Refresh status">↻</button>
</div>
{MAIN_CLOSE}""",
    ),
    "DET.REACT.KS_ATTRS": (
        f"""{MAIN_OPEN}
<div data-ks-react-root="true" data-ks-type="react-primitive" data-ks-name="chip">
<span class="badge">Chip</span></div>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}
<div data-ks-react-root="true" data-ks-type="react-primitive" data-ks-hash="Rxp" data-ks-name="chip">
<span class="badge">Chip</span></div>
{MAIN_CLOSE}""",
    ),
    # Repo-scoped rules: placeholder body; harness uses repo overlay
    "DET.INVENTORY.CROSSWALK": (
        f"""{MAIN_OPEN}<p class="forge-support">Repo overlay carries unregistered showcase hash Zzz.</p>{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}<p data-ks-hash="Hbk" hash="Hbk" class="forge-support">Registered hash markers.</p>{MAIN_CLOSE}""",
    ),
    "DET.SCREENSHOT.STATUS": (
        f"""{MAIN_OPEN}<p class="forge-support">Registry screenshot_status mismatch (repo overlay).</p>{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}<p class="forge-support">Screenshot status aligned with catalog.</p>{MAIN_CLOSE}""",
    ),
    "DET.TOKEN.NO_DRIFT": (
        f"""{MAIN_OPEN}<p class="forge-support">Raw hex in repo CSS overlay triggers drift scan.</p>{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}<p class="forge-support" style="color:var(--forge-text-1)">Token-only styling.</p>{MAIN_CLOSE}""",
    ),
    "DET.PY.KS_HASH_ATTRS": (
        f"""{MAIN_OPEN}<p class="forge-support">Python manual hash literal in repo overlay.</p>{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}<p class="forge-support">Helpers used in generators.</p>{MAIN_CLOSE}""",
    ),
    "DET.PY.OPTIONAL_REGIONS": (
        f"""{MAIN_OPEN}
<div data-ks-optional="true" class="fs-site-announcement"><h2 class="h6">Announcement</h2></div>
{MAIN_CLOSE}""",
        f"""{MAIN_OPEN}
<div data-ks-optional="true" class="fs-site-announcement" hidden><h2 class="h6">Announcement</h2></div>
{MAIN_CLOSE}""",
    ),
}

FULL_DOCUMENT_RULES = frozenset({"DET.PAGE.LANG", "DET.PAGE.TITLE", "DET.PAGE.VIEWPORT"})


def title_from_rule_id(rule_id: str) -> str:
    return re.sub(r"\s+", " ", rule_id.replace("DET.", "").replace(".", " ").replace("_", " ")).title()


def write_rule_page(rule_id: str, row: dict, registry: dict) -> None:
    before, after = RULE_EXAMPLES[rule_id]
    slug = kebab_from_rule_id(rule_id)
    md_path = RULE_PAGES_DIR / f"{slug}.md"
    source = row.get("sourceRule") or f"docs/design/ux-audit/deterministic-design-rules.md#{slug}"
    title = title_from_rule_id(rule_id)
    version = hashlib.sha256(
        json.dumps({"ruleId": rule_id, "impl": row.get("modulePath", "")}, sort_keys=True).encode()
    ).hexdigest()
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    fp = registry.get("fingerprint") or ""

    body = f"""---
rule_id: {rule_id}
lane: deterministic
title: {title}
summary: Harness bootstrap handbook page for {rule_id}.
page_version: {version}
generated_at: {now}
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: {fp}
registry_status: {row.get("status") or "implemented"}
source_rule: {source}
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `{row.get("modulePath") or "deterministic check"}`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `{rule_id}` on the defect fixture.

## Before example

```html
{before.strip()}
```

## After example

```html
{after.strip()}
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule {rule_id}`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
"""
    md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text(body, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, help="Fixture manifest.json (missing_fixture rules)")
    parser.add_argument("--all-missing", action="store_true", help="All RULE_EXAMPLES keys")
    parser.add_argument(
        "--only-rule",
        action="append",
        default=[],
        help="Write handbook page for rule id(s) in RULE_EXAMPLES (e.g. DET.THEME.FONT_STACK)",
    )
    args = parser.parse_args()

    registry = load_registry() or json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    by_id = {r["id"]: r for r in registry.get("deterministicRules") or [] if r.get("id")}

    if args.only_rule:
        rule_ids = [rid for rid in args.only_rule if rid in RULE_EXAMPLES]
        if len(rule_ids) != len(args.only_rule):
            unknown = [rid for rid in args.only_rule if rid not in RULE_EXAMPLES]
            print(f"bootstrap_missing_rule_pages: no examples for {unknown}", file=sys.stderr)
    elif args.manifest and args.manifest.is_file():
        rule_ids = [
            r["ruleId"]
            for r in json.loads(args.manifest.read_text(encoding="utf-8")).get("rules") or []
            if r.get("status") == "missing_fixture" and r.get("ruleId") in RULE_EXAMPLES
        ]
    elif args.all_missing:
        rule_ids = sorted(RULE_EXAMPLES.keys())
    else:
        parser.error("Provide --manifest, --all-missing, or --only-rule")

    written = 0
    for rule_id in rule_ids:
        row = by_id.get(rule_id, {"id": rule_id, "status": "implemented"})
        write_rule_page(rule_id, row, registry)
        written += 1

    tool_root = REPO_ROOT / "tools" / "website-ux-auditor"
    subprocess.run(
        ["node", "design-rules/blender/rule-page-version.mjs", "--write-manifest"],
        cwd=tool_root,
        check=True,
    )
    print(f"bootstrap_missing_rule_pages: wrote {written} pages → {RULE_PAGES_DIR}", file=sys.stderr)


if __name__ == "__main__":
    main()
