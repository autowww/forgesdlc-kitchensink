"""Spatial effects showcase — dual-wiki handbook surface for 3D primitives."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "components"))

from spatial import (  # noqa: E402
    render_cube_gallery,
    render_cube_glow_button,
    render_depth_dial,
    render_display_depth,
    render_draggable_cube,
    render_flip_card,
    render_flip_choice,
    render_floating_header,
    render_holo_badge,
    render_holo_card,
    render_iso_tile,
    render_media_frame_parallax,
    render_perspective_stage,
    render_spatial_rail,
    render_spatial_rail_item,
    render_tactile_range,
    render_tilt_css_card,
    render_tunnel_ambient,
    render_volumetric_switch,
    render_zigzag_divider,
)

PAGE = {
    "slug": "spatial-effects",
    "title": "Spatial & 3D Effects",
    "intro": "Governed spatial primitives with oracles and Playwright verification.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 7,
    "toc": [
        ("sec-intro", "Overview"),
        ("sec-flip-card", "Flip card"),
        ("sec-tilt-css", "CSS-only tilt"),
        ("sec-holo-card", "Holographic card"),
        ("sec-zigzag", "Zigzag divider"),
        ("sec-display-depth", "Display depth"),
        ("sec-cube-btn", "Cube glow button"),
        ("sec-volumetric-switch", "Volumetric switch"),
        ("sec-tactile-range", "Tactile range"),
        ("sec-flip-choice", "Flip choice"),
        ("sec-holo-badge", "Holographic badge"),
        ("sec-media-parallax", "Media parallax"),
        ("sec-cube-gallery", "Cube gallery"),
        ("sec-draggable-cube", "Draggable cube"),
        ("sec-tunnel", "Tunnel ambient"),
        ("sec-perspective-stage", "Perspective stage"),
        ("sec-iso-tile", "Isometric tile"),
        ("sec-floating-header", "Floating header"),
        ("sec-depth-dial", "Depth dial"),
        ("sec-neumorphic-switch", "Neumorphic switch"),
        ("sec-spatial-rail", "Spatial rail"),
    ],
}


def extra_css() -> str:
    return '<link rel="stylesheet" href="assets/ks-spatial.css">'


def extra_js_paths() -> list[str]:
    return [
        "assets/ks-pointer-depth.js",
        "assets/ks-tilt-tiles.js",
        "assets/ks-spatial-cube.js",
        "assets/ks-spatial-rail.js",
    ]


def _behavior_callout(classes: str, behavior: str) -> str:
    return (
        f'<div class="forge-callout forge-callout-surface mt-3">'
        f'<p class="callout-label">Expected behavior</p>'
        f'<p class="mb-1"><code>{classes}</code></p>'
        f'<p class="mb-0 forge-support">{behavior}</p></div>'
    )


def render() -> str:
    rail_items = "".join(
        render_spatial_rail_item(
            f'<div class="forge-card p-3"><span class="card-label">Slide {i}</span>'
            f"<p class=\"mb-0 forge-support\">Coverflow item {i}</p></div>"
        )
        for i in range(1, 6)
    )
    return f"""\
<div class="forge-callout forge-callout-cyan mb-4" id="sec-intro">
  <p class="callout-label mb-1">Dual-wiki</p>
  <p class="mb-0">Maintainer specs live in <code>docs/design/spatial/effects/</code>;
  machine oracles in <code>docs/design/spatial/oracles/</code>.
  Verification: <code>tools/spatial-effects-verifier/</code> and LCDL
  <code>ks_spatial_effect_evaluate_v1</code>.</p>
</div>

<section id="sec-flip-card" class="ks-section">
  <h2 class="ks-section-title">Flip card</h2>
  <p class="forge-support mb-3">Checkbox trigger rotates inner faces on Y axis; flat under reduced motion.</p>
  <div class="row g-3"><div class="col-md-6">
  {render_flip_card(
      '<span class="card-label">Front</span><p class="mb-0">Governed intent surface.</p>',
      '<span class="card-label text-cyan">Back</span><p class="mb-0">Evidence and next action.</p>',
      trigger_id="demo-flip-1",
  )}
  </div></div>
  {_behavior_callout(
      "ks-card--flip",
      "Click Flip: inner rotates ~180deg on Y. Reduced motion: back face hidden, no rotation.",
  )}
</section>

<section id="sec-tilt-css" class="ks-section">
  <h2 class="ks-section-title">CSS-only tilt</h2>
  <p class="forge-support mb-3">Nine invisible zones tilt via sibling selectors — no JavaScript.</p>
  {render_tilt_css_card('<span class="section-label">Zone tilt</span><p class="mb-0 forge-support">Tab zones or click radios.</p>')}
  {_behavior_callout("ks-tilt--css", "Selecting a zone applies rotateX/Y to inner card.")}
</section>

<section id="sec-holo-card" class="ks-section">
  <h2 class="ks-section-title">Holographic card</h2>
  {render_holo_card('<span class="card-label text-cyan">Premium</span><p class="mb-0">Pointer-driven iridescent glare.</p>')}
  {_behavior_callout("ks-card--holo", "Pointer moves update --ks-rx/--ks-ry and glare position.")}
</section>

<section id="sec-zigzag" class="ks-section">
  <h2 class="ks-section-title">Zigzag 3D divider</h2>
  {render_zigzag_divider()}
  {_behavior_callout("ks-divider--zigzag-3d", "Paper-cut section edge; pure CSS conic-gradient + mask.")}
