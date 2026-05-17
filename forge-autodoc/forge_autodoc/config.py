"""YAML / dataclass configuration for standalone handbook builds."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Mapping

import yaml

from forge_autodoc.files import DEFAULT_SKIP_DIR_NAMES


@dataclass
class HandbookBuildConfig:
    """Inputs for ``forge-autodoc build``."""

    content_root: Path
    output_dir: Path
    kitchensink: Path
    handbook_name: str = "Handbook"
    skip_dir_names: frozenset[str] = field(default_factory=lambda: DEFAULT_SKIP_DIR_NAMES)
    nav_exclude_path_prefixes: frozenset[str] = field(default_factory=frozenset)
    """Relative POSIX path prefixes (with ``/``). Pages whose Markdown path starts with any prefix are still emitted but omitted from the handbook sidebar."""
    handbook_homepage_md_rel: str | None = None
    """When set (POSIX path under *content_root*, e.g. ``docs/index.md``), that page emits as ``index.html`` and root ``README.md`` is omitted from the build."""
    handbook_sidebar_group_order: tuple[str, ...] | None = None
    """When set, top-level sidebar folder names matching these stems sort in this order before remaining keys (case-insensitive)."""
    handbook_sidebar_flat_threshold: int | None = None
    """When set, overrides ``FLAT_SIDEBAR_THRESHOLD`` for ``build_sidebar_links`` (use ``0`` for hierarchical grouping whenever pages exist)."""
    link_check: bool = False
    """If True, ``run_simple_build`` scans each page's body for internal ``.md`` links and counts unresolved targets (stderr summary)."""
    canonical_url_prefix: str | None = None
    """If set, canonical note links to ``{prefix}/{md_rel}`` (no scheme = relative path shown)."""
    show_canonical_note: bool = True
    """If False, omit the contributor \"Canonical source\" / rebuild callout (e.g. public product handbook)."""
    chrome_overrides: Mapping[str, str] | None = None
    """Optional merge into locale chrome JSON (e.g. footer labels on consumer sites or neutral public handbook footers)."""
    seo_public_origin: str | None = None
    """If set with *seo_url_prefix*, emit canonical / Open Graph URLs (e.g. ``https://blueprints.forgesdlc.com``)."""
    seo_url_prefix: str | None = None
    """URL path prefix for published HTML (e.g. ``/lenses/guides``), no trailing slash."""
    seo_default_og_image: str | None = None
    """Absolute image URL for ``og:image`` when not overridden per page."""
    contextual_leaf_sidebar: bool = True
    """If True, leaf pages use a compact sidebar rail (Lenses/KS simple builds)."""
    markdown_collect_preset: str = "default"
    """Use ``forge_lens_repo`` for ``forge-lenses``: include ``docs/blueprints``, ``docs/website``, ``lenses/website``."""
    derive_handbook_title_from_readme: bool = True
    """If True (default), the handbook name in chrome comes from repo ``README.md`` when present."""
    build_profile: str = "full"
    """``public`` = only Markdown paths declared in the nav manifest when *nav_manifest_path* is set."""
    nav_manifest_path: str | None = None
    """Relative path under *content_root* to ``nav.yml`` (Forge Lenses product docs)."""
    seo_site_name: str | None = None
    """Published site name for JSON-LD and the root breadcrumb (e.g. ``Forge Lenses``). When unset, legacy Blueprints defaults apply."""
    lenses_public_manifest_site: str | None = None
    """When set (Forge Lenses public builds), emit ``public-manifest.json`` and docs provenance ``<meta>`` tags."""
    site_nav_yaml: str | None = None
    """Optional relative path under *content_root* to a Fleet-style ``site-nav.yaml`` (horizontal IA + section sidebars)."""
    handbook_top_nav_html_builder: Any | None = None
    """Optional ``builder(md_rel_posix) -> str`` merged ahead of Fleet top shell HTML."""
    handbook_offcanvas_prepend_html_builder: Any | None = None
    """Optional HTML prepended inside the mobile offcanvas before the section sidebar."""
    handbook_sidebar_nav_pages_filter: Any | None = None
    """Optional ``filter(md_rel_posix, rail_pages) -> rail_pages`` after Fleet sidebar filtering."""
    handbook_sidebar_brand_tagline: str | None = None
    """Optional subtitle under the handbook name in the desktop sidebar."""
    handbook_sidebar_rail_heading: str | None = None
    """When set, replaces the visible sidebar rail heading (shown above nav links); default remains \"Chapters\" in layouts."""

