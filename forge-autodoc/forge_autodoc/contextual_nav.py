"""Compact handbook rail (leaf pages) and related-links section HTML."""

from __future__ import annotations

import html as html_mod
import re
from pathlib import Path

# Child of split-topic parent: e.g. 03-workspace-setup_01-layouts.md → 03-workspace-setup.md
_SPLIT_TOPIC_CHILD = re.compile(r"^(.+)_\d{2}-.+\.md$", re.IGNORECASE)


def _esc(s: str) -> str:
    return html_mod.escape(s, quote=True)


def split_topic_parent_basename(basename: str) -> str | None:
    """If *basename* is a split child (``NN-topic_01-….md``), return parent ``NN-topic.md``."""
    m = _SPLIT_TOPIC_CHILD.match(basename)
    if not m:
        return None
    return m.group(1) + ".md"


def render_handbook_breadcrumb_html(
    items: list[tuple[str | None, str]],
    *,
    wrapper_class: str = "handbook-compact-rail__breadcrumb",
) -> str:
    """Bootstrap breadcrumb. Use ``href=None`` for the active (current) item."""
    lis: list[str] = []
    for href, label in items:
        if href is None:
            lis.append(
                f'<li class="breadcrumb-item active" aria-current="page">{_esc(label)}</li>'
            )
        else:
            lis.append(
                f'<li class="breadcrumb-item"><a href="{_esc(href)}">{_esc(label)}</a></li>'
            )
    return (
        f'<nav class="{_esc(wrapper_class)}" aria-label="Breadcrumb">'
        f'<ol class="breadcrumb handbook-compact-rail-breadcrumb small mb-2 mb-lg-3 px-0">'
        f'{"".join(lis)}</ol></nav>'
    )


def build_compact_handbook_rail_inner_html(
    *,
    breadcrumb_items: list[tuple[str | None, str]],
    parent_href: str,
    parent_label: str,
    prev_link: tuple[str, str] | None,
    next_link: tuple[str, str] | None,
    browse_href: str,
    browse_label: str,
) -> str:
    """Inner HTML for sidebar and offcanvas (same content in both)."""
    parts: list[str] = [
        '<div class="handbook-compact-rail px-2 py-2">',
        render_handbook_breadcrumb_html(breadcrumb_items),
        f'<p class="mb-2"><a href="{_esc(parent_href)}" class="doc-sidebar-link fw-semibold">'
        f"↑ {_esc(parent_label)}</a></p>",
        '<div class="d-flex flex-column gap-2 handbook-compact-rail__prevnext">',
    ]
    if prev_link:
        parts.append(
            f'<a href="{_esc(prev_link[0])}" class="btn btn-cyan-outline btn-sm text-start">'
            f"← {_esc(prev_link[1])}</a>"
        )
    if next_link:
        parts.append(
            f'<a href="{_esc(next_link[0])}" class="btn btn-forge-outline btn-sm text-start">'
            f"{_esc(next_link[1])} →</a>"
        )
    parts.append("</div>")
    parts.append(
        f'<p class="mt-3 mb-0 small">'
        f'<a href="{_esc(browse_href)}" class="doc-sidebar-sublink">{_esc(browse_label)}</a>'
        f"</p>"
    )
    parts.append("</div>")
    return "\n".join(parts)


def lenses_split_family_pages(
    md_rel: str,
    pages: list[tuple[str, str, str]],
) -> list[tuple[str, str, str]]:
    """Pages in the same split-topic family (``NN-topic.md`` plus ``NN-topic_01-….md``)."""
    md_path = Path(md_rel)
    basename = md_path.name
    parent_bn = split_topic_parent_basename(basename)
    key = parent_bn if parent_bn else basename
    stem = Path(key).stem
    parent_dir = md_path.parent
    out = [
        p
        for p in pages
        if Path(p[2]).parent == parent_dir
        and (Path(p[2]).name == key or Path(p[2]).name.startswith(f"{stem}_"))
    ]
    return sorted(out, key=lambda x: x[2])


def related_pages_section_html(
    items: list[tuple[str, str]],
    *,
    heading: str = "Related pages",
    section_class: str = "handbook-related",
) -> str:
    """Section listing sibling/related links (append before chapter nav buttons)."""
    if not items:
        return ""
    lis = "".join(
        f'<li class="mb-1"><a href="{_esc(href)}">{_esc(title)}</a></li>' for href, title in items
    )
    return (
        f'<section class="{_esc(section_class)} mt-5 pt-4" '
        f'style="border-top:1px solid var(--forge-border)" '
        f'aria-labelledby="handbook-related-heading">'
        f'<h2 id="handbook-related-heading" class="h6 font-display mb-3">{_esc(heading)}</h2>'
        f"<ul class=\"mb-0 list-unstyled\">{lis}</ul>"
        f"</section>"
    )
