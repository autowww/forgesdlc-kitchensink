#!/usr/bin/env python3
"""Build ephemeral rule defect fixture pages from rule-page Before examples (DET or AI)."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "components"))
sys.path.insert(0, str(REPO_ROOT / "forge-autodoc"))
sys.path.insert(0, str(REPO_ROOT / "generator"))

from components import e  # noqa: E402
from ux_audit_rule_pages import (  # noqa: E402
    extract_after_example_html,
    extract_before_example_html,
    kebab_from_rule_id,
    load_registry,
    parse_front_matter,
)

REGISTRY_PATH = (
    REPO_ROOT / "tools" / "website-ux-auditor" / "design-rules" / "registry.generated.json"
)
RULE_PAGES_DIR = REPO_ROOT / "docs" / "design" / "ux-audit" / "rule-pages"
SHOWCASE_ASSETS = REPO_ROOT / "showcase" / "assets"
EXCLUDED_RULES = frozenset({"DET.THEME.FONT_STACK"})

# Repo-wide DET rules: defect is a minimal registry + contract tree, not page HTML.
HARNESS_REPO_OVERLAY: dict[str, dict] = {
    "DET.CONTRACT.PATH": {
        "registry_entries": [
            {
                "hash": "Hrn",
                "name": "harness-missing-contract",
                "status": "active",
                "contract_status": "own",
                "contract": "docs/design/catalog/harness/missing-contract.md",
            }
        ],
    },
    "DET.INVENTORY.CROSSWALK": {
        "files": {
            "showcase/harness-crosswalk-fail.html": (
                '<div hash="Zzz" data-ks-hash="Zzz">Unregistered showcase hash</div>\n'
            ),
            "docs/design/catalog/visual-inventory.generated.json": json.dumps(
                {
                    "schemaVersion": 1,
                    "catalogCrosswalk": {
                        "showcase_dir": "showcase",
                        "showcase_hashes_not_in_registry": ["Zzz"],
                    },
                },
                indent=2,
            )
            + "\n",
        },
        "registry_entries": [
            {
                "hash": "Hbk",
                "name": "layout-handbook",
                "status": "active",
                "contract_status": "own",
                "contract": "docs/design/catalog/layouts/Hbk-layout-handbook.md",
            }
        ],
    },
    "DET.SCREENSHOT.STATUS": {
        "registry_entries": [
            {
                "hash": "Hss",
                "name": "harness-screenshot-missing",
                "status": "active",
                "contract_status": "own",
                "contract": "docs/design/catalog/contracts/harness-screenshot.md",
                "screenshot_status": "captured",
            }
        ],
        "files": {
            "docs/design/catalog/contracts/harness-screenshot.md": "# Harness screenshot contract\n",
        },
    },
    "DET.TOKEN.NO_DRIFT": {
        "files": {
            "css/harness-token-drift.css": ".harness-drift { color: #ff00ff; background: #00ff00; }\n",
        },
        "registry_entries": [],
    },
    "DET.PY.KS_HASH_ATTRS": {
        "files": {
            "generator/harness_manual_hash_string.py": (
                'BAD = "<div hash=\\"Abx\\" data-ks-hash=\\"Abx\\"></div>"\n'
            ),
        },
        "registry_entries": [],
    },
    "DET.CONTRACT.PLACEHOLDERS": {
        "files": {
            "docs/design/catalog/contracts/harness-placeholder-stub.md": (
                "# Harness placeholder contract\n\n"
                "## Expected look\n"
                "Lorem ipsum dolor sit amet — placeholder orientation copy.\n"
                "## Responsive behavior\n"
                "[placeholder] breakpoint notes\n"
            ),
        },
        "registry_entries": [
            {
                "hash": "Hph",
                "name": "harness-placeholder",
                "status": "active",
                "contract_status": "own",
                "contract": "docs/design/catalog/contracts/harness-placeholder-stub.md",
            }
        ],
    },
}

# Route-crawl rules: baseline (After) then failing route (Before).
HARNESS_MULTI_PAGE_RULES = frozenset({"DET.APP.PERSISTENT_CHROME"})

# Before HTML is a full document (harness must not inject lang/title/viewport).
FULL_DOCUMENT_RULES = frozenset({"DET.PAGE.LANG", "DET.PAGE.TITLE", "DET.PAGE.VIEWPORT"})

BOOTSTRAP_CDN = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
BOOTSTRAP_JS = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"


def implemented_det_rules(registry: dict, only_rule: str | None = None) -> list[dict]:
    rows = [
        r
        for r in registry.get("deterministicRules") or []
        if r.get("status") == "implemented" and r.get("modulePath") and r.get("id")
    ]
    rows.sort(key=lambda r: -(r.get("priorityWeight") or 0))
    if only_rule:
        rows = [r for r in rows if r.get("id") == only_rule]
    return [r for r in rows if r.get("id") not in EXCLUDED_RULES]


def ai_rules_for_harness(registry: dict, only_rule: str | None = None) -> list[dict]:
    rows = [
        r
        for r in registry.get("aiRules") or []
        if r.get("promptPath") and r.get("id")
    ]
    rows.sort(key=lambda r: str(r.get("id") or ""))
    if only_rule:
        rows = [r for r in rows if r.get("id") == only_rule]
    return rows


def prepare_baseline_for_route_crawl(after_html: str) -> str:
    """Drop outbound links so a 2-page crawl visits index then settings.html only."""
    stripped = re.sub(
        r"<a\s+([^>]*?)href\s*=\s*[\"'][^\"']*[\"']([^>]*)>",
        r"<span \1\2>",
        after_html,
        flags=re.IGNORECASE,
    )
    stripped = re.sub(r"</a>", "</span>", stripped, flags=re.IGNORECASE)
    return (
        stripped
        + '<p class="mt-3"><a href="settings.html" class="btn btn-sm btn-outline-secondary">'
        "Open settings route (failing)</a></p>"
    )


def harness_prepare_before_html(html: str, rule_id: str) -> str:
    """Normalize handbook Before HTML so Playwright checks see the intended defect."""
    path_shim = ""
    if rule_id in ("DET.NAV.BREADCRUMB", "DET.NAV.IN_PAGE_TOC", "DET.NAV.FOCUS_ORDER"):
        path_shim = '<script>try{history.replaceState({},"","/docs/chapter");}catch(e){}</script>'
    out = path_shim + html
    if rule_id == "DET.CHROME.BOUNDARY":
        out = re.sub(r"\bd-none\s+d-lg-(block|flex)\b", "", out)
    if rule_id == "DET.BUTTON.GROUP.MAX":
        if "landing-hero-actions__buttons" in out and "flex-nowrap" not in out:
            out = out.replace(
                "landing-hero-actions__buttons",
                "landing-hero-actions__buttons flex-nowrap",
                1,
            )
    return out


def render_defect_page_standalone(rule_id: str, body_html: str, title: str) -> str:
    """Minimal top-level document — no showcase shell (chrome must sit outside main)."""
    raw = body_html.strip()
    if rule_id in FULL_DOCUMENT_RULES or raw.lower().startswith("<!doctype") or raw.lower().startswith("<html"):
        return harness_prepare_before_html(raw, rule_id)
    body = harness_prepare_before_html(raw, rule_id)
    return f"""<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{e(title)} — defect fixture</title>
  <link href="{BOOTSTRAP_CDN}" rel="stylesheet" crossorigin="anonymous" />
  <link rel="stylesheet" href="assets/forge-theme.css" />
