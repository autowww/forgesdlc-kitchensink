#!/usr/bin/env python3
"""Apply rule handbook After example to a harness fixture-website/index.html."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

KS_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(KS_ROOT / "generator"))

from build_rule_defect_fixtures import (  # noqa: E402
    build_repo_overlay,
    render_defect_page_standalone,
)
from ux_audit_rule_pages import (  # noqa: E402
    extract_after_example_html,
    kebab_from_rule_id,
    parse_front_matter,
)

RULE_PAGES_DIR = KS_ROOT / "docs" / "design" / "ux-audit" / "rule-pages"


def render_remediated_page(rule_id: str, after_html: str, title: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <script>
  (function(){{try{{var m=document.cookie.match(/(?:^|;)\\s*forge_color_scheme=([^;]*)/);var v=m?decodeURIComponent(m[1].trim()):'';var mq=window.matchMedia('(prefers-color-scheme: dark)');var t='light';if(v==='light')t='light';else if(v==='dark')t='dark';else if(v==='auto')t=mq.matches?'dark':'light';document.documentElement.setAttribute('data-bs-theme',t);}}catch(e){{}}}})();
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Remediated harness fixture for {rule_id} — paired hash markers on every governed visual root." />
  <title>{title} — remediated fixture</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="assets/forge-theme.css" />
</head>
<body>
<div class="forge-aurora"></div>
<a href="#main" class="skip-link">Skip to content</a>
<div class="dropdown forge-theme-dropdown position-fixed top-0 end-0 m-2" style="z-index:1050" data-forge-pref="light">
  <button type="button" class="forge-theme-trigger dropdown-toggle" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" id="forgeThemeMenu" aria-haspopup="true" aria-label="Appearance and color theme" title="Theme">
    <span class="forge-theme-trigger__inner">
      <span class="forge-theme-trigger__copy">
        <span class="forge-theme-eyebrow">Appearance</span>
        <span class="forge-theme-current">Light</span>
      </span>
    </span>
  </button>
  <ul class="dropdown-menu dropdown-menu-end forge-theme-menu" aria-labelledby="forgeThemeMenu">
    <li><button type="button" class="dropdown-item forge-theme-option active" data-forge-color-scheme="light"><span>Light</span></button></li>
    <li><button type="button" class="dropdown-item forge-theme-option" data-forge-color-scheme="dark"><span>Dark</span></button></li>
    <li><button type="button" class="dropdown-item forge-theme-option" data-forge-color-scheme="auto"><span>System</span></button></li>
  </ul>
</div>
{after_html}
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
<script src="assets/forge-theme.js"></script>
<script src="assets/showcase.js"></script>
</body>
</html>
"""


def remediate_repo_overlay(rule_id: str, overlay_root: Path) -> None:
    """Replace harness defect overlay trees with remediated catalog/repo files."""
    if rule_id == "DET.CONTRACT.PATH":
        dest = overlay_root / "docs/design/catalog/harness/missing-contract.md"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(
            "# Harness missing contract (remediated)\n\n"
            "## Expected look\n"
            "Neutral card surface aligned to forge-section rhythm.\n\n"
            "## Responsive behavior\n"
            "Stacks to single column below md breakpoint.\n",
            encoding="utf-8",
        )
        return
    if rule_id == "DET.CONTRACT.PLACEHOLDERS":
        dest = overlay_root / "docs/design/catalog/contracts/harness-placeholder-stub.md"
        dest.write_text(
            "# Harness placeholder contract (remediated)\n\n"
            "## Expected look\n"
            "Title and body use product vocabulary; no lorem or bracket stubs.\n\n"
            "## Responsive behavior\n"
            "Maintains readable line length at all breakpoints.\n",
            encoding="utf-8",
        )
        return
    if rule_id == "DET.INVENTORY.CROSSWALK":
        inv = overlay_root / "docs/design/catalog/visual-inventory.generated.json"
        inv.write_text(
            '{\n  "schemaVersion": 1,\n'
            '  "catalogCrosswalk": {\n'
            '    "showcase_dir": "showcase",\n'
            '    "showcase_hashes_not_in_registry": []\n'
            "  }\n}\n",
            encoding="utf-8",
        )
        bad = overlay_root / "showcase/harness-crosswalk-fail.html"
        if bad.is_file():
            bad.unlink()
        return
    if rule_id == "DET.TOKEN.NO_DRIFT":
        drift = overlay_root / "css/harness-token-drift.css"
        if drift.is_file():
            drift.write_text("/* remediated: no ad-hoc colors */\n", encoding="utf-8")
        return
    if rule_id == "DET.PY.KS_HASH_ATTRS":
        stub = 'from components.ks_hash_attrs import ks_hash_attrs\n\n# harness remediated\n'
        for rel in (
            "components/ks_hash_attrs.py",
            "components/ks_catalog_hashes.py",
            "components/layouts.py",
            "components/components.py",
            "generator/build-showcase.py",
            "generator/layout_previews.py",
            "forge-autodoc/forge_autodoc/page.py",
            "generator/harness_manual_hash_string.py",
        ):
            p = overlay_root / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            if rel == "components/ks_hash_attrs.py":
                p.write_text(
                    "def ks_hash_attrs(h, t, n, name):\n"
                    '    return f\'hash="{h}" data-ks-hash="{h}" data-ks-type="{t}" data-ks-name="{name}"\'\n',
                    encoding="utf-8",
                )
            else:
                p.write_text(stub + f"MARKUP = ks_hash_attrs('Abx', 'demo', 'layout', '{rel}')\n", encoding="utf-8")
        return
    if rule_id == "DET.SCREENSHOT.STATUS":
        catalog_dir = overlay_root / "docs" / "design" / "catalog"
        catalog_dir.mkdir(parents=True, exist_ok=True)
        contract = catalog_dir / "contracts" / "harness-screenshot.md"
        contract.parent.mkdir(parents=True, exist_ok=True)
        contract.write_text(
            "# Harness screenshot contract\n\n## Expected look\nDocumented surface.\n",
            encoding="utf-8",
        )
        registry_doc = {
            "schemaVersion": 1,
            "repoRoot": str(overlay_root),
            "entries": [
                {
                    "hash": "Hss",
                    "name": "harness-screenshot-ok",
                    "status": "active",
                    "contract_status": "own",
                    "contract": "docs/design/catalog/contracts/harness-screenshot.md",
                    "screenshot_status": "planned",
                    "screenshot_reason": "Harness fixture — capture deferred",
                }
            ],
        }
        (catalog_dir / "visual-registry.generated.json").write_text(
            json.dumps(registry_doc, indent=2) + "\n",
            encoding="utf-8",
        )
        return
    raise SystemExit(f"apply-harness-fixture-remediation: no repo_overlay remediate for {rule_id}")


