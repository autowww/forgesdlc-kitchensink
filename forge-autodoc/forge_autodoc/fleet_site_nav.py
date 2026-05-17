"""Product-style handbook top navigation (Forge Fleet ``docs/site-nav.yaml``)."""

from __future__ import annotations

import html as html_mod
from dataclasses import dataclass
from pathlib import Path

import yaml

from forge_autodoc.nav_manifest import LensNavManifest


def _norm_rel(p: str) -> str:
    return p.strip().replace("\\", "/")


def _esc(s: str) -> str:
    return html_mod.escape(s, quote=True)


@dataclass(frozen=True)
class FleetTopNavItem:
    id: str
    label: str
    single_href_md: str | None
    hub_href_md: str | None
    sidebar_prefix: str | None
    dropdown_cap: int
    children: tuple[tuple[str, str], ...]
    lens_manifest_sections: tuple[str, ...] = ()
    """Optional Forge Lenses ``docs/nav.yml`` section ids feeding the contextual left rail."""


@dataclass(frozen=True)
class FleetSiteNav:
    version: int
    brand_label: str
    top_level: tuple[FleetTopNavItem, ...]
    home_href_md: str | None = None
    """Navbar brand href target (defaults to ``README.md`` when omitted)."""


def load_fleet_site_nav(path: Path) -> FleetSiteNav:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise ValueError(f"site nav root must be a mapping: {path}")
    ver = int(raw.get("version", 1))
    brand = str(raw.get("brand_label", "Forge Fleet"))
    items_raw = raw.get("top_level")
    if not isinstance(items_raw, list):
        raise ValueError(f"site nav missing top_level list: {path}")
    items: list[FleetTopNavItem] = []
    for i, block in enumerate(items_raw):
        if not isinstance(block, dict):
            raise ValueError(f"top_level[{i}] must be a mapping in {path}")
        tid = str(block.get("id", f"nav-{i}"))
        label = str(block.get("label", tid))
        single = block.get("single_href_md")
        hub = block.get("hub_href_md")
        sp = block.get("sidebar_prefix")
        cap = int(block.get("dropdown_max_items", 14))
        ch_raw = block.get("children")
        children: list[tuple[str, str]] = []
        if isinstance(ch_raw, list):
            for j, cr in enumerate(ch_raw):
                if isinstance(cr, dict):
                    cl = str(cr.get("label", f"item-{j}"))
                    hm = cr.get("href_md")
                    if not hm:
                        raise ValueError(f"{tid} child {j} needs href_md")
                    children.append((cl, _norm_rel(str(hm))))
                else:
                    raise ValueError(f"{tid} child {j} must be a mapping with label/href_md")
        lms_raw = block.get("lens_manifest_sections")
        lens_secs: tuple[str, ...] = ()
        if isinstance(lms_raw, list):
            lens_secs = tuple(str(x).strip() for x in lms_raw if str(x).strip())
        elif lms_raw is not None:
            raise ValueError(f"{tid}: lens_manifest_sections must be a list of strings or omitted")
        items.append(
            FleetTopNavItem(
                id=tid,
                label=label,
                single_href_md=_norm_rel(str(single)) if single else None,
                hub_href_md=_norm_rel(str(hub)) if hub else None,
                sidebar_prefix=_norm_rel(str(sp)).rstrip("/") + "/" if sp else None,
                dropdown_cap=max(4, cap),
                children=tuple(children),
                lens_manifest_sections=lens_secs,
            )
        )
    home_raw = raw.get("home_href_md")
    home_href = _norm_rel(str(home_raw)) if home_raw else None
    return FleetSiteNav(version=ver, brand_label=brand, top_level=tuple(items), home_href_md=home_href)


def slug_for(md_rel: str, slug_by_md: dict[str, str]) -> str | None:
    return slug_by_md.get(_norm_rel(md_rel))


def home_slug_for_site_nav(manifest: FleetSiteNav, slug_by_md: dict[str, str]) -> str:
    """Resolve navbar brand href using ``home_href_md``, then common handbook roots."""
    candidates: list[str] = []
    if manifest.home_href_md:
        candidates.append(_norm_rel(manifest.home_href_md))
    candidates.extend(["README.md", "docs/index.md"])
    for cand in candidates:
        sl = slug_for(cand, slug_by_md)
        if sl:
            return sl
    return "index.html"


