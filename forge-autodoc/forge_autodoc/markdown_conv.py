"""Markdown → HTML with the same extensions as the blueprints handbook."""

from __future__ import annotations

import re

import markdown
from markdown.extensions.toc import TocExtension


def markdown_to_handbook_html(text: str) -> str:
    """Convert markdown to HTML (tables, fenced code, ToC ids, meta, attr_list)."""
    md = markdown.Markdown(
        extensions=[
            "tables",
            "fenced_code",
            TocExtension(
                permalink=False,
                slugify=lambda v, s: re.sub(r"[^\w-]", "", v.lower().replace(" ", "-")),
            ),
            "meta",
            "attr_list",
        ]
    )
    return md.convert(text)
