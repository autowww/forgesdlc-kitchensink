"""CLI: ``python3 -m forge_autodoc``."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from forge_autodoc.config import HandbookBuildConfig, load_handbook_config
from forge_autodoc.simple_build import run_simple_build


def _fa_repo_root() -> Path:
    """Directory containing the ``forge_autodoc`` package (``…/forge-autodoc``)."""
    return Path(__file__).resolve().parent.parent


def _default_kitchensink_root(fa_root: Path) -> Path:
    """Resolve KS root: sibling ``kitchensink`` when fa is standalone, else parent repo when fa lives under ks."""
    nested = fa_root / "kitchensink"
    if nested.is_dir():
        return nested
    parent = fa_root.parent
    if (parent / "components").is_dir() and (parent / "css").is_dir():
        return parent
    return nested


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="forge-autodoc", description="KS-based Markdown handbooks")
    sub = parser.add_subparsers(dest="cmd", required=True)

    b = sub.add_parser("build", help="Build handbook from a content tree")
    b.add_argument("--config", type=Path, help="YAML config file")
    b.add_argument("--content", type=Path, help="Markdown root directory")
    b.add_argument("--out", type=Path, help="Output directory for HTML + assets")
    b.add_argument(
        "--kitchensink",
        type=Path,
        help="Kitchensink repo root (default: ./kitchensink, else forge-autodoc/kitchensink, else ks repo root when fa is under kitchensink)",
    )
    b.add_argument("--handbook-name", default="Handbook", help="Display name when no README H1")
    b.add_argument("--dry-run", action="store_true", help="List pages only")
    args = parser.parse_args(argv)

    if args.cmd != "build":
        parser.error("unknown command")

    if args.config:
        cfg = load_handbook_config(args.config)
    else:
        if not args.content or not args.out:
            b.error("--content and --out are required without --config")
        fa_root = _fa_repo_root()
        ks = args.kitchensink or (Path.cwd() / "kitchensink")
        if not ks.is_dir():
            ks = _default_kitchensink_root(fa_root)
        cfg = HandbookBuildConfig(
            content_root=args.content.resolve(),
            output_dir=args.out.resolve(),
            kitchensink=ks.resolve(),
            handbook_name=args.handbook_name,
        )

    n = run_simple_build(cfg, dry_run=args.dry_run)
    print(f"\n{'Would generate' if args.dry_run else 'Generated'} {n} pages.")
    if not args.dry_run:
        print(f"Output: {cfg.output_dir}/")


if __name__ == "__main__":
    main(sys.argv[1:])