def lenses_section_hub_from_manifest(
    manifest: FleetSiteNav,
    md_rel: str,
    slug_by_md: dict[str, str],
    lens_manifest: LensNavManifest,
) -> tuple[str | None, str | None]:
    """Active horizontal menu label + hub slug for Forge Lenses docs."""
    aid = _active_top_id(manifest, md_rel, lens_manifest=lens_manifest)
    sec_item = next((x for x in manifest.top_level if x.id == aid), None)
    if sec_item is None:
        return None, None
    hub_slug = (
        slug_for(sec_item.hub_href_md or "", slug_by_md) if sec_item.hub_href_md else None
    )
    return sec_item.label, hub_slug


def _dropdown_items_for_section(
    item: FleetTopNavItem,
    nav_pages: list[tuple[str, str, str]],
) -> list[tuple[str, str]]:
    if not item.sidebar_prefix:
        return []
    prefix = item.sidebar_prefix
    hub = _norm_rel(item.hub_href_md) if item.hub_href_md else ""

    def sort_key(row: tuple[str, str, str]) -> tuple[int, str]:
        mr = _norm_rel(row[2])
        is_hub = 0 if mr == hub else 1
        return (is_hub, mr.lower())

    rows = sorted(
        [
            p
            for p in nav_pages
            if _norm_rel(p[2]).startswith(prefix) or _norm_rel(p[2]) == prefix.rstrip("/")
        ],
        key=sort_key,
    )
    out: list[tuple[str, str]] = []
    for slug, title, _md in rows[: item.dropdown_cap]:
        out.append((slug, title))
    return out


def _active_top_id(
    manifest: FleetSiteNav,
    md_rel: str,
    *,
    lens_manifest: LensNavManifest | None = None,
) -> str | None:
    rel = _norm_rel(md_rel)
    if lens_manifest is not None:
        for item in manifest.top_level:
            if item.single_href_md and rel == _norm_rel(item.single_href_md):
                return item.id
            for _label, hm in item.children:
                if rel == _norm_rel(hm):
                    return item.id
            if item.hub_href_md and rel == _norm_rel(item.hub_href_md):
                return item.id
            if item.lens_manifest_sections:
                paths = lens_manifest.paths_in_sections(item.lens_manifest_sections)
                if rel in paths:
                    return item.id
        return None

    if rel == "CHANGELOG.md":
        return "more"
    best: tuple[int, str] | None = None
    for item in manifest.top_level:
        if item.single_href_md and rel == item.single_href_md:
            return item.id
        if item.id == "more":
            for _label, hm in item.children:
                ch = _norm_rel(hm)
                if rel == ch:
                    return "more"
                if ch.endswith("/README.md"):
                    dir_pref = ch[: -len("README.md")]
                    if rel.startswith(dir_pref):
                        return "more"
                elif "/" in ch:
                    dir_pref = ch.rsplit("/", 1)[0] + "/"
                    if rel.startswith(dir_pref):
                        return "more"
            continue
        if item.sidebar_prefix:
            pref = item.sidebar_prefix
            if rel.startswith(pref) or rel.rstrip("/") == pref.rstrip("/"):
                score = len(pref)
                if best is None or score > best[0]:
                    best = (score, item.id)
    return best[1] if best else None


