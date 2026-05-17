"""Opinionated single-root handbook build (used by CLI)."""

from __future__ import annotations

import hashlib
import html as html_module
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

from forge_autodoc.assets import sync_handbook_assets
from forge_autodoc.config import HandbookBuildConfig
from forge_autodoc.files import (
    collect_lens_handbook_markdown_files,
    collect_markdown_files,
    handbook_title_from_readme,
    slug_from_lens_repo_handbook_md,
    slug_from_md_path,
    split_yaml_frontmatter,
    title_from_filename,
    title_from_md_content,
)
from forge_autodoc.contextual_nav import (
    build_compact_handbook_rail_inner_html,
    lenses_split_family_pages,
    related_pages_section_html,
    split_topic_parent_basename,
)
from forge_autodoc.fleet_site_nav import (
    FleetSiteNav,
    _active_top_id,
    build_breadcrumb_html,
    build_top_nav_html,
    filter_nav_pages_for_sidebar,
    fleet_json_ld_breadcrumb,
    load_fleet_site_nav,
    sidebar_label_for_page,
)
from forge_autodoc.seo_meta import handbook_json_ld, truncate_meta_description
from forge_autodoc.markdown_conv import markdown_to_handbook_html
from forge_autodoc.nav_manifest import LensNavManifest, load_lens_nav_manifest, manifest_section_labels
from forge_autodoc.page import assemble_handbook_page
from forge_autodoc.sidebar import build_grouped_manifest_sidebar, build_sidebar_links
from forge_autodoc.text import plain_text_from_first_paragraph
from forge_autodoc.transforms_api import apply_handbook_body_transforms, extract_toc_from_html


# Markdown links to sibling/relative ``*.md`` files (not images: exclude leading ``!``).
_RE_MD_MARKDOWN_LINK = re.compile(r"(?<!!)\[[^\]]*\]\(\s*([^)#\s]+\.md)\s*(?:#[^)]*)?\s*\)")

HANDBOOK_NAV_ORDER_DEFAULT = 10_000


def _posix_md_rel(md_rel: str) -> str:
    return md_rel.replace("\\", "/")


def _public_publish_suppressed(fm: dict[str, str]) -> bool:
    v = fm.get("public_publish", "").strip().lower()
    return v in ("false", "0", "no", "off")


def _internal_status_suppressed(fm: dict[str, str]) -> bool:
    return fm.get("status", "").strip().lower() == "internal"


def _load_handbook_redirects(content_root: Path) -> dict[str, str]:
    """Parse ``docs/redirects.yaml`` → map of old HTML slug stem → new slug stem.

    Values may omit or include a trailing ``.html``; emitted redirect stubs use
    full filenames under *output_dir*.
    """
    path = content_root / "docs" / "redirects.yaml"
    if not path.is_file():
        return {}
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        return {}
    block = raw.get("redirects")
    if block is None:
        return {}
    if not isinstance(block, dict):
        return {}
    out: dict[str, str] = {}
    for k, v in block.items():
        if k is None or v is None:
            continue
        src = str(k).strip()
        dst = str(v).strip()
        if not src or not dst:
            continue
        if not src.endswith(".html"):
            src = src + ".html"
        if not dst.endswith(".html"):
            dst = dst + ".html"
        out[src] = dst
    return out


def _redirect_stub_html(target_slug: str) -> str:
    """Minimal static redirect (meta refresh + canonical) for Firebase-style hosting."""
    target = target_slug.lstrip("/")
    return (
        "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n"
        '<meta charset="utf-8">\n'
        f'<meta http-equiv="refresh" content="0; url={target}">\n'
        f'<link rel="canonical" href="{target}">\n'
        "<title>Moved</title>\n</head>\n<body>\n"
        f'<p>This page moved to <a href="{target}">{target}</a>.</p>\n'
        "</body>\n</html>\n"
    )


def _manifest_nav_title_override(manifest: LensNavManifest, rel_posix: str) -> str | None:
    for sec in manifest.sections:
        for ent in sec.entries:
            if _posix_md_rel(ent.path) == rel_posix:
                return ent.nav_title
    return None


def _git_head_sha(repo_root: Path) -> str:
    try:
        proc = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=str(repo_root),
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
        if proc.returncode == 0:
            return (proc.stdout or "").strip()
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        pass
    return ""


