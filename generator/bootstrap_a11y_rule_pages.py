#!/usr/bin/env python3
"""Bootstrap docs/design/a11y-audit/rule-pages/*.md and manifest from a11y registry."""

from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = REPO_ROOT / "tools/website-a11y-auditor/design-rules/registry.generated.json"
RULE_PAGES_DIR = REPO_ROOT / "docs/design/a11y-audit/rule-pages"
MANIFEST_PATH = RULE_PAGES_DIR / "rule-pages.manifest.json"


def kebab_from_rule_id(rule_id: str) -> str:
    return (
        str(rule_id or "")
        .lower()
        .replace(".", "-")
        .replace("_", "-")
    )


def _page_version(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


# Before/After HTML snippets per rule (embedded in showcase gallery).
_EXAMPLES: dict[str, tuple[str, str, str]] = {
    "DET.A11Y.GENERIC.LANG": (
        "Document language",
        "Root html must declare lang.",
        (
            '<div data-ks-embed-main class="p-3"><h1 class="h4">Page without lang</h1>'
            "<p class=\"forge-support mb-0\">Simulates missing html[lang].</p></div>"
        ),
        (
            '<div data-ks-embed-main class="p-3" lang="en">'
            '<h1 class="h4">Page with lang</h1>'
            '<p class="forge-support mb-0">Assistive tech can pick en-US voice.</p></div>'
        ),
    ),
    "DET.A11Y.GENERIC.LANDMARKS": (
        "Landmarks",
        "One main landmark and nav when chrome links exist.",
        (
            '<div data-ks-embed-main class="p-3">'
            "<p>Content without a main landmark wrapper.</p>"
            '<nav class="mt-2"><a href="/">Home</a> · <a href="/docs">Docs</a></nav>'
            "</div>"
        ),
        (
            '<header class="site-header p-2 mb-2"><span class="forge-support">Site header</span></header>'
            '<nav aria-label="Primary"><a href="/">Home</a> · <a href="/docs">Docs</a></nav>'
            '<main id="main" class="p-3"><h1 class="h4">Primary content</h1></main>'
            '<footer class="p-2 mt-2"><span class="forge-support">Footer</span></footer>'
        ),
    ),
    "DET.A11Y.GENERIC.IMAGES_ALT": (
        "Image alt text",
        "Informative images need meaningful alt.",
        (
            '<div data-ks-embed-main class="p-3">'
            '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" '
            'width="120" height="80" alt="">'
            '<p class="forge-support mt-2 mb-0">Decorative-only alt missing on informative graphic.</p></div>'
        ),
        (
            '<div data-ks-embed-main class="p-3">'
            '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" '
            'width="120" height="80" alt="Architecture diagram: three-tier flow">'
            '<p class="forge-support mt-2 mb-0">Alt describes the diagram purpose.</p></div>'
        ),
    ),
    "DET.A11Y.KS.HASH_MARKERS": (
        "KS hash markers",
        "hash and data-ks-hash must agree on visual roots.",
        (
            '<div data-ks-embed-main class="p-3">'
            '<section class="forge-card p-3" hash="Abx" data-ks-hash="Xyz">'
            "<p class=\"mb-0\">Mismatched governed markers.</p></section></div>"
        ),
        (
            '<div data-ks-embed-main class="p-3">'
            '<section class="forge-card p-3" hash="Abx" data-ks-hash="Abx" data-ks-type="card" data-ks-name="demo-card">'
            "<p class=\"mb-0\">Matching three-letter hash pair.</p></section></div>"
        ),
    ),
    "DET.A11Y.GENERIC.RESIZE_TEXT": (
        "Resize text",
        "Viewport must allow zoom; avoid clipping enlarged text (1.4.4).",
        (
            '<div data-ks-embed-main class="p-3">'
            '<p class="mb-0" style="font-size:8px">Tiny text may fail when zoomed.</p></div>'
        ),
        (
            '<div data-ks-embed-main class="p-3">'
            '<p class="mb-0" style="font-size:1rem">Readable base size using rem.</p></div>'
        ),
    ),
    "DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE": (
        "Focus context change",
        "Avoid navigation or submit on focus (3.2.1).",
        (
            '<div data-ks-embed-main class="p-3">'
            '<input autofocus onfocus="location.href=\'/\'" aria-label="Jump on focus"></div>'
        ),
        (
            '<div data-ks-embed-main class="p-3">'
            '<button type="button">Explicit control — no focus handler</button></div>'
        ),
    ),
    "DET.A11Y.GENERIC.STATUS_MESSAGES": (
        "Status messages",
        "Dynamic status needs role or aria-live (4.1.3).",
        (
            '<div data-ks-embed-main class="p-3">'
            '<div class="alert alert-success">Saved — no live region.</div></div>'
        ),
        (
            '<div data-ks-embed-main class="p-3">'
            '<div role="status" aria-live="polite">Saved successfully.</div></div>'
        ),
    ),
    "DET.A11Y.KS.HANDBOOK_SINGLE_H1": (
        "Handbook single H1",
        "One primary h1 inside handbook chapter layout.",
        (
            '<div data-ks-embed-main>'
            '<section data-ks-name="handbook-chapter"><main id="main" class="p-3">'
            "<h1>Chapter title</h1><h1>Duplicate from Markdown</h1>"
            "<p>Two top-level headings confuse screen readers.</p>"
            "</main></section></div>"
        ),
        (
            '<div data-ks-embed-main>'
            '<section data-ks-name="handbook-chapter"><main id="main" class="p-3">'
            "<h1>Chapter title</h1><h2>Section</h2>"
            "<p>Body starts at h2 under a single h1.</p>"
            "</main></section></div>"
        ),
    ),
}


def _default_examples(rule_id: str, title: str, scope: str) -> tuple[str, str]:
    fail = (
        f'<div data-ks-embed-main class="p-3 forge-card">'
        f'<p class="forge-support mb-0">Placeholder failing state for <code>{rule_id}</code> ({scope}).</p></div>'
    )
    pass_ = (
        f'<div data-ks-embed-main class="p-3 forge-card">'
        f'<p class="mb-0">Placeholder passing state for <code>{rule_id}</code>.</p></div>'
    )
    return fail, pass_


def _render_md(
    rule_id: str,
    *,
    lane: str,
    scope: str,
    title: str,
    summary: str,
    source_rule: str,
    reg_fp: str,
    before_html: str,
    after_html: str,
    related: list[str],
) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    body_core = f"""\
## Purpose

{summary}

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `{rule_id}` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh {rule_id}` expects ≥1 finding on the Before fixture.

## Before example

```html
{before_html.strip()}
```

## After example

```html
{after_html.strip()}
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids {rule_id}` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

"""
    for rid in related:
        body_core += f"- `{rid}`\n"
    if not related:
        body_core += "- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)\n"

    content = body_core
    pv = _page_version(content)
    rel_yaml = "\n".join(f"  - {r}" for r in related) if related else "  []"
    return f"""---
rule_id: {rule_id}
lane: {lane}
scope: {scope}
title: {title}
summary: {summary}
page_version: {pv}
generated_at: {now}
registry_fingerprint: {reg_fp}
registry_status: implemented
source_rule: {source_rule}
related_rules:
{rel_yaml if related else "  - DET.A11Y.GENERIC.LANG"}
---

{content}
"""


def main() -> None:
    if not REGISTRY_PATH.is_file():
        raise SystemExit(f"Missing registry: {REGISTRY_PATH}")
    registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    reg_fp = registry.get("fingerprint") or ""
    RULE_PAGES_DIR.mkdir(parents=True, exist_ok=True)

    manifest_rules: list[dict] = []
    det_n = ai_n = 0

    for row in registry.get("deterministicRules") or []:
        rid = row.get("id")
        if not rid:
            continue
        det_n += 1
        scope = row.get("scope") or "generic"
        slug = kebab_from_rule_id(rid)
        ex = _EXAMPLES.get(rid)
        if ex:
            title, summary, before, after = ex[0], ex[1], ex[2], ex[3]
        else:
            title = rid.split(".")[-1].replace("_", " ").title()
            summary = f"Deterministic accessibility check ({scope} scope)."
            before, after = _default_examples(rid, title, scope)
        md = _render_md(
            rid,
            lane="deterministic",
            scope=scope,
            title=title,
            summary=summary,
            source_rule=row.get("sourceRule") or f"docs/design/a11y-audit/deterministic-a11y-rules.md#{slug}",
            reg_fp=reg_fp,
            before_html=before,
            after_html=after,
            related=[],
        )
        path = RULE_PAGES_DIR / f"{slug}.md"
        path.write_text(md, encoding="utf-8")
        manifest_rules.append(
            {
                "id": rid,
                "lane": "deterministic",
                "scope": scope,
                "status": "current",
                "contentVersion": _page_version(md),
                "pageVersion": _page_version(md),
                "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "registryStatus": row.get("status"),
                "registryFingerprint": reg_fp,
            }
        )

    for row in registry.get("aiRules") or []:
        rid = row.get("id")
        if not rid:
            continue
        ai_n += 1
        scope = row.get("scope") or "generic"
        slug = kebab_from_rule_id(rid)
        title = rid.split(".")[-1].replace("_", " ").title()
        summary = f"AI judgment overlay ({scope} scope)."
        before, after = _default_examples(rid, title, scope)
        md = _render_md(
            rid,
            lane="ai",
            scope=scope,
            title=title,
            summary=summary,
            source_rule=row.get("sourceRule") or f"docs/design/a11y-audit/ai-enabled-a11y-principles.md#{slug}",
            reg_fp=reg_fp,
            before_html=before,
            after_html=after,
            related=[],
        )
        path = RULE_PAGES_DIR / f"{slug}.md"
        path.write_text(md, encoding="utf-8")
        manifest_rules.append(
            {
                "id": rid,
                "lane": "ai",
                "scope": scope,
                "status": "current",
                "contentVersion": _page_version(md),
                "pageVersion": _page_version(md),
                "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "registryStatus": "implemented",
                "registryFingerprint": reg_fp,
            }
        )

    manifest = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "registryFingerprint": reg_fp,
        "summary": {
            "total": len(manifest_rules),
            "deterministic": det_n,
            "ai": ai_n,
            "current": len(manifest_rules),
            "stale": 0,
            "missing": 0,
        },
        "rules": sorted(manifest_rules, key=lambda r: r.get("id") or ""),
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"[bootstrap-a11y] wrote {len(manifest_rules)} rule pages + manifest")


if __name__ == "__main__":
    main()