def build_top_nav_html(
    manifest: FleetSiteNav,
    nav_pages: list[tuple[str, str, str]],
    slug_by_md: dict[str, str],
    current_md_rel: str,
    *,
    nav_id: str = "fleet-handbook-topnav",
    lens_manifest: LensNavManifest | None = None,
) -> str:
    """Bootstrap 5 navbar: primary links, section dropdowns, More menu."""
    active = _active_top_id(manifest, current_md_rel, lens_manifest=lens_manifest)
    lis: list[str] = []
    home_slug = home_slug_for_site_nav(manifest, slug_by_md)
    brand = (
        f'<a class="navbar-brand text-amber fw-semibold me-lg-3" href="{_esc(home_slug)}">'
        f'{_esc(manifest.brand_label)}</a>'
    )
    for item in manifest.top_level:
        iid = item.id
        is_active = iid == active
        act = " active" if is_active else ""
        if item.single_href_md:
            sl = slug_for(item.single_href_md, slug_by_md)
            if sl:
                lis.append(
                    f'<li class="nav-item"><a class="nav-link{act}" href="{_esc(sl)}">'
                    f"{_esc(item.label)}</a></li>"
                )
            continue
        if item.children and not item.sidebar_prefix:
            dd_items: list[str] = []
            for label, hm in item.children[: item.dropdown_cap]:
                sl = slug_for(hm, slug_by_md)
                if sl:
                    dd_items.append(
                        f'<li><a class="dropdown-item" href="{_esc(sl)}">{_esc(label)}</a></li>'
                    )
            if dd_items:
                lis.append(
                    f'<li class="nav-item dropdown">'
                    f'<a class="nav-link dropdown-toggle{act}" href="#" id="{_esc(nav_id)}-{_esc(iid)}" '
                    'role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" '
                    'aria-expanded="false">'
                    f"{_esc(item.label)}</a>"
                    f'<ul class="dropdown-menu dropdown-menu-dark" '
                    f'aria-labelledby="{_esc(nav_id)}-{_esc(iid)}">'
                    f"{''.join(dd_items)}</ul></li>"
                )
            elif item.hub_href_md:
                hub_only = slug_for(item.hub_href_md, slug_by_md)
                if hub_only:
                    lis.append(
                        f'<li class="nav-item"><a class="nav-link{act}" href="{_esc(hub_only)}">'
                        f"{_esc(item.label)}</a></li>"
                    )
            continue
        if item.id == "more" and item.children:
            dd_items: list[str] = []
            for label, hm in item.children:
                sl = slug_for(hm, slug_by_md)
                if sl:
                    dd_items.append(
                        f'<li><a class="dropdown-item" href="{_esc(sl)}">{_esc(label)}</a></li>'
                    )
            if dd_items:
                lis.append(
                    f'<li class="nav-item dropdown">'
                    f'<a class="nav-link dropdown-toggle{act}" href="#" id="{_esc(nav_id)}-more" '
                    'role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" '
                    'aria-expanded="false">'
                    f"{_esc(item.label)}</a>"
                    f'<ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="{_esc(nav_id)}-more">'
                    f"{''.join(dd_items)}</ul></li>"
                )
            continue
        hub_slug = slug_for(item.hub_href_md or "", slug_by_md) if item.hub_href_md else None
        drop = _dropdown_items_for_section(item, nav_pages)
        if hub_slug and drop:
            dd_lines: list[str] = [
                f'<li><a class="dropdown-item fw-semibold" href="{_esc(hub_slug)}">'
                f"Section overview</a></li>"
                f'<li><hr class="dropdown-divider" /></li>'
            ]
            hub_path = _norm_rel(item.hub_href_md or "")
            for slug, title in drop:
                md_for_slug = next((p[2] for p in nav_pages if p[0] == slug), "")
                if hub_path and _norm_rel(md_for_slug) == hub_path:
                    continue
                dd_lines.append(
                    f'<li><a class="dropdown-item" href="{_esc(slug)}">{_esc(title)}</a></li>'
                )
            lis.append(
                f'<li class="nav-item dropdown">'
                f'<a class="nav-link dropdown-toggle{act}" href="#" id="{_esc(nav_id)}-{_esc(iid)}" '
                'role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" '
                'aria-expanded="false">'
                f"{_esc(item.label)}</a>"
                f'<ul class="dropdown-menu dropdown-menu-dark" '
                f'aria-labelledby="{_esc(nav_id)}-{_esc(iid)}">'
                f"{''.join(dd_lines)}</ul></li>"
            )
        elif hub_slug:
            lis.append(
                f'<li class="nav-item"><a class="nav-link{act}" href="{_esc(hub_slug)}">'
                f"{_esc(item.label)}</a></li>"
            )
    toggler = (
        '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" '
        f'data-bs-target="#{nav_id}-collapse" aria-controls="{nav_id}-collapse" '
        'aria-expanded="false" aria-label="Toggle site navigation">'
        '<span class="navbar-toggler-icon"></span></button>'
    )
    return (
        f'<header class="fleet-handbook-topnav border-bottom border-secondary">'
        f'<nav class="navbar navbar-expand-lg navbar-dark py-2 fleet-handbook-topnav__bar" '
        f'id="{_esc(nav_id)}" aria-label="Site">'
        f'<div class="container-fluid px-2 px-md-3 gx-2">'
        f'{brand}{toggler}'
        f'<div class="collapse navbar-collapse" id="{nav_id}-collapse">'
        f'<ul class="navbar-nav ms-auto flex-wrap column-gap-1 row-gap-1">'
        f"{''.join(lis)}</ul></div></div></nav></header>"
    )


