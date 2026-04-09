"""Tests for strip_duplicate_handbook_hero_from_body."""

from __future__ import annotations

from forge_autodoc.text import plain_text_from_first_paragraph, strip_duplicate_handbook_hero_from_body


def test_strip_matching_h1_and_p() -> None:
    body = (
        '<h1 id="x">Page title</h1>'
        '<p>First paragraph lede.</p>'
        '<h2 id="y">Next</h2><p>More.</p>'
    )
    intro = "First paragraph lede."
    out = strip_duplicate_handbook_hero_from_body(body, "Page title", intro)
    assert "<h1" not in out
    assert "First paragraph lede." not in out
    assert '<h2 id="y">Next</h2>' in out


def test_strip_h1_only_when_intro_empty() -> None:
    body = '<h1 id="a">Only H1</h1><ul><li>x</li></ul>'
    out = strip_duplicate_handbook_hero_from_body(body, "Only H1", "")
    assert out.strip().startswith("<ul>")


def test_no_strip_when_h1_differs_from_page_title() -> None:
    body = '<h1 id="a">Markdown title</h1><p>Lede.</p>'
    out = strip_duplicate_handbook_hero_from_body(body, "Nav title", "Lede.")
    assert out == body


def test_truncated_intro_still_strips_matching_paragraph() -> None:
    long_para = "word " * 80 + "end."
    body = f'<h1 id="t">Title</h1><p>{long_para}</p><h2 id="n">Sec</h2>'
    intro = plain_text_from_first_paragraph(body)
    assert intro.endswith("…")
    out = strip_duplicate_handbook_hero_from_body(body, "Title", intro)
    assert "<h1" not in out
    assert long_para not in out
    assert '<h2 id="n">Sec</h2>' in out


def test_related_tail_preserved() -> None:
    body = (
        '<h1 id="h">Hub</h1>'
        "<p>Intro here.</p>"
        '<section class="handbook-related"><h2 id="rel">Related</h2><p>x</p></section>'
    )
    out = strip_duplicate_handbook_hero_from_body(body, "Hub", "Intro here.")
    assert "handbook-related" in out
    assert "Related" in out
    assert "<h1" not in out


def test_h1_with_inner_markup_matches_title() -> None:
    body = '<h1 id="z"><strong>Bold title</strong></h1><p>Lede text.</p><p>Second.</p>'
    out = strip_duplicate_handbook_hero_from_body(body, "Bold title", "Lede text.")
    assert "<h1" not in out
    assert not out.startswith("<p>Lede text.")
    assert "Second." in out


def test_p_with_class_attribute() -> None:
    body = '<h1 id="a">T</h1><p class="foo">Lede.</p><p>Rest.</p>'
    out = strip_duplicate_handbook_hero_from_body(body, "T", "Lede.")
    assert "<h1" not in out
    assert out.strip().startswith("<p")
