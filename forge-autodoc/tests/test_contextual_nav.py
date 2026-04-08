"""Tests for contextual handbook navigation helpers."""

from forge_autodoc.contextual_nav import (
    lenses_split_family_pages,
    related_pages_section_html,
    split_topic_parent_basename,
)


def test_split_topic_parent_basename() -> None:
    assert split_topic_parent_basename("11-wizard-301_01-artifact-bundles.md") == "11-wizard-301.md"
    assert split_topic_parent_basename("03-workspace-setup_02-root-choice.md") == "03-workspace-setup.md"
    assert split_topic_parent_basename("05-studio-101.md") is None
    assert split_topic_parent_basename("README.md") is None


def test_related_pages_section_html_empty() -> None:
    assert related_pages_section_html([]) == ""


def test_lenses_split_family_pages() -> None:
    pages = [
        ("a.html", "A", "11-wizard-301.md"),
        ("b.html", "B", "11-wizard-301_01-x.md"),
        ("c.html", "C", "05-studio-101.md"),
    ]
    fam = lenses_split_family_pages("11-wizard-301_01-x.md", pages)
    assert len(fam) == 2
    fam2 = lenses_split_family_pages("05-studio-101.md", pages)
    assert len(fam2) == 1


def test_related_pages_section_html_renders() -> None:
    html = related_pages_section_html([("a.html", "Page A"), ("b.html", "Page B")])
    assert "Related pages" in html
    assert 'href="a.html"' in html
    assert "Page A" in html
