"""Spatial ambient — display depth, tunnel, perspective stage, floating header."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "components"))

from spatial import (  # noqa: E402
    render_display_depth,
    render_floating_header,
    render_perspective_stage,
    render_tunnel_ambient,
)

from spatial_showcase_common import (  # noqa: E402
    SPATIAL_CSS,
    SPATIAL_JS_SCROLL,
    behavior_callout,
)

PAGE = {
    "slug": "spatial-ambient",
    "title": "Spatial Ambient",
    "intro": "Depth typography, tunnel backdrops, and scroll-linked volumetric headlines.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 7.3,
    "toc": [
        ("sec-intro", "Overview"),
        ("sec-display-depth", "Display depth"),
        ("sec-tunnel", "Tunnel ambient"),
        ("sec-perspective-stage", "Perspective stage"),
        ("sec-floating-header", "Floating header"),
    ],
}


def extra_css() -> str:
    return SPATIAL_CSS


def extra_js_paths() -> list[str]:
    return list(SPATIAL_JS_SCROLL)


def render() -> str:
    bc = behavior_callout
    return f"""\
<div class="forge-callout forge-callout-cyan mb-4" id="sec-intro">
  <p class="callout-label mb-1">Category</p>
  <p class="mb-0">Ambient depth from the <a href="spatial-effects.html">Spatial hub</a>.</p>
</div>

<section id="sec-display-depth" class="ks-section">
  <h2 class="ks-section-title">Volumetric display</h2>
  {render_display_depth("Spatial headline")}
  {bc("ks-display--depth", "Display text lifted with rotateX and translateZ depth.")}
</section>

<section id="sec-tunnel" class="ks-section">
  <h2 class="ks-section-title">Tunnel ambient</h2>
  {render_tunnel_ambient(caption="Hero backdrop — infinite grid drift (paused when reduced motion).")}
  {bc("ks-ambient--tunnel", "Perspective grid animates translateY; static when reduced motion.")}
</section>

<section id="sec-perspective-stage" class="ks-section">
  <h2 class="ks-section-title">Perspective stage</h2>
  {render_perspective_stage('<div class="glass p-4"><p class="mb-0">Layered section content with depth.</p></div>')}
  {bc("ks-section--perspective-stage", "Child layer translateZ for staged sections.")}
</section>

<section id="sec-floating-header" class="ks-section">
  <h2 class="ks-section-title">Floating header</h2>
  {render_floating_header("Floating title")}
  {bc("ks-display--depth--float", "Scroll-linked volumetric headline variant.")}
</section>
"""
