"""Spatial surfaces — flip, holo, tilt, zigzag, parallax, iso tile."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "components"))

from spatial import (  # noqa: E402
    render_flip_card,
    render_holo_card,
    render_iso_tile,
    render_media_frame_parallax,
    render_tilt_css_card,
    render_zigzag_divider,
)

from spatial_showcase_common import SPATIAL_CSS, SPATIAL_JS_POINTER, behavior_callout  # noqa: E402

PAGE = {
    "slug": "spatial-surfaces",
    "title": "Spatial Surfaces",
    "intro": "3D surface treatments — cards, tilt zones, dividers, and parallax frames.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 7.1,
    "toc": [
        ("sec-intro", "Overview"),
        ("sec-flip-card", "Flip card"),
        ("sec-tilt-css", "CSS-only tilt"),
        ("sec-holo-card", "Holographic card"),
        ("sec-zigzag", "Zigzag divider"),
        ("sec-media-parallax", "Media parallax"),
        ("sec-iso-tile", "Isometric tile"),
    ],
}


def extra_css() -> str:
    return SPATIAL_CSS


def extra_js_paths() -> list[str]:
    return list(SPATIAL_JS_POINTER)


def render() -> str:
    bc = behavior_callout
    return f"""\
<div class="forge-callout forge-callout-cyan mb-4" id="sec-intro">
  <p class="callout-label mb-1">Category</p>
  <p class="mb-0">Surface primitives from the <a href="spatial-effects.html">Spatial hub</a>.
  Specs: <code>docs/design/spatial/effects/</code>.</p>
</div>

<section id="sec-flip-card" class="ks-section">
  <h2 class="ks-section-title">Flip card</h2>
  <div class="row g-3"><div class="col-md-6">
  {render_flip_card(
      '<span class="card-label">Front</span><p class="mb-0">Governed intent surface.</p>',
      '<span class="card-label text-cyan">Back</span><p class="mb-0">Evidence and next action.</p>',
      trigger_id="demo-flip-1",
  )}
  </div></div>
  {bc("ks-card--flip", "Click Flip: inner rotates ~180deg on Y.")}
</section>

<section id="sec-tilt-css" class="ks-section">
  <h2 class="ks-section-title">CSS-only tilt</h2>
  {render_tilt_css_card('<span class="section-label">Zone tilt</span><p class="mb-0 forge-support">Tab zones or click radios.</p>')}
  {bc("ks-tilt--css", "Selecting a zone applies rotateX/Y to inner card.")}
</section>

<section id="sec-holo-card" class="ks-section">
  <h2 class="ks-section-title">Holographic card</h2>
  {render_holo_card('<span class="card-label text-cyan">Premium</span><p class="mb-0">Pointer-driven iridescent glare.</p>')}
  {bc("ks-card--holo", "Pointer moves update --ks-rx/--ks-ry and glare position.")}
</section>

<section id="sec-zigzag" class="ks-section">
  <h2 class="ks-section-title">Zigzag 3D divider</h2>
  {render_zigzag_divider()}
  {bc("ks-divider--zigzag-3d", "Paper-cut section edge; pure CSS conic-gradient + mask.")}
</section>

<section id="sec-media-parallax" class="ks-section">
  <h2 class="ks-section-title">Inner-frame parallax</h2>
  {render_media_frame_parallax('<div class="glass p-4 text-center"><span class="section-label">Media</span></div>')}
  {bc("ks-media--frame-parallax", "Inner layer scales and translateZ on hover.")}
</section>

<section id="sec-iso-tile" class="ks-section">
  <h2 class="ks-section-title">Isometric tile</h2>
  <div style="padding: 2rem 0;">
  {render_iso_tile('<span class="section-label">ISO</span><p class="mb-0 forge-support">Bento lift</p>')}
  </div>
  {bc("ks-tile--iso", "rotateX(60deg) rotateZ(-45deg) elevated tile.")}
</section>
"""