def write_visual_registry(repo_root: Path, entries: list) -> None:
    catalog_dir = repo_root / "docs" / "design" / "catalog"
    catalog_dir.mkdir(parents=True, exist_ok=True)
    doc = {
        "schemaVersion": 1,
        "repoRoot": str(repo_root),
        "entries": entries,
    }
    (catalog_dir / "visual-registry.generated.json").write_text(
        json.dumps(doc, indent=2) + "\n",
        encoding="utf-8",
    )


def seed_harness_repo(rule_id: str, repo_root: Path) -> None:
    """Minimal repo files so metrics-phase rules pass with LOOP_REPO=fixture-website."""
    if rule_id == "DET.HASH.MARKERS":
        write_visual_registry(
            repo_root,
            [
                {
                    "hash": "Ldg",
                    "name": "layout-landing",
                    "type": "layout",
                    "status": "active",
                    "contract_status": "family-covered",
                },
                {
                    "hash": "Vln",
                    "name": "preview-landing",
                    "type": "layout-preview",
                    "status": "active",
                    "contract_status": "family-covered",
                },
                {
                    "hash": "Kpn",
                    "name": "product-primary-nav",
                    "type": "chrome-region",
                    "status": "active",
                    "contract_status": "family-covered",
                },
                {
                    "hash": "Ksf",
                    "name": "site-footer",
                    "type": "chrome-region",
                    "status": "active",
                    "contract_status": "family-covered",
                },
            ],
        )
        return
    if rule_id == "DET.HASH.REGISTRY_ROW":
        write_visual_registry(
            repo_root,
            [
                {
                    "hash": "Hbk",
                    "name": "layout-handbook",
                    "type": "layout",
                    "status": "active",
                    "contract_status": "family-covered",
                },
                {
                    "hash": "Ksr",
                    "name": "doc-sidebar",
                    "type": "chrome-region",
                    "status": "active",
                    "contract_status": "family-covered",
                },
                {
                    "hash": "Ksf",
                    "name": "site-footer",
                    "type": "chrome-region",
                    "status": "active",
                    "contract_status": "family-covered",
                },
            ],
        )
        return
    if rule_id == "DET.DIAGRAM.ASSET_REGISTRY":
        write_visual_registry(
            repo_root,
            [
                {
                    "hash": "Ksv",
                    "name": "diagram-family",
                    "type": "diagram-family",
                    "status": "active",
                    "source_paths": [],
                },
                {
                    "hash": "Zxd",
                    "name": "diagram-templates",
                    "type": "diagram-asset-group",
                    "status": "active",
                    "source_paths": ["assets/svg/template-gate-chain.svg"],
                },
            ],
        )
        svg_src = KS_ROOT / "assets/svg/template-gate-chain.svg"
        svg_dest = repo_root / "assets/svg/template-gate-chain.svg"
        svg_dest.parent.mkdir(parents=True, exist_ok=True)
        if svg_src.is_file():
            shutil.copy2(svg_src, svg_dest)
        js_dir = repo_root / "js"
        js_dir.mkdir(parents=True, exist_ok=True)
        (js_dir / "ks-diagram-catalog.js").write_text(
            "window.__FORGE_KS_DIAGRAM_CATALOG = {\n"
            "    gate: { label: 'Gate chain' },\n"
            "};\n",
            encoding="utf-8",
        )
        gallery = repo_root / "generator/pages/_diagram_gallery.py"
        gallery.parent.mkdir(parents=True, exist_ok=True)
        gallery.write_text(
            '# harness\n{"key": "gate", "svg": "template-gate-chain.svg"}\n',
            encoding="utf-8",
        )


