"""Collect Markdown files and derive slugs / titles."""

from __future__ import annotations

import re
from pathlib import Path

DEFAULT_SKIP_DIR_NAMES: frozenset[str] = frozenset(
    {
        "docs",
        "node_modules",
        ".git",
        "__pycache__",
        "scripts",
        "generator",
        "website",
        "wiki-source",
    }
)


def collect_markdown_files(
    area_root: Path,
    *,
    skip_dir_names: frozenset[str] | None = None,
) -> list[Path]:
    """Collect all ``.md`` files under *area_root*, excluding *skip_dir_names* path parts."""
    skip = skip_dir_names if skip_dir_names is not None else DEFAULT_SKIP_DIR_NAMES
    files: list[Path] = []
    for p in sorted(area_root.rglob("*.md")):
        rel = p.relative_to(area_root)
        if any(part in skip for part in rel.parts):
            continue
        files.append(p)
    return files


def slug_from_md_path(md_path: Path, area_root: Path) -> str:
    """Page-level slug (filename) from markdown path relative to *area_root*.

    README.md at root → index.html; nested README.md → dir-dir.html.
    If ``foo.md`` sits next to ``foo/README.md``, ``foo.md`` becomes ``foo-intro.html``.
    """
    rel = md_path.relative_to(area_root)
    parts = list(rel.parts)
    name = parts[-1]

    if name.lower() == "readme.md":
        if len(parts) == 1:
            return "index.html"
        return "-".join(p.lower() for p in parts[:-1]) + ".html"

    stem = Path(name).stem.lower()
    sibling_dir = md_path.parent / Path(name).stem
    has_sibling_dir = sibling_dir.is_dir() and (sibling_dir / "README.md").exists()
    suffix = "-intro" if has_sibling_dir else ""

    if len(parts) == 1:
        return stem + suffix + ".html"
    prefix = "-".join(p.lower() for p in parts[:-1])
    return prefix + "-" + stem + suffix + ".html"


def title_from_filename(name: str) -> str:
    """Human-readable title from a filename stem."""
    stem = Path(name).stem
    if stem.upper() == "README":
        return "Overview"
    stem = stem.replace("-", " ").replace("_", " ")
    stem = re.sub(r"\.template$", " (template)", stem, flags=re.IGNORECASE)
    words = stem.split()
    result: list[str] = []
    for w in words:
        if w.isupper() and len(w) > 1:
            result.append(w)
        else:
            result.append(w.capitalize())
    return " ".join(result)


def strip_leading_yaml_frontmatter(text: str) -> str:
    """Remove a leading ``---`` … ``---`` YAML block if present (common in handbook Markdown)."""
    if not text.startswith("---"):
        return text
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return text
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return "\n".join(lines[i + 1 :]).lstrip("\n")
    return text


def split_yaml_frontmatter(text: str) -> tuple[dict[str, str], str]:
    """Parse leading ``---`` YAML block into a flat ``key: value`` map; return ``(meta, body)``.

    Values are stripped; supports simple unquoted scalars only (sufficient for handbook frontmatter).
    """
    if not text.startswith("---"):
        return {}, text
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, text
    end: int | None = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is None:
        return {}, text
    meta: dict[str, str] = {}
    for line in lines[1:end]:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, val = line.partition(":")
        k = key.strip()
        v = val.strip()
        if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
            v = v[1:-1]
        meta[k] = v
    body = "\n".join(lines[end + 1 :]).lstrip("\n")
    return meta, body


def title_from_md_content(text: str, fallback: str) -> str:
    """First H1 from markdown, or *fallback*.

    YAML frontmatter at the top is skipped so the H1 after ``---`` is recognized.
    """
    body = strip_leading_yaml_frontmatter(text)
    m = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    if m:
        return m.group(1).strip()
    return fallback


def handbook_title_from_readme(area_root: Path) -> str:
    """Handbook title from directory name or ``README.md`` H1."""
    readme = area_root / "README.md"
    if readme.exists():
        text = readme.read_text(encoding="utf-8")
        return title_from_md_content(text, area_root.name.replace("-", " ").title())
    return area_root.name.replace("-", " ").title()
