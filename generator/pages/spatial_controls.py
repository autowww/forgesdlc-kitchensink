"""Spatial controls — switches, range, choice, dial, cube CTA, holo badge."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "components"))

from spatial import (  # noqa: E402
    render_cube_glow_button,
    render_depth_dial,
    render_flip_choice,
    render_holo_badge,
    render_tactile_range,
    render_volumetric_switch,
)

from spatial_showcase_common import SPATIAL_CSS, SPATIAL_JS_POINTER, behavior_callout  # noqa: E402
from spatial_wave2_showcase import controls_sections  # noqa: E402

PAGE = {
    "slug": "spatial-controls",
    "title": "Spatial Controls",
    "intro": "Tactile 3D form controls — switches, sliders, dials, and choice chips.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 7.2,
    "toc": [
        ("sec-intro", "Overview"),
        ("sec-cube-btn", "Cube glow button"),
        ("sec-volumetric-switch", "Volumetric switch"),
        ("sec-tactile-range", "Tactile range"),
        ("sec-flip-choice", "Flip choice"),
        ("sec-holo-badge", "Holographic badge"),
        ("sec-depth-dial", "Depth dial"),
        ("sec-neumorphic-switch", "Neumorphic switch"),
        ("sec-flip-clock", "Flip clock"),
        ("sec-pro-mode-guard", "Pro-mode guard"),
        ("sec-rocker-switch", "Rocker switch"),
        ("sec-css-bookmark", "CSS bookmark"),
        ("sec-rgb-keyboard", "RGB keyboard"),
        ("sec-cube-login", "Cube login"),
        ("sec-lights-rig", "Lights rig"),
    ],
}


def extra_css() -> str:
    return SPATIAL_CSS


def extra_js_paths() -> list[str]:
    return list(SPATIAL_JS_POINTER)


def render() -> str:
    bc = behavior_callout
    base = f"""\
<div class="forge-callout forge-callout-cyan mb-4" id="sec-intro">
  <p class="callout-label mb-1">Category</p>
  <p class="mb-0">Control primitives from the <a href="spatial-effects.html">Spatial hub</a>.</p>
</div>

<section id="sec-cube-btn" class="ks-section">
  <h2 class="ks-section-title">Cube glow CTA</h2>
  {render_cube_glow_button("Launch review")}
  {bc("ks-btn--cube", "Pointer tilt on gradient CTA face.")}
</section>

<section id="sec-volumetric-switch" class="ks-section">
  <h2 class="ks-section-title">Volumetric switch</h2>
  {render_volumetric_switch(switch_id="demo-vsw")}
  {bc("ks-switch--volumetric", "Thumb translates on X with translateZ; track fills cyan when on.")}
</section>

<section id="sec-tactile-range" class="ks-section">
  <h2 class="ks-section-title">Tactile range</h2>
  {render_tactile_range(range_id="demo-rng")}
  {bc("ks-range--tactile", "Recessed track; glassy spherical thumb.")}
</section>

<section id="sec-flip-choice" class="ks-section">
  <h2 class="ks-section-title">Flip choice</h2>
  <div class="d-flex gap-3">
  {render_flip_choice("demo-fch", choice_id="fch-a")}
  {render_flip_choice("demo-fch", choice_id="fch-b", checked=True)}
  </div>
  {bc("ks-choice--flip", "Selected radio flips piece rotateY 180deg.")}
</section>

<section id="sec-holo-badge" class="ks-section">
  <h2 class="ks-section-title">Holographic badge</h2>
  {render_holo_badge("Enterprise ready")}
  {bc("ks-badge--holo", "Compact holo surface with pointer CSS vars.")}
</section>

<section id="sec-depth-dial" class="ks-section">
  <h2 class="ks-section-title">Depth dial</h2>
  {render_depth_dial("72%", angle_deg=200)}
  {bc("ks-dial--depth", "Conic gradient dial with @property --ks-dial-angle.")}
</section>

<section id="sec-neumorphic-switch" class="ks-section">
  <h2 class="ks-section-title">Neumorphic switch</h2>
  {render_volumetric_switch(switch_id="demo-nsw", tactile=True)}
  {bc("ks-switch--tactile", "Recessed neumorphic track variant.")}
</section>
"""
    return base + controls_sections()
