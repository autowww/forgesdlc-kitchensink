#!/usr/bin/env python3
"""Normalize template-*.svg fills/strokes to Forge KS tokens (cyan/amber/slate).

Run from repo root after editing templates:
  python3 generator/apply_diagram_svg_palette.py
"""
from __future__ import annotations

from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SVG_DIR = REPO / "assets" / "svg"

# Order: longer / more specific first where relevant.
REPLACEMENTS: list[tuple[str, str]] = [
    ("rgba(44,82,130,0.6)", "rgba(6,182,212,0.45)"),
    ("rgba(44,82,130,0.25)", "rgba(6,182,212,0.22)"),
    ("rgba(44,82,130,0.12)", "rgba(6,182,212,0.12)"),
    ("rgba(40,94,97,0.5)", "rgba(6,182,212,0.38)"),
    ("rgba(40,94,97,0.25)", "rgba(6,182,212,0.2)"),
    ("rgba(40,94,97,0.12)", "rgba(6,182,212,0.1)"),
    ("rgba(116,66,16,0.25)", "rgba(245,158,11,0.28)"),
    ("rgba(116,66,16,0.12)", "rgba(245,158,11,0.15)"),
    ("#3d5a80", "#1a2235"),
    ("#2c5282", "#1e2d42"),
    ("#285e61", "#1c3148"),
    ("#744210", "rgba(245,158,11,0.22)"),
    ("#553c9a", "#232a3d"),
    ("#78350f", "rgba(245,158,11,0.38)"),
    ("#065f46", "#10B981"),
    ("#0d1f1a", "#0f172a"),
    ("#1a1633", "#1a2235"),
    ("#1f1a10", "#1c1912"),
    ("#0e7490", "rgba(6,182,212,0.55)"),
    ("#708090", "#94a3b8"),
    ("#334155", "#475569"),
    ("#a78bfa", "#F59E0B"),
    ("#1f2937", "rgba(6,182,212,0.16)"),
    ('fill="#fff"', 'fill="#F1F5F9"'),
]


def main() -> None:
    paths = sorted(SVG_DIR.glob("template-*.svg"))
    if not paths:
        raise SystemExit(f"No template-*.svg in {SVG_DIR}")
    for path in paths:
        text = path.read_text(encoding="utf-8")
        orig = text
        for old, new in REPLACEMENTS:
            text = text.replace(old, new)
        if text != orig:
            path.write_text(text, encoding="utf-8")
            print(f"updated {path.name}")
    print(f"[apply_diagram_svg_palette] done ({len(paths)} files checked)")


if __name__ == "__main__":
    main()
