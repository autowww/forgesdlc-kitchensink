"""Hierarchical handbook sidebar HTML (Bootstrap collapsible groups)."""

from __future__ import annotations

import html as html_mod
from pathlib import Path

FLAT_SIDEBAR_THRESHOLD = 15

PageItem = tuple[str, str, str]  # (href/slug, title, md_rel for grouping)


def _esc(s: str) -> str:
    return html_mod.escape(s, quote=True)


def _build_tree(pages: list[PageItem]) -> dict:
    tree: dict = {"__items__": []}
    for fslug, title, md_rel in pages:
        parts = Path(md_rel).parts
        if len(parts) == 1:
            tree["__items__"].append((fslug, title, md_rel))
        else:
            node = tree
            for part in parts[:-1]:
                if part not in node:
                    node[part] = {"__items__": []}
                node = node[part]
            node["__items__"].append((fslug, title, md_rel))
    return tree


def _group_label(directory_name: str) -> str:
    return directory_name.replace("-", " ").replace("_", " ").title()


def _collect_slugs(tree: dict) -> set[str]:
    slugs = {fslug for fslug, _, _ in tree.get("__items__", [])}
    for k in tree:
        if k != "__items__":
            slugs |= _collect_slugs(tree[k])
    return slugs


def _count_items(tree: dict) -> int:
    count = len(tree.get("__items__", []))
    for k in tree:
        if k != "__items__":
            count += _count_items(tree[k])
    return count


def _render_sidebar_tree(
    tree: dict,
    current_slug: str,
    *,
    depth: int = 0,
    path_prefix: str = "",
    id_prefix: str = "nav",
) -> str:
    parts: list[str] = []
    link_cls = "doc-sidebar-link" if depth == 0 else "doc-sidebar-sublink"

    for fslug, title, _md_rel in tree.get("__items__", []):
        active = " active" if fslug == current_slug else ""
        aria = ' aria-current="page"' if active else ""
        parts.append(
            f'<a href="{_esc(fslug)}" class="{link_cls}{active}"{aria}>{_esc(title)}</a>'
        )

    sub_keys = [k for k in tree if k not in ("__items__", "__index__")]
    sub_keys.sort(key=lambda k: (0 if k.lower() == "readme.md" else 1, k.lower()))

    for sub_name in sub_keys:
        sub_tree = tree[sub_name]
        collapse_id = (
            f"{id_prefix}-{path_prefix}{sub_name}"
            .replace("/", "-")
            .replace(" ", "-")
            .replace(".", "-")
        )

        all_slugs_in_subtree = _collect_slugs(sub_tree)
        is_open = current_slug in all_slugs_in_subtree

        label = _group_label(sub_name)

        index_page = sub_tree.get("__index__")
        if index_page:
            label = index_page[1]
            if index_page[0] == current_slug:
                is_open = True

        sub_groups = [k for k in sub_tree if k not in ("__items__", "__index__")]
        total_items = _count_items(sub_tree)

        if total_items <= 2 and not sub_groups:
            if index_page:
                hub_active = " active" if index_page[0] == current_slug else ""
                hub_aria = ' aria-current="page"' if hub_active else ""
                parts.append(
                    f'<a href="{_esc(index_page[0])}" class="{link_cls}{hub_active}"{hub_aria}>'
                    f"{_esc(index_page[1])}</a>"
                )
            for fslug, title, _md in sub_tree.get("__items__", []):
                active = " active" if fslug == current_slug else ""
                aria = ' aria-current="page"' if active else ""
                parts.append(
                    f'<a href="{_esc(fslug)}" class="{link_cls}{active}"{aria}>{_esc(title)}</a>'
                )
            continue

        show = " show" if is_open else ""
        expanded = "true" if is_open else "false"
        group_cls = "doc-sidebar-group" if depth == 0 else "doc-sidebar-nested"

        chevron_svg = (
            '<svg class="doc-sidebar-chevron" width="14" height="14" '
            'viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" '
            'd="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6'
            'a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>'
        )

        if index_page:
            hub_active = " active" if index_page[0] == current_slug else ""
            hub_aria = ' aria-current="page"' if hub_active else ""
            parts.append(
                f'<div class="{group_cls}">'
                f'<div class="doc-sidebar-row">'
                f'<button type="button" class="doc-sidebar-toggle" '
                f'data-bs-toggle="collapse" data-bs-target="#{_esc(collapse_id)}" '
                f'aria-expanded="{expanded}" aria-controls="{_esc(collapse_id)}" '
                f'aria-label="Toggle {_esc(label)}">{chevron_svg}</button>'
                f'<a href="{_esc(index_page[0])}" class="doc-sidebar-heading{hub_active}"{hub_aria}>'
                f"{_esc(label)}</a>"
                f"</div>"
                f'<div class="collapse{show}" id="{_esc(collapse_id)}">'
                f'<div class="doc-sidebar-children">'
            )
        else:
            parts.append(
                f'<div class="{group_cls}">'
                f'<div class="doc-sidebar-row">'
                f'<button type="button" class="doc-sidebar-toggle" '
                f'data-bs-toggle="collapse" data-bs-target="#{_esc(collapse_id)}" '
                f'aria-expanded="{expanded}" aria-controls="{_esc(collapse_id)}" '
                f'aria-label="Toggle {_esc(label)}">{chevron_svg}</button>'
                f'<span class="doc-sidebar-heading doc-sidebar-heading--label">{_esc(label)}</span>'
                f"</div>"
                f'<div class="collapse{show}" id="{_esc(collapse_id)}">'
                f'<div class="doc-sidebar-children">'
            )

        child_html = _render_sidebar_tree(
            sub_tree,
            current_slug,
            depth=depth + 1,
            path_prefix=f"{path_prefix}{sub_name}-",
            id_prefix=id_prefix,
        )
        parts.append(child_html)
        parts.append("</div></div></div>")

    return "\n".join(parts)


def build_sidebar_links(
    pages: list[PageItem],
    current_slug: str,
    *,
    id_prefix: str = "nav",
    flat_threshold: int = FLAT_SIDEBAR_THRESHOLD,
) -> str:
    """Sidebar navigation: flat links or collapsible tree from *pages*."""
    if len(pages) <= flat_threshold:
        links = []
        for fslug, title, _md_rel in pages:
            active = " active" if fslug == current_slug else ""
            aria = ' aria-current="page"' if active else ""
            links.append(
                f'<a href="{_esc(fslug)}" class="doc-sidebar-link{active}"{aria}>'
                f"{_esc(title)}</a>"
            )
        return "\n          ".join(links)

    tree = _build_tree(pages)
    return _render_sidebar_tree(tree, current_slug, id_prefix=id_prefix)