def _sha256_hex_file(path: Path) -> str | None:
    if not path.is_file():
        return None
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def _emit_forge_lenses_public_manifest(
    *,
    cfg: HandbookBuildConfig,
    repo_root: Path,
    lens_manifest: LensNavManifest,
    pages: list[tuple[str, str, str]],
    meta_by_rel: dict[str, dict[str, str]],
    nav_yaml_path_posix: str,
    nav_sha256: str,
    git_commit: str,
    section_id_for_rel: dict[str, str],
    handbook_title: str,
) -> None:
    site = (cfg.lenses_public_manifest_site or "").strip()
    if not site:
        return
    emitted_rel = {_posix_md_rel(md_r) for _, _, md_r in pages}
    ordered_manifest = [_posix_md_rel(p) for p in lens_manifest.flatten_paths()]
    suppressed = [rel for rel in ordered_manifest if rel not in emitted_rel]
    routes_path = repo_root / "docs" / "generated" / "api-routes.json"
    routes_hash = _sha256_hex_file(routes_path)
    iso_now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    sections_payload: list[dict[str, object]] = []
    for sec in lens_manifest.sections:
        paths_sec = [_posix_md_rel(ent.path) for ent in sec.entries]
        emitted_in_sec = sum(1 for pth in paths_sec if pth in emitted_rel)
        sections_payload.append(
            {
                "id": sec.id,
                "title": sec.title,
                "nav_entry_count": len(paths_sec),
                "emitted_public_page_count": emitted_in_sec,
            }
        )

    page_payload: list[dict[str, object]] = []
    for slug, sidebar_title, md_rel in pages:
        rel_pos = _posix_md_rel(md_rel)
        fm = meta_by_rel.get(rel_pos, {})
        text = (repo_root / rel_pos).read_text(encoding="utf-8")
        heading_title = title_from_md_content(text, title_from_filename(Path(rel_pos).name))
        page_payload.append(
            {
                "source_path": rel_pos,
                "output_slug": slug,
                "sidebar_short_title": sidebar_title,
                "nav_title_manifest_override": _manifest_nav_title_override(lens_manifest, rel_pos),
                "page_title_heading": heading_title,
                "description": str(fm.get("description", "") or "").strip(),
                "section_id": fm.get("section") or section_id_for_rel.get(rel_pos, ""),
                "status": str(fm.get("status", "") or "").strip(),
                "public_publish": str(fm.get("public_publish", "") or "").strip(),
            }
        )

    blob = {
        "site": site,
        "build_profile": cfg.build_profile,
        "handbook_title": handbook_title,
        "generated_at": iso_now,
        "git_commit": git_commit or None,
        "source_nav_path": nav_yaml_path_posix,
        "nav_sha256": nav_sha256,
        "nav_entry_count": len(ordered_manifest),
        "effective_public_page_count": len(emitted_rel),
        "suppressed_nav_page_count": len(suppressed),
        "suppressed_pages": suppressed,
        "sections": sections_payload,
        "pages": sorted(page_payload, key=lambda row: row["source_path"]),
        "generated_api_routes_json_sha256": routes_hash,
    }
    out = cfg.output_dir / "public-manifest.json"
    out.write_text(json.dumps(blob, indent=2, sort_keys=False) + "\n", encoding="utf-8")
    print(f"  Wrote {out.name}")


def _manifest_sidebar_sections(
    lens_manifest: LensNavManifest,
    pages: list[tuple[str, str, str]],
    *,
    build_profile: str,
) -> list[tuple[str, list[tuple[str, str]]]]:
    """Build grouped nav from manifest; append extra pages when *build_profile* is ``full``."""
    rel_to_row: dict[str, tuple[str, str, str]] = {}
    for row in pages:
        rel_to_row[_posix_md_rel(row[2])] = row
    manifest_rels = {p.replace("\\", "/") for p in lens_manifest.flatten_paths()}
    sections_out: list[tuple[str, list[tuple[str, str]]]] = []
    for sec in lens_manifest.sections:
        items: list[tuple[str, str]] = []
        for ent in sec.entries:
            r = ent.path.replace("\\", "/")
            row = rel_to_row.get(r)
            if row is None:
                continue
            title = ent.nav_title or row[1]
            items.append((row[0], title))
        if items:
            sections_out.append((sec.title, items))
    if build_profile == "full":
        extras = [
            row
            for row in pages
            if _posix_md_rel(row[2]) not in manifest_rels
        ]
        if extras:
            extras_sorted = sorted(extras, key=lambda x: _posix_md_rel(x[2]).lower())
            sections_out.append(
                ("Maintainers & reference", [(p[0], p[1]) for p in extras_sorted])
            )
    return sections_out