</head>
<body>
{body}
<script src="{BOOTSTRAP_JS}" crossorigin="anonymous"></script>
<script src="assets/forge-theme.js"></script>
</body>
</html>
"""


def build_repo_overlay(out_root: Path, rule_id: str, spec: dict) -> str:
    """Minimal repo tree with visual-registry.generated.json for repo-scoped DET checks."""
    overlay_rel = f"repo-overlays/{rule_id}"
    overlay_root = out_root / overlay_rel
    catalog_dir = overlay_root / "docs" / "design" / "catalog"
    catalog_dir.mkdir(parents=True, exist_ok=True)

    for rel_path, content in (spec.get("files") or {}).items():
        dest = overlay_root / rel_path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(content, encoding="utf-8")

    registry_doc = {
        "schemaVersion": 1,
        "repoRoot": str(overlay_root),
        "entries": spec.get("registry_entries") or [],
    }
    (catalog_dir / "visual-registry.generated.json").write_text(
        json.dumps(registry_doc, indent=2) + "\n",
        encoding="utf-8",
    )
    return overlay_rel


def copy_showcase_assets(dest_website: Path) -> None:
    if not SHOWCASE_ASSETS.is_dir():
        raise SystemExit(
            f"build_rule_defect_fixtures: missing showcase assets at {SHOWCASE_ASSETS} "
            "(run python3 generator/build-showcase.py first)"
        )
    dest_assets = dest_website / "assets"
    if dest_assets.exists():
        shutil.rmtree(dest_assets)
    shutil.copytree(SHOWCASE_ASSETS, dest_assets)


def build_fixtures(
    out_root: Path,
    only_rule: str | None = None,
    *,
    lane: str = "deterministic",
) -> dict:
    registry = load_registry()
    if not registry:
        raise SystemExit(f"build_rule_defect_fixtures: missing registry {REGISTRY_PATH}")

    website_dir = out_root / "website"
    website_dir.mkdir(parents=True, exist_ok=True)
    copy_showcase_assets(website_dir)

    if lane == "ai":
        rule_rows = ai_rules_for_harness(registry, only_rule)
    else:
        rule_rows = implemented_det_rules(registry, only_rule)

    rules_out: list[dict] = []
    for row in rule_rows:
        rule_id = str(row["id"])
        slug = kebab_from_rule_id(rule_id)
        md_path = RULE_PAGES_DIR / f"{slug}.md"
        html_name = f"{slug}-fail.html"
        entry: dict = {
            "ruleId": rule_id,
            "slug": slug,
            "htmlPath": f"website/{html_name}",
            "mdPath": str(md_path.relative_to(REPO_ROOT)) if md_path.is_file() else "",
            "status": "missing_fixture",
            "contentVersion": row.get("contentVersion") or "",
            "fixtureMode": "standalone",
            "lane": lane,
            "promptPath": row.get("promptPath") or "",
        }

        if lane == "ai":
            if not md_path.is_file():
                rules_out.append(entry)
                continue
            raw = md_path.read_text(encoding="utf-8")
            front, _ = parse_front_matter(raw)
            before_html = extract_before_example_html(raw)
            if not before_html.strip():
                rules_out.append(entry)
                continue
            title = front.get("title") or rule_id
            page_html = render_defect_page_standalone(rule_id, before_html, title)
            (website_dir / html_name).write_text(page_html, encoding="utf-8")
            entry["status"] = "ready"
            rules_out.append(entry)
            continue

        if rule_id in HARNESS_REPO_OVERLAY:
            overlay_rel = build_repo_overlay(out_root, rule_id, HARNESS_REPO_OVERLAY[rule_id])
            entry["repoOverlayPath"] = overlay_rel
            entry["fixtureMode"] = "repo_overlay"

        if not md_path.is_file():
            if rule_id in HARNESS_REPO_OVERLAY:
                entry["status"] = "ready"
            rules_out.append(entry)
            continue

        raw = md_path.read_text(encoding="utf-8")
        front, _ = parse_front_matter(raw)
        before_html = extract_before_example_html(raw)
        if not before_html.strip() and rule_id not in HARNESS_REPO_OVERLAY:
            rules_out.append(entry)
            continue

        title = front.get("title") or rule_id

        if rule_id in HARNESS_MULTI_PAGE_RULES:
            after_html = extract_after_example_html(raw)
            if not after_html.strip():
                rules_out.append(entry)
                continue
            baseline_name = f"{slug}-baseline.html"
            fail_name = f"{slug}-fail.html"
            baseline_body = prepare_baseline_for_route_crawl(after_html)
            (website_dir / baseline_name).write_text(
                render_defect_page_standalone(rule_id, baseline_body, f"{title} baseline"),
                encoding="utf-8",
            )
            (website_dir / fail_name).write_text(
                render_defect_page_standalone(rule_id, before_html, title),
                encoding="utf-8",
            )
            entry["htmlPath"] = f"website/{baseline_name}"
            entry["failHtmlPath"] = f"website/{fail_name}"
            entry["fixtureMode"] = "multi_page"
            entry["crawlMaxPages"] = 2
            entry["status"] = "ready"
            rules_out.append(entry)
            continue

        if before_html.strip():
            page_html = render_defect_page_standalone(rule_id, before_html, title)
            (website_dir / html_name).write_text(page_html, encoding="utf-8")

        entry["status"] = "ready"
        rules_out.append(entry)

    manifest = {
        "schemaVersion": 2,
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "kitchensinkRoot": str(REPO_ROOT),
        "registryFingerprint": registry.get("fingerprint") or "",
        "lane": lane,
        "websiteDir": "website",
        "rules": rules_out,
        "summary": {
            "total": len(rules_out),
            "ready": sum(1 for r in rules_out if r.get("status") == "ready"),
            "missing_fixture": sum(1 for r in rules_out if r.get("status") == "missing_fixture"),
        },
    }
    (out_root / "manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    (out_root / "package.json").write_text(
        json.dumps({"name": "rule-defect-fixture-site", "private": True}, indent=2) + "\n",
        encoding="utf-8",
    )
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Build rule defect fixture HTML under --out")
    parser.add_argument("--out", required=True, type=Path, help="Campaign fixture root (abs path)")
    parser.add_argument("--only-rule", default="", help="Single rule id")
    parser.add_argument(
        "--lane",
        choices=("deterministic", "ai"),
        default="deterministic",
        help="Rule lane: deterministic (DET) or ai",
    )
    args = parser.parse_args()
    out_root = args.out.resolve()
    only = (args.only_rule or "").strip() or None
    manifest = build_fixtures(out_root, only, lane=args.lane)
    print(
        f"build_rule_defect_fixtures: {manifest['summary']['ready']} ready, "
        f"{manifest['summary']['missing_fixture']} missing_fixture → {out_root}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