def harness_remediate_after_html(rule_id: str, after_html: str) -> str:
    """Harness-only tweaks so Playwright audit matches handbook After intent."""
    out = after_html
    if rule_id == "DET.APP.FOCUS_TRAP":
        out = re.sub(r"\bd-lg-none\b", "", out)
        if 'data-bs-target="#docNavOffcanvas"' in out and "Open navigation" not in out:
            out = (
                '<button type="button" class="btn btn-sm btn-outline-secondary m-3" '
                'data-bs-toggle="offcanvas" data-bs-target="#docNavOffcanvas" '
                'aria-controls="docNavOffcanvas">Open navigation</button>\n'
                + out
            )
    if rule_id == "DET.NAV.DEDUP":
        out = re.sub(
            r'<nav(\s+class="ks-doc-breadcrumb[^"]*"[^>]*)>',
            r"<div\1>",
            out,
            count=1,
        )
        out = re.sub(
            r"(</ol>\s*)</nav>(\s*<h1)",
            r"\1</div>\2",
            out,
            count=1,
            flags=re.I,
        )
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rule-id", required=True, help="DET rule id, e.g. DET.HASH.MARKERS")
    parser.add_argument(
        "--fixture-dir",
        required=True,
        type=Path,
        help="Path to fixture-website directory (index.html + assets/)",
    )
    parser.add_argument(
        "--fixture-mode",
        default="standalone",
        help="standalone | multi_page | repo_overlay",
    )
    parser.add_argument(
        "--fixture-root",
        type=Path,
        default=None,
        help="Campaign fixture root (for multi_page baseline copy)",
    )
    parser.add_argument(
        "--repo-overlay",
        type=Path,
        default=None,
        help="Repo overlay path under fixture root (repo_overlay mode)",
    )
    args = parser.parse_args()

    slug = kebab_from_rule_id(args.rule_id)
    md_path = RULE_PAGES_DIR / f"{slug}.md"
    if not md_path.is_file():
        raise SystemExit(f"missing rule page: {md_path}")

    raw = md_path.read_text(encoding="utf-8")
    front, _ = parse_front_matter(raw)
    after_html = extract_after_example_html(raw).strip()
    if not after_html and args.fixture_mode != "repo_overlay":
        raise SystemExit(f"no After example HTML in {md_path}")
    if after_html:
        after_html = harness_remediate_after_html(args.rule_id, after_html)

    fixture_dir = args.fixture_dir.resolve()
    if not fixture_dir.is_dir():
        raise SystemExit(f"fixture dir missing: {fixture_dir}")

    title = front.get("title") or args.rule_id

    if args.fixture_mode == "repo_overlay":
        if not args.repo_overlay:
            raise SystemExit("--repo-overlay required for repo_overlay mode")
        remediate_repo_overlay(args.rule_id, args.repo_overlay.resolve())
        if after_html.strip():
            page = render_defect_page_standalone(args.rule_id, after_html, title)
            (fixture_dir / "index.html").write_text(page, encoding="utf-8")
        print(
            f"apply-harness-fixture-remediation: remediated overlay {args.repo_overlay}",
            file=sys.stderr,
        )
        return

    if args.fixture_mode == "multi_page":
        if not args.fixture_root:
            raise SystemExit("--fixture-root required for multi_page mode")
        passing_page = render_defect_page_standalone(args.rule_id, after_html, title)
        (fixture_dir / "index.html").write_text(passing_page, encoding="utf-8")
        settings_page = render_defect_page_standalone(
            args.rule_id, after_html, f"{title} settings"
        )
        (fixture_dir / "settings.html").write_text(settings_page, encoding="utf-8")
        seed_harness_repo(args.rule_id, fixture_dir)
        print(
            f"apply-harness-fixture-remediation: wrote index + settings.html",
            file=sys.stderr,
        )
        return

    page = render_defect_page_standalone(args.rule_id, after_html, title)
    (fixture_dir / "index.html").write_text(page, encoding="utf-8")
    seed_harness_repo(args.rule_id, fixture_dir)
    print(f"apply-harness-fixture-remediation: wrote {fixture_dir / 'index.html'}", file=sys.stderr)


if __name__ == "__main__":
    main()