def _manifest_sidebar_sections_filtered(
    lens_manifest: LensNavManifest,
    section_ids: tuple[str, ...],
    pages: list[tuple[str, str, str]],
) -> list[tuple[str, list[tuple[str, str]]]]:
    """Sidebar groups drawn only from ``nav.yml`` sections listed in *section_ids*."""
    want = frozenset(section_ids)
    rel_to_row: dict[str, tuple[str, str, str]] = {}
    for row in pages:
        rel_to_row[_posix_md_rel(row[2])] = row
    sections_out: list[tuple[str, list[tuple[str, str]]]] = []
    for sec in lens_manifest.sections:
        if sec.id not in want:
            continue
        items: list[tuple[str, str]] = []
        for ent in sec.entries:
            r = ent.path.replace("\\", "/")
            row = rel_to_row.get(r)
            if row is None:
                continue
            title = ent.nav_title or row[1]
            items.append((row[0], title))
        if items:
            sections_out.append((sec.title, items))
    return sections_out


def _broken_internal_md_links(
    md_path: Path, body_md: str, href_by_md: dict[str, str]
) -> int:
    """Count relative ``.md`` hrefs in Markdown that do not resolve to a built page."""
    bad = 0
    for m in _RE_MD_MARKDOWN_LINK.finditer(body_md):
        href = m.group(1).strip()
        if href.startswith("http://") or href.startswith("https://"):
            continue
        target = (md_path.parent / href).resolve()
        if str(target) not in href_by_md:
            bad += 1
    return bad


def _page_excluded_from_nav(md_rel: str, fm: dict[str, str], cfg: HandbookBuildConfig) -> bool:
    rel_posix = md_rel.replace("\\", "/")
    for pref in cfg.nav_exclude_path_prefixes:
        pfx = pref.replace("\\", "/")
        if rel_posix.startswith(pfx) or rel_posix == pfx.rstrip("/"):
            return True
    v = fm.get("hide_from_nav", "").strip().lower()
    return v in ("true", "1", "yes")


def _nav_sort_tuple(
    row: tuple[str, str, str],
    meta_by_rel: dict[str, dict[str, str]],
) -> tuple[str, int, str]:
    _, _, md_rel = row
    fm = meta_by_rel.get(md_rel, {})
    parent = str(Path(md_rel).parent)
    raw_order = fm.get("nav_order", "").strip()
    try:
        order = int(raw_order) if raw_order else HANDBOOK_NAV_ORDER_DEFAULT
    except ValueError:
        order = HANDBOOK_NAV_ORDER_DEFAULT
    return (parent.lower(), order, md_rel.lower())


def _rewrite_relative_md_links(html: str, md_path: Path, content_root: Path, href_by_md: dict[str, str]) -> str:
    """Map same-site ``.md`` links to generated HTML filenames."""

    def _rew(m: re.Match[str]) -> str:
        prefix, href, middle, content = m.group(1), m.group(2), m.group(3), m.group(4)
        if href.startswith("http://") or href.startswith("https://"):
            return m.group(0)
        if "#" in href:
            path_part, anchor = href.split("#", 1)
            anchor = "#" + anchor
        else:
            path_part, anchor = href, ""
        if not path_part.endswith(".md"):
            return m.group(0)
        target = (md_path.parent / path_part).resolve()
        try:
            rel = target.relative_to(content_root)
        except ValueError:
            return m.group(0)
        key = str(target)
        if key not in href_by_md:
            return m.group(0)
        return f'{prefix}href="{href_by_md[key]}{anchor}"{middle}{content}</a>'

    return re.sub(
        r'(<a\s[^>]*)href="([^"]*)"([^>]*>)(.*?)</a>',
        _rew,
        html,
        flags=re.DOTALL,
    )


