"""Golden-style checks for Markdown conversion."""

from __future__ import annotations

import unittest

from forge_autodoc.markdown_conv import markdown_to_handbook_html


class MarkdownPipelineTests(unittest.TestCase):
    def test_markdown_heading_and_table(self) -> None:
        html = markdown_to_handbook_html("# Hello\n\n|a|b|\n|-|-|\n|1|2|\n")
        self.assertIn("<h1", html)
        self.assertIn("Hello", html)
        self.assertNotIn("forge-table-wrap", html)
        self.assertIn("<table", html)

    def test_toc_extension_generates_id(self) -> None:
        html = markdown_to_handbook_html("## Section A\n\nBody.\n")
        self.assertIn('id="', html)


if __name__ == "__main__":
    unittest.main()
