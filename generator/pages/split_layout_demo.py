"""First-class showcase page using split_page (two-column main)."""

from __future__ import annotations

PAGE = {
    "slug": "split-layout",
    "title": "Split layout",
    "intro": "Two-column main: interactive or demo content left, documentation right.",
    "family": "Patterns",
    "layout": "split",
    "order": 8.4,
    "toc": [
        ("sec-split-left", "Left column"),
        ("sec-split-right", "Right column"),
    ],
}


def render() -> str:
    return """\
<section id="sec-split-left" class="ks-section">
  <h2 class="ks-section-title">Left column (<code>left_html</code>)</h2>
  <p class="forge-support mb-3">This page is built with <code>layout: &quot;split&quot;</code> in <code>PAGE</code>. The generator passes this body to <code>split_page(..., left_html=…)</code>. Use it for playgrounds, live components, or embedded previews alongside prose.</p>
  <div class="p-4 rounded border" style="border-color:var(--forge-border)!important">
    <p class="section-label text-cyan mb-2">Example panel</p>
    <p class="forge-support mb-0">Same pattern as <code>preview-split.html</code>, but routed through the normal showcase sidebar and assets.</p>
  </div>
</section>"""


def render_right() -> str:
    return """\
<section id="sec-split-right" class="ks-section">
  <h2 class="ks-section-title">Right column (<code>right_html</code>)</h2>
  <p class="forge-support mb-0">Defined by <code>render_right()</code> in <code>generator/pages/split_layout_demo.py</code>. Pair with API tables, props, or long-form notes while keeping the demo visible on the left.</p>
</section>"""