def _resolve_path(base: Path, value: str | Path) -> Path:
    p = Path(value)
    if p.is_absolute():
        return p
    return (base / p).resolve()


def load_handbook_config(path: Path) -> HandbookBuildConfig:
    """Load ``HandbookBuildConfig`` from a YAML file (paths relative to the file’s directory)."""
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise ValueError("Config root must be a mapping")
    base = path.parent.resolve()
    skip = raw.get("skip_dir_names")
    skip_set: frozenset[str]
    if skip is None:
        skip_set = DEFAULT_SKIP_DIR_NAMES
    else:
        if not isinstance(skip, list):
            raise ValueError("skip_dir_names must be a list of strings")
        skip_set = frozenset(str(x) for x in skip)
    co = raw.get("chrome_overrides")
    chrome_overrides: dict[str, str] | None = None
    if isinstance(co, dict):
        chrome_overrides = {str(k): str(v) for k, v in co.items()}
    seo_po = str(raw["seo_public_origin"]) if raw.get("seo_public_origin") else None
    seo_pfx = str(raw["seo_url_prefix"]) if raw.get("seo_url_prefix") else None
    seo_ogi = str(raw["seo_default_og_image"]) if raw.get("seo_default_og_image") else None
    nav_ex = raw.get("nav_exclude_path_prefixes")
    nav_exclude_prefixes: frozenset[str]
    if nav_ex is None:
        nav_exclude_prefixes = frozenset()
    elif isinstance(nav_ex, list):
        nav_exclude_prefixes = frozenset(str(x).replace("\\", "/").strip() for x in nav_ex if str(x).strip())
    else:
        raise ValueError("nav_exclude_path_prefixes must be a list of strings or omitted")
    hp_rel = str(raw["handbook_homepage_md_rel"]).strip() if raw.get("handbook_homepage_md_rel") else None
    hsg = raw.get("handbook_sidebar_group_order")
    sidebar_order: tuple[str, ...] | None
    if hsg is None:
        sidebar_order = None
    elif isinstance(hsg, list):
        sidebar_order = tuple(str(x).strip() for x in hsg if str(x).strip())
    else:
        raise ValueError("handbook_sidebar_group_order must be a list of strings or omitted")
    return HandbookBuildConfig(
        content_root=_resolve_path(base, raw["content_root"]),
        output_dir=_resolve_path(base, raw["output_dir"]),
        kitchensink=_resolve_path(base, raw["kitchensink"]),
        handbook_name=str(raw.get("handbook_name", "Handbook")),
        skip_dir_names=skip_set,
        canonical_url_prefix=(str(raw["canonical_url_prefix"]) if raw.get("canonical_url_prefix") else None),
        show_canonical_note=bool(raw.get("show_canonical_note", True)),
        chrome_overrides=chrome_overrides,
        seo_public_origin=seo_po,
        seo_url_prefix=seo_pfx,
        seo_default_og_image=seo_ogi,
        contextual_leaf_sidebar=bool(raw.get("contextual_leaf_sidebar", True)),
        markdown_collect_preset=str(raw.get("markdown_collect_preset", "default")),
        nav_exclude_path_prefixes=nav_exclude_prefixes,
        handbook_homepage_md_rel=hp_rel,
        handbook_sidebar_group_order=sidebar_order,
        handbook_sidebar_flat_threshold=(
            int(raw["handbook_sidebar_flat_threshold"])
            if raw.get("handbook_sidebar_flat_threshold") is not None
            else None
        ),
        link_check=bool(raw.get("link_check", False)),
        derive_handbook_title_from_readme=bool(raw.get("derive_handbook_title_from_readme", True)),
        build_profile=str(raw.get("build_profile", "full")),
        nav_manifest_path=(
            str(raw["nav_manifest_path"]) if raw.get("nav_manifest_path") else None
        ),
        seo_site_name=str(raw["seo_site_name"]) if raw.get("seo_site_name") else None,
        lenses_public_manifest_site=(
            str(raw["lenses_public_manifest_site"]).strip()
            if raw.get("lenses_public_manifest_site")
            else None
        ),
        site_nav_yaml=str(raw["site_nav_yaml"]) if raw.get("site_nav_yaml") else None,
        handbook_sidebar_brand_tagline=(
            str(raw["handbook_sidebar_brand_tagline"]).strip()
            if raw.get("handbook_sidebar_brand_tagline")
            else None
        ),
        handbook_sidebar_rail_heading=(
            str(raw["handbook_sidebar_rail_heading"]).strip()
            if raw.get("handbook_sidebar_rail_heading")
            else None
        ),
    )


