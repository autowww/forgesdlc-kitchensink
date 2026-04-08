"""Opinionated single-root handbook build (used by CLI)."""

from __future__ import annotations

import re
import sys
from pathlib import Path

from forge_autodoc.assets import sync_handbook_assets
from forge_autodoc.config import HandbookBuildConfig
from forge_autodoc.files import (
    collect_markdown_files,
    handbook_title_from_readme,
    slug_from_md_path,
    split_yaml_frontmatter,
    title_from_filename,
    title_from_md_content,
)
from forge_autodoc.seo_meta import handbook_json_ld, truncate_meta_description
from forge_autodoc.markdown_conv import markdown_to_handbook_html
from forge_autodoc.page import assemble_handbook_page
from forge_autodoc.sidebar import build_sidebar_links
from forge_autodoc.text import plain_text_from_first_paragraph
from forge_autodoc.transforms_api import apply_handbook_body_transforms, extract_toc_from_html


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

    md_paths = collect_markdown_files(root, skip_dir_names=cfg.skip_dir_names)
    if not md_paths:
        print("No markdown files found.", file=sys.stderr)
        return 0

    href_by_md: dict[str, str] = {}
    pages: list[tuple[str, str, str]] = []
    for md_path in md_paths:
        slug = slug_from_md_path(md_path, root)
        href_by_md[str(md_path.resolve())] = slug
        text = md_path.read_text(encoding="utf-8")
        nav_title = title_from_md_content(text, title_from_filename(md_path.name))
        if len(nav_title) > 45:
            nav_title = nav_title[:42] + "…"
        md_rel = str(md_path.relative_to(root))
        pages.append((slug, nav_title, md_rel))

    pages.sort(key=lambda x: x[2])

    if dry_run:
        for slug, title, rel in pages:
            print(f"  WOULD generate: {slug}  ({rel})")
        return len(pages)

    cfg.output_dir.mkdir(parents=True, exist_ok=True)
    assets_dir = cfg.output_dir / "assets"
    sync_handbook_assets(cfg.kitchensink, assets_dir)

    hb_name = handbook_title_from_readme(root) if (root / "README.md").exists() else cfg.handbook_name

    origin = (cfg.seo_public_origin or "").rstrip("/")
    prefix = (cfg.seo_url_prefix or "").rstrip("/")
    default_og = (cfg.seo_default_og_image or "").strip()

    for idx, (fslug, _nav_title, md_rel) in enumerate(pages):
        md_path = root / md_rel
        text = md_path.read_text(encoding="utf-8")
        page_title = title_from_md_content(text, title_from_filename(md_path.name))
        _fm, body_md = split_yaml_frontmatter(text)
        body_html = markdown_to_handbook_html(body_md)
        body_html = _rewrite_relative_md_links(body_html, md_path, root, href_by_md)
        body_html, _hm, has_ks = apply_handbook_body_transforms(cfg.kitchensink, body_html)
        intro = plain_text_from_first_paragraph(body_html)
        toc = extract_toc_from_html(cfg.kitchensink, body_html)
        is_template = md_path.name.endswith(".template.md")

        sidebar_html = build_sidebar_links(pages, fslug, id_prefix="nav")
        offcanvas_html = build_sidebar_links(pages, fslug, id_prefix="mob")

        prev_link = (pages[idx - 1][0], pages[idx - 1][1]) if idx > 0 else None
        next_link = (pages[idx + 1][0], pages[idx + 1][1]) if idx < len(pages) - 1 else None

        if cfg.canonical_url_prefix:
            canon = f"{cfg.canonical_url_prefix.rstrip('/')}/{md_rel}"
        else:
            canon = md_rel

        meta_description = ""
        canonical_href = ""
        og_image_href = ""
        json_ld_script = ""
        if origin and prefix:
            canonical_href = f"{origin}{prefix}/{fslug}"
            raw_desc = (_fm.get("description") or intro or page_title).strip()
            meta_description = truncate_meta_description(raw_desc)
            og_image_href = default_og or f"{origin}/assets/layout-schematic-handbook.svg"
            if "/lenses/guides" in prefix:
                crumb = [("Lenses guides", f"{origin}/lenses/index.html")]
            elif prefix == "/ks" or prefix.endswith("/ks"):
                crumb = [("Kitchensink", f"{origin}/ks/index.html")]
            else:
                crumb = [(hb_name, f"{origin}/index.html")]
            crumb.append((page_title, canonical_href))
            json_ld_script = handbook_json_ld(
                page_name=page_title,
                description=meta_description,
                page_url=canonical_href,
                site_name="Blueprints handbook",
                site_url=origin,
                breadcrumb=crumb,
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
        )
        out_path = cfg.output_dir / fslug
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(html_out, encoding="utf-8")
        print(f"  Generated {fslug}")

    return len(pages)
