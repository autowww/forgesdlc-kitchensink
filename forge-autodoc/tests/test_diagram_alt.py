"""Diagram tile alt text resolution (Kitchen Sink transforms)."""

from __future__ import annotations

import unittest
from pathlib import Path

from forge_autodoc.ks_path import ensure_kitchensink_importable

_KS_ROOT = Path(__file__).resolve().parents[2]


class DiagramAltTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        ensure_kitchensink_importable(_KS_ROOT)

    def test_key_only_placeholder_suppressed(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = '<pre><code class="language-blueprint-diagram">key: linear\nalt: Diagram\n</code></pre>'
        out, _, _ = convert_ks_diagram_blocks(md_html)
        self.assertEqual(out.strip(), "")
        self.assertNotIn("template-linear", out)
        self.assertNotIn("ks-diagram-tile", out)

    def test_caption_without_src_or_fallback_suppressed(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = (
            '<pre><code class="language-blueprint-diagram">key: linear\n'
            "alt: Diagram\ncaption: Sprint cadence overview\n</code></pre>"
        )
        out, _, _ = convert_ks_diagram_blocks(md_html)
        self.assertEqual(out.strip(), "")

    def test_decorative_key_only_suppressed(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = (
            '<pre><code class="language-blueprint-diagram">key: linear\n'
            "decorative: true\n</code></pre>"
        )
        out, _, _ = convert_ks_diagram_blocks(md_html)
        self.assertEqual(out.strip(), "")

    def test_expand_key_only_suppressed(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = '<pre><code class="language-blueprint-diagram-expand">key: linear\n</code></pre>'
        out, _, _ = convert_ks_diagram_blocks(md_html)
        self.assertEqual(out.strip(), "")

    def test_single_line_key_only_suppressed(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = '<pre><code class="language-blueprint-diagram">linear\n</code></pre>'
        out, _, _ = convert_ks_diagram_blocks(md_html)
        self.assertEqual(out.strip(), "")

    def test_src_only_still_renders_tile(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = (
            '<pre><code class="language-blueprint-diagram">'
            "src: sdlc/docs/assets/testing-test-pyramid.svg\n"
            "alt: Test pyramid\n</code></pre>"
        )
        out, _, _ = convert_ks_diagram_blocks(md_html)
        self.assertIn("ks-diagram-tile", out)
        self.assertIn("testing-test-pyramid.svg", out)

    def test_ascii_generic_alt_uses_catalog(self) -> None:
        from transforms import convert_ascii_diagram_blocks

        body = "key: linear\nalt: Diagram\n+---+"
        md_html = f'<pre><code class="language-blueprint-diagram-ascii">{body}</code></pre>'
        out, _, _ = convert_ascii_diagram_blocks(md_html)
        self.assertIn("Linear flow diagram template", out)


    def test_fallback_without_src_uses_generated_svg_dual_view(self) -> None:
        from transforms import convert_ks_diagram_blocks

        body = (
            "key: swimlane\nalt: L0 assisted flow\nfallback_ascii: |\n"
            "  [Human operator]\n"
            "        |\n"
            "        v\n"
            "  [Agent assist]\n"
        )
        md_html = f'<pre><code class="language-blueprint-diagram">{body}</code></pre>'
        out, has_ks, has_dual = convert_ks_diagram_blocks(md_html)
        self.assertTrue(has_ks)
        self.assertTrue(has_dual)
        self.assertIn("forge-diagram-dual", out)
        self.assertIn("forge-diagram-view-toggle", out)
        self.assertIn("<svg", out)
        self.assertIn("[Human operator]", out)
        self.assertNotIn("template-swimlane", out)

    def test_dual_view_toggle_when_fallback_ascii(self) -> None:
        from transforms import convert_ks_diagram_blocks

        body = (
            "src: custom/foo.svg\nalt: Three-step handoff\nfallback_ascii: |\n"
            "  A --> B --> C\n"
        )
        md_html = f'<pre><code class="language-blueprint-diagram">{body}</code></pre>'
        out, has_ks, has_dual = convert_ks_diagram_blocks(md_html)
        self.assertTrue(has_ks)
        self.assertTrue(has_dual)
        self.assertIn("forge-diagram-dual", out)
        self.assertIn("forge-diagram-view-toggle", out)
        self.assertIn("A --&gt; B --&gt; C", out)
        self.assertIn('data-diagram-view="svg"', out)
        self.assertIn("ASCII view", out)

    def test_no_toggle_without_fallback_ascii(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = (
            '<pre><code class="language-blueprint-diagram">'
            "src: custom/foo.svg\nkey: linear\n</code></pre>"
        )
        out, _, has_dual = convert_ks_diagram_blocks(md_html)
        self.assertFalse(has_dual)
        self.assertNotIn("forge-diagram-dual", out)
        self.assertIn("ks-diagram-tile", out)


if __name__ == "__main__":
    unittest.main()
