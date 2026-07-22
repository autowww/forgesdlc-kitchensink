"""KS creation mind-map — static, dynamic, and editable tiers."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "components"))

from mindmap import (  # noqa: E402
    get_ks_creation_mindmap_demo,
    render_mindmap_dynamic,
    render_mindmap_editable,
    render_mindmap_static,
)

MINDMAP_CSS = '  <link rel="stylesheet" href="assets/ks-mindmap.css" />\n'
MINDMAP_JS = [
    "assets/ks-mindmap-layout.js",
    "assets/ks-mindmap.js",
    "assets/ks-mindmap-editable.js",
]

PAGE = {
    "slug": "ks-creation-mindmap",
    "title": "KS creation mind-map",
    "intro": "Governed mind-map primitives — static SVG, dynamic collapse, and editable API tiers sharing one JSON tree contract.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 5.55,
    "toc": [
        ("sec-poc-intro", "About this page"),
        ("sec-mindmap-static", "Static (printable)"),
        ("sec-mindmap-dynamic", "Dynamic (collapse)"),
        ("sec-mindmap-editable-static", "Editable — static mode"),
        ("sec-mindmap-editable-api", "Editable — API demo"),
    ],
}


def extra_css() -> str:
    return MINDMAP_CSS


def extra_js_paths() -> list[str]:
    return list(MINDMAP_JS)


def render() -> str:
    demo = get_ks_creation_mindmap_demo()
    static_block = render_mindmap_static(demo, mount_id="ks-mm-static")
    dynamic_block = render_mindmap_dynamic(demo, mount_id="ks-mm-dynamic")
    editable_static = render_mindmap_editable(
        mode="static",
        mount_id="ks-mm-editable-static",
        tree=demo,
        save_demo=True,
        mindmap_id="ks-creation-static",
    )
    editable_api = render_mindmap_editable(
        mode="dynamic",
        mount_id="ks-mm-editable-api",
        load_url="assets/mindmap-ks-creation.json",
        save_url="",
        save_demo=True,
        mindmap_id="ks-creation-api",
    )

    return f"""\
<section id="sec-poc-intro" class="ks-section">
  <h2 class="ks-section-title">About this page</h2>
  <p class="forge-support mb-3">This showcase documents the <strong>Kmm</strong> mind-map family: three tiers that share a single JSON tree contract (<code>version</code>, <code>title</code>, <code>root</code>). The demo tree reconstructs <strong>prompt and planning themes</strong> behind Kitchen Sink — illustrative, not a chat export.</p>
  <p class="forge-support mb-0"><strong>Static</strong> (<code>Mms</code>) is server-rendered SVG for print. <strong>Dynamic</strong> (<code>Mmd</code>) collapses branches and reflows on resize. <strong>Editable</strong> (<code>Mme</code>) supports label edit plus add/delete with GET load and POST save (demo mode uses <code>sessionStorage</code> on static hosting). Legacy Mermaid examples remain on <a href="diagram-code-examples.html#sec-diagcode-mindmap">Diagram-as-code</a>.</p>
</section>

<section id="sec-mindmap-static" class="ks-section">
  <h2 class="ks-section-title">Static (printable)</h2>
  <p class="forge-support mb-3">Orthogonal connectors, light palette, no JavaScript required. Click the diagram to open the modal zoom viewer.</p>
  {static_block}
</section>

<section id="sec-mindmap-dynamic" class="ks-section">
  <h2 class="ks-section-title">Dynamic (collapse)</h2>
  <p class="forge-support mb-3">Branches start collapsed below depth 1. Click a node or chevron to expand/collapse; layout reflows on resize (vertical stack under 480px).</p>
  {dynamic_block}
</section>

<section id="sec-mindmap-editable-static" class="ks-section">
  <h2 class="ks-section-title">Editable — static mode</h2>
  <p class="forge-support mb-3">Select a node, edit its label inline, add children or siblings, then Save (demo persists to <code>sessionStorage</code>).</p>
  {editable_static}
</section>

<section id="sec-mindmap-editable-api" class="ks-section">
  <h2 class="ks-section-title">Editable — API demo</h2>
  <p class="forge-support mb-3">Loads tree JSON from <code>assets/mindmap-ks-creation.json</code> via GET. Save uses demo fallback when no POST endpoint is configured (Firebase static hosting).</p>
  {editable_api}
</section>"""
