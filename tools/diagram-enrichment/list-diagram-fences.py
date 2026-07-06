#!/usr/bin/env python3
"""List ``blueprint-diagram`` fences in a repo's Markdown sources.

Used by the diagram-enrichment runner to build per-file worklists and to
report enrichment status. Submodule copies (blueprints/, kitchensink/,
forge-*/ product submodules) and generated ``website/`` trees are skipped.

Usage:
    python3 list-diagram-fences.py <repo-root> [--json] [--pending-only]

Output (default TSV): path<TAB>fence_count<TAB>enriched_count
With --json: [{"path": ..., "fences": [{"line": N, "enriched": bool,
"has_ascii": bool, "has_src": bool}]}]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

_SKIP_DIRS = {
    ".git",
    "node_modules",
    "website",
    "showcase",
    "blueprints",
    "kitchensink",
    "forge-lcdl",
    "forge-fleet",
    "forge-lenses",
    "forge-platform",
    "forge-dark-factory",
    ".venv",
    "__pycache__",
}

_FENCE_OPEN = re.compile(r"^```blueprint-diagram\s*$")
_FENCE_CLOSE = re.compile(r"^```\s*$")


def _scan_file(path: Path) -> list[dict[str, object]]:
    fences: list[dict[str, object]] = []
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except (OSError, UnicodeDecodeError):
        return fences
    in_fence = False
    current: dict[str, object] = {}
    for i, line in enumerate(lines, start=1):
        if not in_fence:
            if _FENCE_OPEN.match(line.strip()):
                in_fence = True
                current = {
                    "line": i,
                    "enriched": False,
                    "has_ascii": False,
                    "has_src": False,
                }
        else:
            stripped = line.strip()
            if _FENCE_CLOSE.match(stripped):
                in_fence = False
                fences.append(current)
                continue
            if re.match(r"^node\s*:", stripped, re.IGNORECASE):
                current["enriched"] = True
            elif re.match(r"^fallback_ascii\s*:", stripped, re.IGNORECASE):
                current["has_ascii"] = True
            elif re.match(r"^src\s*:", stripped, re.IGNORECASE):
                current["has_src"] = True
    return fences


def _iter_markdown(root: Path):
    for path in sorted(root.rglob("*.md")):
        rel_parts = path.relative_to(root).parts
        if any(part in _SKIP_DIRS for part in rel_parts[:-1]):
            continue
        yield path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", type=Path)
    ap.add_argument("--json", action="store_true")
    ap.add_argument(
        "--pending-only",
        action="store_true",
        help="Only list files that still have unenriched, src-less fences",
    )
    args = ap.parse_args()
    root = args.repo.resolve()
    if not root.is_dir():
        print(f"not a directory: {root}", file=sys.stderr)
        return 2

    results = []
    for path in _iter_markdown(root):
        fences = _scan_file(path)
        if not fences:
            continue
        pending = [f for f in fences if not f["enriched"] and not f["has_src"]]
        if args.pending_only and not pending:
            continue
        results.append(
            {
                "path": str(path.relative_to(root)),
                "fences": fences,
                "pending": len(pending),
            }
        )

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        for r in results:
            enriched = sum(1 for f in r["fences"] if f["enriched"])
            print(f'{r["path"]}\t{len(r["fences"])}\t{enriched}')
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
