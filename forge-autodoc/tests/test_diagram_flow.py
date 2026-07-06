"""Enriched flow diagram fences (node:/detail:/more: metadata)."""

from __future__ import annotations

import json
import unittest
from pathlib import Path

from forge_autodoc.ks_path import ensure_kitchensink_importable

_KS_ROOT = Path(__file__).resolve().parents[2]

_ENRICHED_FENCE = (
    '<pre><code class="language-blueprint-diagram">key: linear\n'
    "alt: RAG answer flow from question to cited answer\n"
    "title: RAG answer flow\n"
    "summary: How a question becomes a governed, cited answer.\n"
    "node: rag_query_plan\n"
    "detail: Optional planner that decomposes the question.\n"
    "more: Emits sub-queries so retrieval covers every aspect of the ask.\n"
    "node: Retriever\n"
    "detail: Collects chunks into an EvidencePack.\n"
    "node: answer_from_evidence\n"
    "fallback_ascii: |\n"
    "  rag_query_plan\n"
    "      |\n"
    "      v\n"
    "  Retriever\n"
    "      |\n"
    "      v\n"
    "  answer_from_evidence\n"
    "</code></pre>"
)


class DiagramFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        ensure_kitchensink_importable(_KS_ROOT)

    def test_enriched_fence_renders_flow_figure(self) -> None:
        from transforms import convert_ks_diagram_blocks

        out, has_ks, has_dual = convert_ks_diagram_blocks(_ENRICHED_FENCE)
        self.assertIn("forge-diagram-flow", out)
        self.assertIn('data-ks-hash="Flw"', out)
        self.assertIn('hash="Flw"', out)
        self.assertIn("forge-flow__title", out)
        self.assertIn("RAG answer flow", out)
        self.assertIn("forge-flow-step__detail", out)
        self.assertIn("Optional planner that decomposes the question.", out)
        self.assertIn("openFlowDetailModal", out)
        self.assertTrue(has_ks)
        # fallback_ascii present -> ASCII toggle panel + dual flag for toggle JS
        self.assertTrue(has_dual)
        self.assertIn('data-panel="ascii"', out)

    def test_enriched_fence_embeds_flow_payload(self) -> None:
        from transforms import convert_ks_diagram_blocks

        out, _, _ = convert_ks_diagram_blocks(_ENRICHED_FENCE)
        start = out.index('class="forge-flow-data">') + len('class="forge-flow-data">')
        end = out.index("</script>", start)
        payload = json.loads(out[start:end])
        self.assertEqual(payload["title"], "RAG answer flow")
        self.assertEqual(len(payload["nodes"]), 3)
        self.assertEqual(payload["nodes"][0]["label"], "rag_query_plan")
        self.assertEqual(
            payload["nodes"][0]["more"],
            "Emits sub-queries so retrieval covers every aspect of the ask.",
        )
        self.assertEqual(payload["nodes"][2]["detail"], "")

    def test_enriched_fence_without_ascii_has_no_toggle(self) -> None:
        from transforms import convert_ks_diagram_blocks

        fence = (
            '<pre><code class="language-blueprint-diagram">'
            "title: Two-step flow\n"
            "alt: Two-step flow\n"
            "node: Step A\n"
            "detail: First step.\n"
            "node: Step B\n"
            "</code></pre>"
        )
        out, _, has_dual = convert_ks_diagram_blocks(fence)
        self.assertIn("forge-diagram-flow", out)
        self.assertNotIn("forge-diagram-view-toggle", out)
        self.assertFalse(has_dual)

    def test_legacy_fence_without_nodes_unchanged(self) -> None:
        from transforms import convert_ks_diagram_blocks

        fence = (
            '<pre><code class="language-blueprint-diagram">key: linear\n'
            "alt: Legacy flow\n"
            "fallback_ascii: |\n"
            "  A\n"
            "      |\n"
            "      v\n"
            "  B\n"
            "</code></pre>"
        )
        out, _, has_dual = convert_ks_diagram_blocks(fence)
        self.assertNotIn("forge-diagram-flow", out)
        self.assertIn("ks-diagram-inline-svg", out)
        self.assertTrue(has_dual)

    def test_src_fence_ignores_nodes(self) -> None:
        from transforms import convert_ks_diagram_blocks

        fence = (
            '<pre><code class="language-blueprint-diagram">'
            "src: sdlc/docs/assets/example.svg\n"
            "alt: Content SVG\n"
            "node: Ignored\n"
            "</code></pre>"
        )
        out, _, _ = convert_ks_diagram_blocks(fence)
        self.assertNotIn("forge-diagram-flow", out)
        self.assertIn("ks-diagram-tile", out)


if __name__ == "__main__":
    unittest.main()
