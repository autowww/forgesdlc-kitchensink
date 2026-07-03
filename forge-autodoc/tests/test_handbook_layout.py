"""Smoke tests for handbook_page layout markup (wide-screen grid contract)."""

from __future__ import annotations

from pathlib import Path

from forge_autodoc.ks_path import ensure_kitchensink_importable


def test_handbook_page_uses_hugged_toc_flow_with_sidebar() -> None:
    ks_root = Path(__file__).resolve().parents[2]
    ensure_kitchensink_importable(ks_root)

    from components import render_toc_sidebar
    from layouts import handbook_page

    toc_html = render_toc_sidebar([("intro", "Introduction", 2)])
    html = handbook_page(
        browser_title="Test",
        handbook_name="Handbook",
        page_title="Autonomy levels",
        intro="Intro lede.",
        body_html="<h2 id=\"intro\">Introduction</h2><p>Body copy.</p>",
        toc_sidebar_html=toc_html,
        sidebar_html="<nav class=\"nav flex-column\"><a href=\"#\">Link</a></nav>",
        offcanvas_html="<nav class=\"nav flex-column\"><a href=\"#\">Link</a></nav>",
        footer_html="",
        template_banner="",
        canonical_note="",
        nav_buttons="",
    )

    assert "doc-content w-100 doc-content--with-sidebar" in html
    assert "ks-doc-toc-flow" in html
    assert "ks-doc-toc-prose" in html
    assert "ks-doc-toc-rail" in html
    assert "mx-auto doc-content" not in html
    assert "ks-handbook-shell" in html
    assert "ks-handbook-main" in html
    assert "col-xl-10" not in html


def test_assemble_handbook_page_emits_doc_header_with_breadcrumbs() -> None:
    ks_root = Path(__file__).resolve().parents[2]
    from forge_autodoc.page import assemble_handbook_page

    html = assemble_handbook_page(
        kitchensink_root=ks_root,
        browser_title="Test",
        handbook_name="Handbook",
        page_title="Autonomy levels",
        intro="How teams choose agent autonomy.",
        body_html="<h2 id=\"intro\">Introduction</h2><p>Body copy.</p>",
        toc=[("intro", "Introduction", 2)],
        sidebar_html="<nav></nav>",
        offcanvas_html="<nav></nav>",
        prev_link=None,
        next_link=None,
        canonical_md="https://github.com/example/repo/blob/main/page.md",
        is_template=False,
        show_canonical_note=False,
        breadcrumb_items=[
            ("index.html", "Handbook"),
            ("sdlc--index.html", "SDLC"),
            (None, "Autonomy levels"),
        ],
        page_type="guide",
        canonical_source_href="https://github.com/example/repo/blob/main/page.md",
    )

    assert "ks-doc-header" in html
    assert "ks-doc-breadcrumb" in html
    assert "ks-doc-meta" in html
    assert "Autonomy levels" in html
    assert "How teams choose agent autonomy." in html
