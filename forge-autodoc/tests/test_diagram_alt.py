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
        out, _ = convert_ks_diagram_blocks(md_html)
        self.assertNotIn('alt="Diagram"', out)
        self.assertIn("Linear flow diagram template", out)
        self.assertIn('role="figure"', out)

    def test_caption_overrides_generic_alt(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = (
            '<pre><code class="language-blueprint-diagram">key: linear\n'
            "alt: Diagram\ncaption: Sprint cadence overview\n</code></pre>"
        )
        out, _ = convert_ks_diagram_blocks(md_html)
        self.assertIn('alt="Sprint cadence overview"', out)

    def test_decorative_tile_empty_alt(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = (
            '<pre><code class="language-blueprint-diagram">key: linear\n'
            "decorative: true\n</code></pre>"
        )
        out, _ = convert_ks_diagram_blocks(md_html)
        self.assertRegex(out, r'alt=""')
        self.assertIn('aria-hidden="true"', out)
        self.assertIn('role="presentation"', out)

    def test_expand_trigger_preserved(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = '<pre><code class="language-blueprint-diagram-expand">key: linear\n</code></pre>'
        out, _ = convert_ks_diagram_blocks(md_html)
        self.assertIn("forge-diagram-trigger", out)
        self.assertIn("openDiagramWithDetail", out)

    def test_single_line_key_gets_catalog_alt(self) -> None:
        from transforms import convert_ks_diagram_blocks

        md_html = '<pre><code class="language-blueprint-diagram">linear\n</code></pre>'
        out, _ = convert_ks_diagram_blocks(md_html)
        self.assertIn("Linear flow diagram template", out)

    def test_ascii_generic_alt_uses_catalog(self) -> None:
        from transforms import convert_ascii_diagram_blocks

        body = "key: linear\nalt: Diagram\n+---+"
        md_html = f'<pre><code class="language-blueprint-diagram-ascii">{body}</code></pre>'
        out, _, _ = convert_ascii_diagram_blocks(md_html)
        self.assertIn("Linear flow diagram template", out)


if __name__ == "__main__":
    unittest.main()
