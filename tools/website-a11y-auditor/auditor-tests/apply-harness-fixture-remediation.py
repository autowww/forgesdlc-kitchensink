#!/usr/bin/env python3
"""Apply a11y rule handbook After example to harness fixture index.html."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

KS_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(KS_ROOT / "generator"))

from a11y_audit_rule_pages import (  # noqa: E402
    extract_after_example_html,
    kebab_from_rule_id,
    parse_front_matter,
)

RULE_PAGES_DIR = KS_ROOT / "docs" / "design" / "a11y-audit" / "rule-pages"


def render_remediated_page(rule_id: str, after_html: str, title: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} — remediated a11y fixture</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
</head>
<body class="p-3">
{after_html}
</body>
</html>
"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--rule-id", required=True)
    parser.add_argument("--fixture-dir", required=True, type=Path)
    parser.add_argument("--fixture-mode", default="standalone")
    args = parser.parse_args()

    if args.fixture_mode != "standalone":
        raise SystemExit("a11y apply-harness: only standalone mode in v1")

    md_path = RULE_PAGES_DIR / f"{kebab_from_rule_id(args.rule_id)}.md"
    raw = md_path.read_text(encoding="utf-8")
    after_html = extract_after_example_html(raw)
    if not after_html:
        raise SystemExit(f"No After example in {md_path}")

    front, _ = parse_front_matter(raw)
    title = front.get("title") or args.rule_id
    page = render_remediated_page(args.rule_id, after_html, title)
    out = args.fixture_dir / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf-8")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