def run_simple_build(cfg: HandbookBuildConfig, *, dry_run: bool = False) -> int:
    """Build flat HTML for all Markdown under ``cfg.content_root`` into ``cfg.output_dir``."""
    root = cfg.content_root
    if not root.is_dir():
        raise FileNotFoundError(f"content_root is not a directory: {root}")

    lens_manifest: LensNavManifest | None = None
    if cfg.nav_manifest_path:
        mpath = root / cfg.nav_manifest_path
        if mpath.is_file():
            lens_manifest = load_lens_nav_manifest(mpath)

    fleet_site_manifest: FleetSiteNav | None = None
    if cfg.site_nav_yaml:
        sn_path = root / cfg.site_nav_yaml.replace("\\", "/").lstrip("/")
        if sn_path.is_file():
            fleet_site_manifest = load_fleet_site_nav(sn_path)

    include_maintainer = cfg.build_profile == "full"

    if cfg.markdown_collect_preset == "forge_lens_repo":
        md_paths = collect_lens_handbook_markdown_files(
            root,
            skip_dir_names=cfg.skip_dir_names,
            include_maintainer=include_maintainer,
        )
    else:
        md_paths = collect_markdown_files(root, skip_dir_names=cfg.skip_dir_names)

    if cfg.build_profile == "public":
        if lens_manifest is None:
            print(
                "forge-autodoc: build_profile=public requires a nav manifest "
                f"at {cfg.nav_manifest_path!r} under content_root",
                file=sys.stderr,
            )
            return -1
        ordered: list[Path] = []
        for rel in lens_manifest.flatten_paths():
            p = root / rel
            if not p.is_file():
                print(f"forge-autodoc: nav manifest references missing file: {rel}", file=sys.stderr)
                return -1
            text = p.read_text(encoding="utf-8")
            fm_head, _ = split_yaml_frontmatter(text)
            if _public_publish_suppressed(fm_head):
                continue
            if _internal_status_suppressed(fm_head):
                continue
            ordered.append(p)
        md_paths = ordered
        if not md_paths:
            print(
                "forge-autodoc: public build has no pages after public_publish filter",
                file=sys.stderr,
            )
            return -1
    elif lens_manifest is not None and cfg.markdown_collect_preset == "forge_lens_repo":
        manifest_rels_order = lens_manifest.flatten_paths()
        manifest_set = set(manifest_rels_order)
        ordered_m: list[Path] = []
        for rel in manifest_rels_order:
            p = root / rel
            if p.is_file():
                ordered_m.append(p)
        extras = [
            p
            for p in md_paths
            if _posix_md_rel(str(p.relative_to(root))) not in manifest_set
        ]
        extras.sort(key=lambda p: _posix_md_rel(str(p.relative_to(root))).lower())
        md_paths = ordered_m + extras

    if not md_paths:
        print("No markdown files found.", file=sys.stderr)
        return 0

    homepage_rel = (
        cfg.handbook_homepage_md_rel.replace("\\", "/").strip()
        if cfg.handbook_homepage_md_rel
        else ""
    )

    def _page_slug(md_path: Path) -> str:
        rel = _posix_md_rel(str(md_path.relative_to(root)))
        if homepage_rel and rel == homepage_rel:
            return "index.html"
        if homepage_rel and rel == "README.md":
            return "repository-readme.html"
        if cfg.markdown_collect_preset == "forge_lens_repo":
            return slug_from_lens_repo_handbook_md(md_path, root)
        return slug_from_md_path(md_path, root)

    href_by_md: dict[str, str] = {}
    meta_by_rel: dict[str, dict[str, str]] = {}
    pages: list[tuple[str, str, str]] = []
    for md_path in md_paths:
        slug = _page_slug(md_path)
        href_by_md[str(md_path.resolve())] = slug
        text = md_path.read_text(encoding="utf-8")
        fm, _ = split_yaml_frontmatter(text)
        md_rel = _posix_md_rel(str(md_path.relative_to(root)))
        meta_by_rel[md_rel] = fm
        nav_title = title_from_md_content(text, title_from_filename(md_path.name))
        if len(nav_title) > 45:
            nav_title = nav_title[:42] + "…"
        pages.append((slug, nav_title, md_rel))

    slug_to_rels: dict[str, list[str]] = {}
    for slug, _t, md_rel in pages:
        slug_to_rels.setdefault(slug, []).append(md_rel)
    dupes = {s: rels for s, rels in slug_to_rels.items() if len(rels) > 1}
    if dupes:
        for slug, rels in sorted(dupes.items()):
            joined = ", ".join(sorted(rels))
            print(f"forge-autodoc: duplicate HTML slug {slug!r}: {joined}", file=sys.stderr)
        return -1

    if not lens_manifest or cfg.markdown_collect_preset != "forge_lens_repo":
        pages.sort(key=lambda x: x[2])

    if (
        lens_manifest
        and lens_manifest.enforce_public_frontmatter
        and cfg.build_profile == "public"
    ):
        emit_rels = {_posix_md_rel(str(p.relative_to(root))) for p in md_paths}
        for rel in sorted(emit_rels):
            fm = meta_by_rel.get(rel, {})
            if not fm.get("audience", "").strip() or not fm.get("section", "").strip():
                print(
                    f"forge-autodoc: public page missing audience/section frontmatter: {rel}",
                    file=sys.stderr,
                )
                return -1

    nav_pages = [p for p in pages if not _page_excluded_from_nav(p[2], meta_by_rel.get(p[2], {}), cfg)]
    if not lens_manifest or cfg.markdown_collect_preset != "forge_lens_repo":
        nav_pages.sort(key=lambda row: _nav_sort_tuple(row, meta_by_rel))

    slug_by_md_rel: dict[str, str] = {_posix_md_rel(p[2]): p[0] for p in pages}

    use_lens_manifest_nav = bool(
        lens_manifest and cfg.markdown_collect_preset == "forge_lens_repo"
    )

    if dry_run:
        print(
            f"  WOULD generate {len(pages)} page(s); "
            f"sidebar would list {len(nav_pages)} page(s)",
            file=sys.stderr,
        )
        for slug, title, rel in pages:
            print(f"  WOULD generate: {slug}  ({rel})")
        return len(pages)

    cfg.output_dir.mkdir(parents=True, exist_ok=True)
    assets_dir = cfg.output_dir / "assets"
    sync_handbook_assets(cfg.kitchensink, assets_dir)

    if cfg.derive_handbook_title_from_readme and (root / "README.md").exists():
        hb_name = handbook_title_from_readme(root)
    else:
        hb_name = cfg.handbook_name

    origin = (cfg.seo_public_origin or "").rstrip("/")
    prefix = (cfg.seo_url_prefix or "").rstrip("/")
    default_og = (cfg.seo_default_og_image or "").strip()

    nav_yaml_disk = Path()
    nav_sha_public = ""
    git_head_public = ""
    provenance_head_html = ""
    section_labels_map: dict[str, str] = {}
    if lens_manifest is not None:
        section_labels_map = manifest_section_labels(lens_manifest)
    if cfg.nav_manifest_path:
        nav_yaml_disk = (root / cfg.nav_manifest_path).resolve()
    if (
        cfg.lenses_public_manifest_site
        and cfg.build_profile == "public"
        and lens_manifest is not None
        and nav_yaml_disk.is_file()
    ):
        nav_sha_public = hashlib.sha256(nav_yaml_disk.read_bytes()).hexdigest()
        git_head_public = _git_head_sha(root)
        if not git_head_public:
            git_head_public = os.environ.get("GITHUB_SHA", "").strip()
        site_raw = cfg.lenses_public_manifest_site.strip()
        provenance_head_html = (
            f'  <meta name="forge-lenses-docs-profile" '
            f'content="{html_module.escape(cfg.build_profile)}" />\n'
            f'  <meta name="forge-lenses-site" content="{html_module.escape(site_raw)}" />\n'
            f'  <meta name="forge-lenses-nav-sha256" '
            f'content="{html_module.escape(nav_sha_public)}" />\n'
        )
        if git_head_public:
            provenance_head_html += (
                f'  <meta name="forge-lenses-build-commit" '
                f'content="{html_module.escape(git_head_public)}" />\n'
            )

    broken_md_links = 0

    for idx, (fslug, _nav_title, md_rel) in enumerate(pages):
        md_path = root / md_rel
        text = md_path.read_text(encoding="utf-8")
        page_title = title_from_md_content(text, title_from_filename(md_path.name))
        _fm, body_md = split_yaml_frontmatter(text)
        maintainer_banner = ""
        if _fm.get("audience", "").strip().lower() == "maintainer":
            maintainer_banner = (
                '<div class="alert alert-secondary my-3" role="note">'
                "<strong>Maintainer reference</strong> — internal contributor documentation."
                "</div>\n\n"
            )
        if cfg.link_check:
            broken_md_links += _broken_internal_md_links(md_path, body_md, href_by_md)
        body_html = markdown_to_handbook_html(maintainer_banner + body_md)
        body_html = _rewrite_relative_md_links(body_html, md_path, root, href_by_md)
        body_html, _hm, has_ks = apply_handbook_body_transforms(cfg.kitchensink, body_html)
        intro = plain_text_from_first_paragraph(body_html)
        toc = extract_toc_from_html(cfg.kitchensink, body_html)
        is_template = md_path.name.endswith(".template.md")

        prev_link = (pages[idx - 1][0], pages[idx - 1][1]) if idx > 0 else None
        next_link = (pages[idx + 1][0], pages[idx + 1][1]) if idx < len(pages) - 1 else None

        rel_by_md = {p[2]: p for p in pages}
        rel_by_basename = {Path(p[2]).name: p for p in pages}
        family = lenses_split_family_pages(md_rel, pages)
        family_visible = [
            p for p in family if not _page_excluded_from_nav(p[2], meta_by_rel.get(p[2], {}), cfg)
        ]
        block_lens_split = bool(fleet_site_manifest and lens_manifest)
        use_split_rail = (
            cfg.contextual_leaf_sidebar and len(family_visible) > 1 and not block_lens_split
        )
        split_child_bn = split_topic_parent_basename(md_path.name)
        sidebar_chapters_label = "Chapters"
        sidebar_html: str
        offcanvas_html: str

        if use_split_rail and split_child_bn and split_child_bn in rel_by_basename:
            parent_row = rel_by_basename[split_child_bn]
            crumbs: list[tuple[str | None, str]] = [
                ("../../index.html", "Handbook"),
                ("../index.html", "Lenses guides"),
                (parent_row[0], parent_row[1]),
                (None, page_title),
            ]
            rail = build_compact_handbook_rail_inner_html(
                breadcrumb_items=crumbs,
                parent_href=parent_row[0],
                parent_label=parent_row[1],
                prev_link=prev_link,
                next_link=next_link,
                browse_href="../index.html",
                browse_label="All Lenses guides",
            )
            sidebar_html = rail
            offcanvas_html = rail
            sidebar_chapters_label = "This page"
            others = [p for p in family_visible if p[2] != md_rel]
            rel_items = [(p[0], p[1]) for p in others[:5]]
            if rel_items:
                body_html = body_html + related_pages_section_html(rel_items)
        elif use_split_rail:
            split_family_nav = family_visible
            sidebar_html = build_sidebar_links(
                split_family_nav,
                fslug,
                id_prefix="nav",
                preferred_group_order=cfg.handbook_sidebar_group_order,
            )
            offcanvas_html = build_sidebar_links(
                split_family_nav,
                fslug,
                id_prefix="mob",
                preferred_group_order=cfg.handbook_sidebar_group_order,
            )
            sidebar_chapters_label = "This section"
        elif use_lens_manifest_nav and lens_manifest is not None:
            grouped: list[tuple[str, list[tuple[str, str]]]]
            if fleet_site_manifest is not None:
                active_top = _active_top_id(
                    fleet_site_manifest,
                    md_rel,
                    lens_manifest=lens_manifest,
                )
                nav_item = next(
                    (i for i in fleet_site_manifest.top_level if i.id == active_top),
                    None,
                )
                if nav_item and nav_item.lens_manifest_sections:
                    grouped = _manifest_sidebar_sections_filtered(
                        lens_manifest,
                        nav_item.lens_manifest_sections,
                        pages,
                    )
                else:
                    grouped = _manifest_sidebar_sections(
                        lens_manifest,
                        pages,
                        build_profile=cfg.build_profile,
                    )
            else:
                grouped = _manifest_sidebar_sections(
                    lens_manifest,
                    pages,
                    build_profile=cfg.build_profile,
                )
            rail_cap = (
                12 if fleet_site_manifest is not None and lens_manifest is not None else None
            )
            sidebar_html = build_grouped_manifest_sidebar(
                grouped,
                fslug,
                id_prefix="nav",
                collapse_extra_after=rail_cap,
            )
            offcanvas_html = build_grouped_manifest_sidebar(
                grouped,
                fslug,
                id_prefix="mob",
                collapse_extra_after=rail_cap,
            )
        else:
            rail_pages = (
                filter_nav_pages_for_sidebar(nav_pages, md_rel, fleet_site_manifest)
                if fleet_site_manifest
                else nav_pages
            )
            if cfg.handbook_sidebar_nav_pages_filter is not None:
                rail_pages = cfg.handbook_sidebar_nav_pages_filter(md_rel, rail_pages)
            sidebar_html = build_sidebar_links(
                rail_pages,
                fslug,
                id_prefix="nav",
                preferred_group_order=cfg.handbook_sidebar_group_order,
            )
            offcanvas_html = build_sidebar_links(
                rail_pages,
                fslug,
                id_prefix="mob",
                preferred_group_order=cfg.handbook_sidebar_group_order,
            )

        if cfg.handbook_offcanvas_prepend_html_builder is not None:
            pre = cfg.handbook_offcanvas_prepend_html_builder(md_rel)
            if pre.strip():
                offcanvas_html = (
                    f'<div class="forge-handbook-offcanvas-primary-nav px-2 pt-2 pb-1 small">{pre}</div>\n'
                    f'<hr class="my-2 opacity-25 border-secondary" />\n{offcanvas_html}'
                )

        if fleet_site_manifest and not use_split_rail:
            if lens_manifest is not None:
                aid = _active_top_id(
                    fleet_site_manifest,
                    md_rel,
                    lens_manifest=lens_manifest,
                )
                sec_item = next(
                    (x for x in fleet_site_manifest.top_level if x.id == aid),
                    None,
                )
                if sec_item is not None:
                    sidebar_chapters_label = sec_item.label
                else:
                    sidebar_chapters_label = sidebar_label_for_page(
                        fleet_site_manifest,
                        md_rel,
                        sidebar_chapters_label,
                    )
            else:
                sidebar_chapters_label = sidebar_label_for_page(
                    fleet_site_manifest,
                    md_rel,
                    sidebar_chapters_label,
                )

        top_shell_html = ""
        if fleet_site_manifest:
            top_shell_html = build_top_nav_html(
                fleet_site_manifest,
                nav_pages,
                slug_by_md_rel,
                md_rel,
                lens_manifest=lens_manifest,
            )
            if origin:
                top_shell_html += build_breadcrumb_html(
                    slug_by_md_rel,
                    md_rel,
                    page_title,
                    fleet_site_manifest,
                    origin,
                    prefix,
                    lens_manifest=lens_manifest,
                )
        if cfg.handbook_top_nav_html_builder is not None:
            top_shell_html = cfg.handbook_top_nav_html_builder(md_rel) + top_shell_html

        if cfg.canonical_url_prefix:
            canon = f"{cfg.canonical_url_prefix.rstrip('/')}/{md_rel}"
        else:
            canon = md_rel

        meta_description = ""
        canonical_href = ""
        og_image_href = ""
        json_ld_script = ""
        if origin:
            canonical_href = f"{origin}{prefix}/{fslug}" if prefix else f"{origin}/{fslug}"
            raw_desc = (_fm.get("description") or intro or page_title).strip()
            meta_description = truncate_meta_description(raw_desc)
            og_image_href = default_og or f"{origin}/assets/layout-schematic-handbook.svg"
            json_ld_site = cfg.seo_site_name or "Blueprints handbook"
            if fleet_site_manifest:
                crumb_ld = fleet_json_ld_breadcrumb(
                    slug_by_md_rel,
                    md_rel,
                    page_title,
                    fleet_site_manifest,
                    origin,
                    prefix or "",
                    lens_manifest=lens_manifest,
                )
                json_ld_site = cfg.seo_site_name or hb_name
            else:
                site_label = cfg.seo_site_name or "Blueprints handbook"
                crumb_ld = [
                    (site_label, f"{origin}/index.html"),
                ]
                if "/lenses/guides" in prefix:
                    crumb_ld.append(("Lenses guides", f"{origin}/lenses/index.html"))
                    if (
                        use_split_rail
                        and split_child_bn
                        and split_child_bn in rel_by_basename
                    ):
                        pr = rel_by_basename[split_child_bn]
                        crumb_ld.append((pr[1], f"{origin}{prefix}/{pr[0]}"))
                elif prefix == "/ks" or prefix.endswith("/ks"):
                    crumb_ld.append(("Kitchensink", f"{origin}/ks/index.html"))
                elif not cfg.seo_site_name:
                    crumb_ld.append((hb_name, f"{origin}/index.html"))
                crumb_ld.append((page_title, canonical_href))
            json_ld_script = handbook_json_ld(
                page_name=page_title,
                description=meta_description,
                page_url=canonical_href,
                site_name=json_ld_site,
                site_url=origin,
                breadcrumb=crumb_ld,
            )

        html_out = assemble_handbook_page(
            kitchensink_root=cfg.kitchensink,
            browser_title=page_title,
            handbook_name=hb_name,
            page_title=page_title,
            intro=intro,
            body_html=body_html,
            toc=toc,
            sidebar_html=sidebar_html,
            offcanvas_html=offcanvas_html,
            prev_link=prev_link,
            next_link=next_link,
            canonical_md=canon,
            is_template=is_template,
            has_ks_diagram=has_ks,
            show_canonical_note=cfg.show_canonical_note,
            chrome_overrides=cfg.chrome_overrides,
            meta_description=meta_description,
            canonical_href=canonical_href,
            og_image_href=og_image_href,
            json_ld_script=json_ld_script,
            sidebar_chapters_label=sidebar_chapters_label,
            top_shell_html=top_shell_html,
            handbook_sidebar_brand_tagline=cfg.handbook_sidebar_brand_tagline,
            extra_head_metas_html=provenance_head_html,
        )
        out_path = cfg.output_dir / fslug
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(html_out, encoding="utf-8")
        print(f"  Generated {fslug}")

    if (
        cfg.lenses_public_manifest_site
        and cfg.build_profile == "public"
        and lens_manifest is not None
        and nav_yaml_disk.is_file()
        and nav_sha_public
    ):
        _emit_forge_lenses_public_manifest(
            cfg=cfg,
            repo_root=root,
            lens_manifest=lens_manifest,
            pages=pages,
            meta_by_rel=meta_by_rel,
            nav_yaml_path_posix=_posix_md_rel(str(Path(cfg.nav_manifest_path or "docs/nav.yml"))),
            nav_sha256=nav_sha_public,
            git_commit=git_head_public,
            section_id_for_rel=section_labels_map,
            handbook_title=hb_name,
        )

    emitted_slugs = {row[0] for row in pages}
    if not dry_run:
        for old_slug, new_slug in sorted(_load_handbook_redirects(root).items()):
            if old_slug in emitted_slugs:
                print(
                    f"forge-autodoc: redirect source {old_slug!r} collides with an emitted page",
                    file=sys.stderr,
                )
                return -1
            if new_slug not in emitted_slugs:
                print(
                    f"forge-autodoc: redirect target {new_slug!r} is not an emitted page",
                    file=sys.stderr,
                )
                return -1
            r_out = cfg.output_dir / old_slug
            r_out.parent.mkdir(parents=True, exist_ok=True)
            r_out.write_text(_redirect_stub_html(new_slug), encoding="utf-8")
            print(f"  Generated redirect stub {old_slug} → {new_slug}")

    if cfg.link_check and broken_md_links:
        print(
            f"forge-autodoc: internal .md link check found {broken_md_links} unresolved target(s)",
            file=sys.stderr,
        )
        return -1

    print(
        f"build-site: emitted {len(pages)} page(s); handbook sidebar lists {len(nav_pages)} page(s)",
        file=sys.stderr,
    )

    return len(pages)
