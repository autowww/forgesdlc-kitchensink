"""Tests for title and frontmatter helpers in ``files``."""

from __future__ import annotations

import unittest

from forge_autodoc.files import strip_leading_yaml_frontmatter, title_from_md_content


class TitleFromMdContentTests(unittest.TestCase):
    def test_h1_without_frontmatter(self) -> None:
        self.assertEqual(title_from_md_content("# Hello world\n\nBody.", "fallback"), "Hello world")

    def test_h1_after_yaml_frontmatter(self) -> None:
        text = "---\nnav_title: X\n---\n\n# Lenses overview\n\nBody."
        self.assertEqual(title_from_md_content(text, "fallback"), "Lenses overview")

    def test_no_h1_uses_fallback(self) -> None:
        text = "---\nfoo: bar\n---\n\nParagraph only.\n"
        self.assertEqual(title_from_md_content(text, "fallback"), "fallback")


class StripFrontmatterTests(unittest.TestCase):
    def test_strips_simple_block(self) -> None:
        text = "---\na: b\n---\n\n# T\n"
        self.assertEqual(strip_leading_yaml_frontmatter(text).strip(), "# T")

    def test_no_op_without_frontmatter(self) -> None:
        text = "# Direct\n"
        self.assertEqual(strip_leading_yaml_frontmatter(text), "# Direct\n")


if __name__ == "__main__":
    unittest.main()
