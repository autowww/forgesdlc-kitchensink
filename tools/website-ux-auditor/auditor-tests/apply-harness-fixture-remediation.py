#!/usr/bin/env python3
"""Apply rule handbook After example to a harness fixture-website/index.html."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

KS_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(KS_ROOT / "generator"))

from ux_audit_rule_pages import extract_after_example_html, kebab_from_rule_id  # noqa: E402

RULE_PAGES_DIR = KS_ROOT / "docs" / "design" / "ux-audit" / "rule-pages"


def render_remediated_page(rule_id: str, after_html: str, title: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <script>
  (function(){{try{{var m=document.cookie.match(/(?:^|;)\\s*forge_color_scheme=([^;]*)/);var v=m?decodeURIComponent(m[1].trim()):'';var mq=window.matchMedia('(prefers-color-scheme: dark)');var t='dark';if(v==='light')t='light';else if(v==='dark')t='dark';else if(v==='auto')t=mq.matches?'dark':'light';document.documentElement.setAttribute('data-bs-theme',t);}}catch(e){{}}}})();
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
<div class="dropdown forge-theme-dropdown position-fixed top-0 end-0 m-2" style="z-index:1050" data-forge-pref="dark">
  <button type="button" class="forge-theme-trigger dropdown-toggle" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" id="forgeThemeMenu" aria-haspopup="true" aria-label="Appearance and color theme" title="Theme">
    <span class="forge-theme-trigger__inner">
      <span class="forge-theme-trigger__copy">
        <span class="forge-theme-eyebrow">Appearance</span>
        <span class="forge-theme-current">Dark</span>
      </span>
    </span>
  </button>
  <ul class="dropdown-menu dropdown-menu-end forge-theme-menu" aria-labelledby="forgeThemeMenu">
    <li><button type="button" class="dropdown-item forge-theme-option" data-forge-color-scheme="light"><span>Light</span></button></li>
    <li><button type="button" class="dropdown-item forge-theme-option active" data-forge-color-scheme="dark"><span>Dark</span></button></li>
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


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rule-id", required=True, help="DET rule id, e.g. DET.HASH.MARKERS")
    parser.add_argument(
        "--fixture-dir",
        required=True,
        type=Path,
        help="Path to fixture-website directory (index.html + assets/)",
    )
    args = parser.parse_args()

    slug = kebab_from_rule_id(args.rule_id)
    md_path = RULE_PAGES_DIR / f"{slug}.md"
    if not md_path.is_file():
        raise SystemExit(f"missing rule page: {md_path}")

    raw = md_path.read_text(encoding="utf-8")
    after_html = extract_after_example_html(raw).strip()
    if not after_html:
        raise SystemExit(f"no After example HTML in {md_path}")

    fixture_dir = args.fixture_dir.resolve()
    index_path = fixture_dir / "index.html"
    if not fixture_dir.is_dir():
        raise SystemExit(f"fixture dir missing: {fixture_dir}")

    title = "Visual hash marker pairing" if args.rule_id == "DET.HASH.MARKERS" else args.rule_id
    page = render_remediated_page(args.rule_id, after_html, title)
    index_path.write_text(page, encoding="utf-8")
    print(f"apply-harness-fixture-remediation: wrote {index_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
