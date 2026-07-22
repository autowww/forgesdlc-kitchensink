"""Spatial effects hub — index linking to category showcase pages."""
from __future__ import annotations

PAGE = {
    "slug": "spatial-effects",
    "title": "Spatial & 3D Effects",
    "intro": "Governed spatial primitives — organized by category.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 7,
    "toc": [
        ("sec-intro", "Overview"),
        ("sec-categories", "Categories"),
        ("sec-moved", "Moved sections"),
    ],
}


def render() -> str:
    return """\
<div class="forge-callout forge-callout-cyan mb-4" id="sec-intro">
  <p class="callout-label mb-1">Dual-wiki</p>
  <p class="mb-0">Maintainer specs live in <code>docs/design/spatial/effects/</code>;
  machine oracles in <code>docs/design/spatial/oracles/</code>.
  Verification: <code>tools/spatial-effects-verifier/</code> and LCDL
  <code>ks_spatial_effect_evaluate_v1</code>.</p>
</div>

<section id="sec-categories" class="ks-section">
  <h2 class="ks-section-title">Categories</h2>
  <div class="row g-3">
    <div class="col-md-6">
      <a class="forge-card p-3 d-block text-decoration-none h-100" href="spatial-surfaces.html">
        <span class="card-label text-cyan">Surfaces</span>
        <p class="mb-0 forge-support">Flip card, holo card, CSS tilt, zigzag, parallax, iso tile.</p>
      </a>
    </div>
    <div class="col-md-6">
      <a class="forge-card p-3 d-block text-decoration-none h-100" href="spatial-controls.html">
        <span class="card-label text-amber">Controls</span>
        <p class="mb-0 forge-support">Cube CTA, switches, range, flip choice, badge, dial.</p>
      </a>
    </div>
    <div class="col-md-6">
      <a class="forge-card p-3 d-block text-decoration-none h-100" href="spatial-ambient.html">
        <span class="card-label">Ambient</span>
        <p class="mb-0 forge-support">Display depth, tunnel, perspective stage, floating header.</p>
      </a>
    </div>
    <div class="col-md-6">
      <a class="forge-card p-3 d-block text-decoration-none h-100" href="spatial-rails.html">
        <span class="card-label">Rails</span>
        <p class="mb-0 forge-support">Cube gallery, draggable cube, spatial coverflow rail.</p>
      </a>
    </div>
  </div>
</section>

<section id="sec-moved" class="ks-section">
  <h2 class="ks-section-title">Moved sections</h2>
  <p class="forge-support">Deep links from the monolithic page are preserved on category pages with the same <code>#sec-*</code> anchors.</p>
  <ul class="forge-support">
    <li><a href="spatial-surfaces.html#sec-flip-card">Flip card</a> · <a href="spatial-surfaces.html#sec-holo-card">Holo card</a></li>
    <li><a href="spatial-controls.html#sec-volumetric-switch">Volumetric switch</a> · <a href="spatial-controls.html#sec-depth-dial">Depth dial</a></li>
    <li><a href="spatial-ambient.html#sec-tunnel">Tunnel</a> · <a href="spatial-ambient.html#sec-floating-header">Floating header</a></li>
    <li><a href="spatial-rails.html#sec-spatial-rail">Spatial rail</a> · <a href="spatial-rails.html#sec-cube-gallery">Cube gallery</a></li>
  </ul>
</section>
"""