def build_breadcrumb_html(
    slug_by_md: dict[str, str],
    current_md_rel: str,
    page_title: str,
    manifest: FleetSiteNav,
    origin: str,
    url_prefix: str,
    *,
    lens_manifest: LensNavManifest | None = None,
) -> str:
    """Accessible breadcrumb under the global header."""
    rel = _norm_rel(current_md_rel)
    crumbs: list[tuple[str, str]] = []
    home_slug = home_slug_for_site_nav(manifest, slug_by_md)
    prefix = (url_prefix or "").rstrip("/")
    origin = origin.rstrip("/")
    home_url = f"{origin}/{prefix}/{home_slug}" if prefix else f"{origin}/{home_slug}"

    crumbs.append(("Home", home_url))
    section_label: str | None = None
    section_slug: str | None = None
    if lens_manifest is not None:
        section_label, section_slug = lenses_section_hub_from_manifest(
            manifest, rel, slug_by_md, lens_manifest
        )
    else:
        for item in manifest.top_level:
            if item.single_href_md and rel == item.single_href_md:
                section_label = None
                section_slug = None
                break
            if item.sidebar_prefix and (
                rel.startswith(item.sidebar_prefix) or rel == item.sidebar_prefix.rstrip("/")
            ):
                section_label = item.label
                if item.hub_href_md:
                    section_slug = slug_for(item.hub_href_md, slug_by_md)
                break
    if section_label is None and rel != "README.md":
        if rel.startswith("docs/maintainers/"):
            section_label = "Maintainers"
            section_slug = slug_for("docs/maintainers/README.md", slug_by_md)
        elif rel.startswith("docs/design/"):
            section_label = "Design"
            section_slug = slug_for("docs/design/README.md", slug_by_md)
        elif rel == "CHANGELOG.md":
            section_label = "Changelog"
            section_slug = slug_for("CHANGELOG.md", slug_by_md)
    if section_label and section_slug:
        sec_url = (
            f"{origin}/{prefix}/{section_slug}" if prefix else f"{origin}/{section_slug}"
        )
        crumbs.append((section_label, sec_url))
    cur_slug = slug_for(rel, slug_by_md)
    if cur_slug:
        cur_url = f"{origin}/{prefix}/{cur_slug}" if prefix else f"{origin}/{cur_slug}"
        if cur_url == home_url:
            pass
        elif not crumbs or crumbs[-1][1] != cur_url:
            crumbs.append((page_title, cur_url))
    items: list[str] = []
    for i, (name, url) in enumerate(crumbs):
        if i == len(crumbs) - 1:
            items.append(
                f'<li class="breadcrumb-item active" aria-current="page">{_esc(name)}</li>'
            )
        else:
            items.append(f'<li class="breadcrumb-item"><a href="{_esc(url)}">{_esc(name)}</a></li>')
    return (
        f'<div class="fleet-handbook-breadcrumb">'
        f'<div class="container-fluid px-2 px-md-3 py-2">'
        f'<nav aria-label="Breadcrumb"><ol class="breadcrumb mb-0 small">'
        f"{''.join(items)}</ol></nav></div></div>"
    )