</section>

<section id="sec-display-depth" class="ks-section">
  <h2 class="ks-section-title">Volumetric display</h2>
  {render_display_depth("Spatial headline")}
  {_behavior_callout("ks-display--depth", "Display text lifted with rotateX and translateZ depth.")}
</section>

<section id="sec-cube-btn" class="ks-section">
  <h2 class="ks-section-title">Cube glow CTA</h2>
  {render_cube_glow_button("Launch review")}
  {_behavior_callout("ks-btn--cube", "Pointer tilt on gradient CTA face.")}
</section>

<section id="sec-volumetric-switch" class="ks-section">
  <h2 class="ks-section-title">Volumetric switch</h2>
  {render_volumetric_switch(switch_id="demo-vsw")}
  {_behavior_callout("ks-switch--volumetric", "Thumb translates on X with translateZ; track fills cyan when on.")}
</section>

<section id="sec-tactile-range" class="ks-section">
  <h2 class="ks-section-title">Tactile range</h2>
  {render_tactile_range(range_id="demo-rng")}
  {_behavior_callout("ks-range--tactile", "Recessed track; glassy spherical thumb on native range input.")}
</section>

<section id="sec-flip-choice" class="ks-section">
  <h2 class="ks-section-title">Flip choice</h2>
  <div class="d-flex gap-3">
  {render_flip_choice("demo-fch", choice_id="fch-a")}
  {render_flip_choice("demo-fch", choice_id="fch-b", checked=True)}
  </div>
  {_behavior_callout("ks-choice--flip", "Selected radio flips piece rotateY 180deg.")}
</section>

<section id="sec-holo-badge" class="ks-section">
  <h2 class="ks-section-title">Holographic badge</h2>
  {render_holo_badge("Enterprise ready")}
  {_behavior_callout("ks-badge--holo", "Compact holo surface with pointer CSS vars.")}
</section>

<section id="sec-media-parallax" class="ks-section">
  <h2 class="ks-section-title">Inner-frame parallax</h2>
  {render_media_frame_parallax('<div class="glass p-4 text-center"><span class="section-label">Media</span></div>')}
  {_behavior_callout("ks-media--frame-parallax", "Inner layer scales and translateZ on hover.")}
</section>

<section id="sec-cube-gallery" class="ks-section">
  <h2 class="ks-section-title">Cube gallery</h2>
  {render_cube_gallery(["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"])}
  {_behavior_callout("ks-cube-gallery", "Pointer X rotates scene on Y; six labeled faces.")}
</section>

<section id="sec-draggable-cube" class="ks-section">
  <h2 class="ks-section-title">Draggable cube</h2>
  {render_draggable_cube()}
  {_behavior_callout("ks-cube--draggable", "Drag rotates cube; face opacity simulates lighting.")}
</section>

<section id="sec-tunnel" class="ks-section">
  <h2 class="ks-section-title">Tunnel ambient</h2>
  {render_tunnel_ambient(caption="Hero backdrop — infinite grid drift (paused when reduced motion).")}
  {_behavior_callout("ks-ambient--tunnel", "Perspective grid animates translateY; static when reduced motion.")}
</section>

<section id="sec-perspective-stage" class="ks-section">
  <h2 class="ks-section-title">Perspective stage</h2>
  {render_perspective_stage('<div class="glass p-4"><p class="mb-0">Layered section content with depth.</p></div>')}
  {_behavior_callout("ks-section--perspective-stage", "Child layer translateZ for staged sections.")}
</section>

<section id="sec-iso-tile" class="ks-section">
  <h2 class="ks-section-title">Isometric tile</h2>
  <div style="padding: 2rem 0;">
  {render_iso_tile('<span class="section-label">ISO</span><p class="mb-0 forge-support">Bento lift</p>')}
  </div>
  {_behavior_callout("ks-tile--iso", "rotateX(60deg) rotateZ(-45deg) elevated tile.")}
</section>

<section id="sec-floating-header" class="ks-section">
  <h2 class="ks-section-title">Floating header</h2>
  {render_floating_header("Floating title")}
  {_behavior_callout("ks-display--depth--float", "Scroll-linked volumetric headline variant.")}
</section>

<section id="sec-depth-dial" class="ks-section">
  <h2 class="ks-section-title">Depth dial</h2>
  {render_depth_dial("72%", angle_deg=200)}
  {_behavior_callout("ks-dial--depth", "Conic gradient dial with @property --ks-dial-angle.")}
</section>

<section id="sec-neumorphic-switch" class="ks-section">
  <h2 class="ks-section-title">Neumorphic switch</h2>
  {render_volumetric_switch(switch_id="demo-nsw", tactile=True)}
  {_behavior_callout("ks-switch--tactile", "Recessed neumorphic track variant of volumetric switch.")}
</section>

<section id="sec-spatial-rail" class="ks-section">
  <h2 class="ks-section-title">Spatial rail</h2>
  <p class="forge-support mb-3">Coverflow rail — scroll to shift per-item rotateY and translateZ.</p>
  {render_spatial_rail(rail_items)}
  {_behavior_callout("fs-rail--spatial", "Scroll updates --ks-rail-ry and --ks-rail-z per item.")}
</section>
"""
