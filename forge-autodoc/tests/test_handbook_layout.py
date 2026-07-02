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
