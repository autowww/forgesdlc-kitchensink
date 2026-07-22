"""Spatial rails — cube gallery, draggable cube, coverflow rail."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "components"))

from spatial import (  # noqa: E402
    render_cube_gallery,
    render_draggable_cube,
    render_spatial_rail,
    render_spatial_rail_item,
)

from spatial_showcase_common import (  # noqa: E402
    SPATIAL_CSS,
    SPATIAL_JS_CUBE,
    SPATIAL_JS_RAIL,
    behavior_callout,
)

PAGE = {
    "slug": "spatial-rails",
    "title": "Spatial Rails",
    "intro": "3D galleries and coverflow scroll rails.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 7.4,
    "toc": [
        ("sec-intro", "Overview"),
        ("sec-cube-gallery", "Cube gallery"),
        ("sec-draggable-cube", "Draggable cube"),
        ("sec-spatial-rail", "Spatial rail"),
    ],
}


def extra_css() -> str:
    return SPATIAL_CSS


def extra_js_paths() -> list[str]:
    return list(SPATIAL_JS_CUBE) + list(SPATIAL_JS_RAIL)


def render() -> str:
    rail_items = "".join(
        render_spatial_rail_item(
            f'<div class="forge-card p-3"><span class="card-label">Slide {i}</span>'
            f"<p class=\"mb-0 forge-support\">Coverflow item {i}</p></div>"
        )
        for i in range(1, 6)
    )
    bc = behavior_callout
    return f"""\
<div class="forge-callout forge-callout-cyan mb-4" id="sec-intro">
  <p class="callout-label mb-1">Category</p>
  <p class="mb-0">Rail and gallery primitives from the <a href="spatial-effects.html">Spatial hub</a>.</p>
</div>

<section id="sec-cube-gallery" class="ks-section">
  <h2 class="ks-section-title">Cube gallery</h2>
  {render_cube_gallery(["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"])}
  {bc("ks-cube-gallery", "Pointer X rotates scene on Y; six labeled faces.")}
</section>

<section id="sec-draggable-cube" class="ks-section">
  <h2 class="ks-section-title">Draggable cube</h2>
  {render_draggable_cube()}
  {bc("ks-cube--draggable", "Drag rotates cube; face opacity simulates lighting.")}
</section>

<section id="sec-spatial-rail" class="ks-section">
  <h2 class="ks-section-title">Spatial rail</h2>
  <p class="forge-support mb-3">Coverflow rail — scroll to shift per-item rotateY and translateZ.</p>
  {render_spatial_rail(rail_items)}
  {bc("fs-rail--spatial", "Scroll updates --ks-rail-ry and --ks-rail-z per item.")}
</section>
"""