def fleet_json_ld_breadcrumb(
    slug_by_md: dict[str, str],
    current_md_rel: str,
    page_title: str,
    manifest: FleetSiteNav,
    origin: str,
    url_prefix: str,
    *,
    lens_manifest: LensNavManifest | None = None,
) -> list[tuple[str, str]]:
    """Pairs for :func:`seo_meta.handbook_json_ld` breadcrumb argument."""
    rel = _norm_rel(current_md_rel)
    out: list[tuple[str, str]] = []
    home_slug = home_slug_for_site_nav(manifest, slug_by_md)
    prefix = (url_prefix or "").rstrip("/")
    origin = origin.rstrip("/")
    home_url = f"{origin}/{prefix}/{home_slug}" if prefix else f"{origin}/{home_slug}"
    out.append((manifest.brand_label, home_url))
    section_label: str | None = None
    section_slug: str | None = None
    if lens_manifest is not None:
        section_label, section_slug = lenses_section_hub_from_manifest(
            manifest, rel, slug_by_md, lens_manifest
        )
    else:
        for item in manifest.top_level:
            if item.sidebar_prefix and (
                rel.startswith(item.sidebar_prefix) or rel == item.sidebar_prefix.rstrip("/")
            ):
                section_label = item.label
                if item.hub_href_md:
                    section_slug = slug_for(item.hub_href_md, slug_by_md)
                break
    if section_label is None and rel != "README.md":
        if rel.startswith("docs/maintainers/"):
            section_label = "Maintainers"
            section_slug = slug_for("docs/maintainers/README.md", slug_by_md)
        elif rel.startswith("docs/design/"):
            section_label = "Design"
            section_slug = slug_for("docs/design/README.md", slug_by_md)
        elif rel == "CHANGELOG.md":
            section_label = "Changelog"
            section_slug = slug_for("CHANGELOG.md", slug_by_md)
    if section_label and section_slug:
        sec_url = (
            f"{origin}/{prefix}/{section_slug}" if prefix else f"{origin}/{section_slug}"
        )
        out.append((section_label, sec_url))
    cur_slug = slug_for(rel, slug_by_md)
    if cur_slug:
        cur_url = f"{origin}/{prefix}/{cur_slug}" if prefix else f"{origin}/{cur_slug}"
        if cur_url == home_url:
            pass
        elif not out or out[-1][1] != cur_url:
            out.append((page_title, cur_url))
    return out


def sidebar_label_for_page(manifest: FleetSiteNav, md_rel: str, default: str) -> str:
    rel = _norm_rel(md_rel)
    if rel == "README.md":
        return "Journeys"
    for item in manifest.top_level:
        if item.sidebar_prefix and (
            rel.startswith(item.sidebar_prefix) or rel == item.sidebar_prefix.rstrip("/")
        ):
            return f"{item.label}"
    if rel.startswith("docs/maintainers/"):
        return "Maintainers"
    if rel.startswith("docs/design/"):
        return "Design"
    if rel == "CHANGELOG.md":
        return "Changelog"
    return default


def filter_nav_pages_for_sidebar(
    nav_pages: list[tuple[str, str, str]],
    current_md_rel: str,
    manifest: FleetSiteNav,
) -> list[tuple[str, str, str]]:
    """Section-local sidebar rail (manifest longest-prefix match)."""
    rel = _norm_rel(current_md_rel)
    if rel == "README.md":
        hubs: list[tuple[str, str, str]] = []
        seen: set[str] = set()
        for item in manifest.top_level:
            if item.single_href_md or not item.hub_href_md:
                continue
            nh = _norm_rel(item.hub_href_md)
            for p in nav_pages:
                if _norm_rel(p[2]) == nh and nh not in seen:
                    hubs.append(p)
                    seen.add(nh)
                    break
        for extra_rel in ("docs/start/README.md", "CHANGELOG.md"):
            for p in nav_pages:
                if _norm_rel(p[2]) == extra_rel and _norm_rel(p[2]) not in seen:
                    hubs.append(p)
                    seen.add(_norm_rel(p[2]))
                    break
        return sorted(hubs, key=lambda x: _norm_rel(x[2]).lower())
    best_len = -1
    best_prefix: str | None = None
    for item in manifest.top_level:
        sp = item.sidebar_prefix
        if not sp:
            continue
        if rel.startswith(sp) or rel == sp.rstrip("/"):
            if len(sp) > best_len:
                best_len = len(sp)
                best_prefix = sp
    if rel.startswith("docs/maintainers/") or rel == "docs/maintainers/README.md":
        best_prefix = "docs/maintainers/"
    elif rel.startswith("docs/design/"):
        best_prefix = "docs/design/"
    elif rel == "CHANGELOG.md":
        return [p for p in nav_pages if _norm_rel(p[2]) == "CHANGELOG.md"]
    if not best_prefix:
        return nav_pages
    bp = best_prefix
    out = [
        p
        for p in nav_pages
        if _norm_rel(p[2]).startswith(bp) or _norm_rel(p[2]) == bp.rstrip("/")
    ]
    return out if out else nav_pages
