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

    def test_generic_alt_replaced_by_catalog_key(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = '<pre><code class="language-blueprint-diagram">key: linear\nalt: Diagram\n</code></pre>'
        out, _, _ = convert_ks_diagram_blocks(md_html)
        self.assertNotIn('alt="Diagram"', out)
        self.assertIn("Linear flow diagram template", out)
        self.assertIn('role="figure"', out)

    def test_caption_overrides_generic_alt(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = (
            '<pre><code class="language-blueprint-diagram">key: linear\n'
            "alt: Diagram\ncaption: Sprint cadence overview\n</code></pre>"
        )
        out, _, _ = convert_ks_diagram_blocks(md_html)
        self.assertIn('alt="Sprint cadence overview"', out)

    def test_decorative_tile_empty_alt(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = (
            '<pre><code class="language-blueprint-diagram">key: linear\n'
            "decorative: true\n</code></pre>"
        )
        out, _, _ = convert_ks_diagram_blocks(md_html)
        self.assertRegex(out, r'alt=""')
        self.assertIn('aria-hidden="true"', out)
        self.assertIn('role="presentation"', out)

    def test_expand_trigger_preserved(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = '<pre><code class="language-blueprint-diagram-expand">key: linear\n</code></pre>'
        out, _, _ = convert_ks_diagram_blocks(md_html)
        self.assertIn("forge-diagram-trigger", out)
        self.assertIn("openDiagramWithDetail", out)

    def test_single_line_key_gets_catalog_alt(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = '<pre><code class="language-blueprint-diagram">linear\n</code></pre>'
        out, _, _ = convert_ks_diagram_blocks(md_html)
        self.assertIn("Linear flow diagram template", out)

    def test_ascii_generic_alt_uses_catalog(self) -> None:
        from transforms import convert_ascii_diagram_blocks

        body = "key: linear\nalt: Diagram\n+---+"
        md_html = f'<pre><code class="language-blueprint-diagram-ascii">{body}</code></pre>'
        out, _, _ = convert_ascii_diagram_blocks(md_html)
        self.assertIn("Linear flow diagram template", out)


    def test_fallback_without_src_is_ascii_only(self) -> None:
        from transforms import convert_ks_diagram_blocks

        body = (
            "key: swimlane\nalt: L0 assisted flow\nfallback_ascii: |\n"
            "  [Human operator]\n"
            "        |\n"
            "        v\n"
        )
        md_html = f'<pre><code class="language-blueprint-diagram">{body}</code></pre>'
        out, has_ks, has_dual = convert_ks_diagram_blocks(md_html)
        self.assertTrue(has_ks)
        self.assertFalse(has_dual)
        self.assertIn("forge-diagram-ascii", out)
        self.assertNotIn("forge-diagram-dual", out)
        self.assertNotIn("forge-diagram-view-toggle", out)
        self.assertNotIn("template-swimlane", out)
        self.assertIn("[Human operator]", out)

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

        md_html = '<pre><code class="language-blueprint-diagram">key: linear\n</code></pre>'
        out, _, has_dual = convert_ks_diagram_blocks(md_html)
        self.assertFalse(has_dual)
        self.assertNotIn("forge-diagram-dual", out)
        self.assertIn("ks-diagram-tile", out)


if __name__ == "__main__":
    unittest.main()
