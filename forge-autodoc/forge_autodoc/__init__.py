"""forge-autodoc — KS-based handbook builder from Markdown."""

from __future__ import annotations

from forge_autodoc.assets import sync_handbook_assets
from forge_autodoc.files import (
    DEFAULT_SKIP_DIR_NAMES,
    collect_markdown_files,
    handbook_title_from_readme,
    slug_from_md_path,
    title_from_filename,
    title_from_md_content,
)
from forge_autodoc.markdown_conv import markdown_to_handbook_html
from forge_autodoc.page import assemble_handbook_page
from forge_autodoc.sidebar import FLAT_SIDEBAR_THRESHOLD, PageItem, build_sidebar_links
from forge_autodoc.text import plain_text_from_first_paragraph
from forge_autodoc.transforms_api import apply_handbook_body_transforms, extract_toc_from_html

__all__ = [
    "DEFAULT_SKIP_DIR_NAMES",
    "FLAT_SIDEBAR_THRESHOLD",
    "PageItem",
    "apply_handbook_body_transforms",
    "assemble_handbook_page",
    "build_sidebar_links",
    "collect_markdown_files",
    "extract_toc_from_html",
    "handbook_title_from_readme",
    "markdown_to_handbook_html",
    "plain_text_from_first_paragraph",
    "slug_from_md_path",
    "sync_handbook_assets",
    "title_from_filename",
    "title_from_md_content",
]