def handbook_config_from_mapping(raw: dict[str, Any], base_dir: Path) -> HandbookBuildConfig:
    """Build config from a dict (paths relative to *base_dir*)."""
    skip = raw.get("skip_dir_names")
    skip_set = (
        DEFAULT_SKIP_DIR_NAMES
        if skip is None
        else frozenset(str(x) for x in skip)
    )
    co = raw.get("chrome_overrides")
    chrome_overrides: dict[str, str] | None = None
    if isinstance(co, dict):
        chrome_overrides = {str(k): str(v) for k, v in co.items()}
    nav_ex = raw.get("nav_exclude_path_prefixes")
    nav_exclude_prefixes: frozenset[str]
    if nav_ex is None:
        nav_exclude_prefixes = frozenset()
    elif isinstance(nav_ex, list):
        nav_exclude_prefixes = frozenset(str(x).replace("\\", "/").strip() for x in nav_ex if str(x).strip())
    else:
        raise ValueError("nav_exclude_path_prefixes must be a list of strings or omitted")
    hp_rel = (
        str(raw["handbook_homepage_md_rel"]).strip()
        if raw.get("handbook_homepage_md_rel")
        else None
    )
    hsg = raw.get("handbook_sidebar_group_order")
    sidebar_order: tuple[str, ...] | None
    if hsg is None:
        sidebar_order = None
    elif isinstance(hsg, list):
        sidebar_order = tuple(str(x).strip() for x in hsg if str(x).strip())
    else:
        raise ValueError("handbook_sidebar_group_order must be a list of strings or omitted")
    return HandbookBuildConfig(
        content_root=_resolve_path(base_dir, raw["content_root"]),
        output_dir=_resolve_path(base_dir, raw["output_dir"]),
        kitchensink=_resolve_path(base_dir, raw["kitchensink"]),
        handbook_name=str(raw.get("handbook_name", "Handbook")),
        skip_dir_names=skip_set,
        canonical_url_prefix=(
            str(raw["canonical_url_prefix"]) if raw.get("canonical_url_prefix") else None
        ),
        show_canonical_note=bool(raw.get("show_canonical_note", True)),
        chrome_overrides=chrome_overrides,
        seo_public_origin=(
            str(raw["seo_public_origin"]) if raw.get("seo_public_origin") else None
        ),
        seo_url_prefix=str(raw["seo_url_prefix"]) if raw.get("seo_url_prefix") else None,
        seo_default_og_image=(
            str(raw["seo_default_og_image"]) if raw.get("seo_default_og_image") else None
        ),
        contextual_leaf_sidebar=bool(raw.get("contextual_leaf_sidebar", True)),
        markdown_collect_preset=str(raw.get("markdown_collect_preset", "default")),
        nav_exclude_path_prefixes=nav_exclude_prefixes,
        handbook_homepage_md_rel=hp_rel,
        handbook_sidebar_group_order=sidebar_order,
        handbook_sidebar_flat_threshold=(
            int(raw["handbook_sidebar_flat_threshold"])
            if raw.get("handbook_sidebar_flat_threshold") is not None
            else None
        ),
        link_check=bool(raw.get("link_check", False)),
        derive_handbook_title_from_readme=bool(raw.get("derive_handbook_title_from_readme", True)),
        build_profile=str(raw.get("build_profile", "full")),
        nav_manifest_path=(
            str(raw["nav_manifest_path"]) if raw.get("nav_manifest_path") else None
        ),
        seo_site_name=str(raw["seo_site_name"]) if raw.get("seo_site_name") else None,
        lenses_public_manifest_site=(
            str(raw["lenses_public_manifest_site"]).strip()
            if raw.get("lenses_public_manifest_site")
            else None
        ),
        site_nav_yaml=str(raw["site_nav_yaml"]) if raw.get("site_nav_yaml") else None,
        handbook_sidebar_brand_tagline=(
            str(raw["handbook_sidebar_brand_tagline"]).strip()
            if raw.get("handbook_sidebar_brand_tagline")
            else None
        ),
        handbook_sidebar_rail_heading=(
            str(raw["handbook_sidebar_rail_heading"]).strip()
            if raw.get("handbook_sidebar_rail_heading")
            else None
        ),
    )
