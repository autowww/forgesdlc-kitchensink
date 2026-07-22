"""Wave 2 spatial showcase section builders."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "components"))

from spatial_wave2 import (  # noqa: E402
    render_book_page_flip,
    render_bubbly_grid,
    render_card_deck_stack,
    render_card_fan,
    render_conf_data_block,
    render_cube_gallery_photo,
    render_cube_login_form,
    render_css_bookmark,
    render_curtain_reveal,
    render_display_depth_spiral,
    render_error_cube_404,
    render_flip_card_stack,
    render_flip_clock_counter,
    render_fold_accordion,
    render_fractured_pyramid,
    render_hex_tunnel,
    render_holo_card_illumination,
    render_hud_space_panel,
    render_iso_cube_grid,
    render_iso_keypad,
    render_lights_rig,
    render_linear_circular_motion,
    render_math_globe,
    render_morph_polyhedron,
    render_orbital_photo_gallery,
    render_pro_mode_guard_toggle,
    render_rgb_keyboard,
    render_ring_carousel,
    render_scroll_flip_strip,
    render_scroll_layer_parallax,
    render_simplest_dots,
    render_sphere_cube_intersection,
    render_sphere_family,
    render_spatial_rail_orbit,
    render_stellar_slide_nav,
    render_tilt_js_card,
    render_tower_cubes_loader,
    render_tumbling_cubes,
    render_tunnel_warp,
    render_vertical_rocker_switch,
    render_vertical_team_carousel,
    render_vinyl_sleeve,
)
from spatial_showcase_common import behavior_callout  # noqa: E402

try:
    from nav_layout import render_fisheye_depth_nav
except ImportError:
    from components.nav_layout import render_fisheye_depth_nav  # type: ignore


def _bc(classes: str, behavior: str) -> str:
    return behavior_callout(classes, behavior)


def surfaces_upgrade_sections() -> str:
    bc = _bc
    stack = render_flip_card_stack(
        [
            ("Task A", "Done"),
            ("Task B", "Review"),
            ("Task C", "Ship"),
        ]
    )
    return f"""
<section id="sec-flip-stack" class="ks-section">
  <h2 class="ks-section-title">Flip stack</h2>
  {stack}
  {bc("ks-card--flip-stack", "Staggered flip list (Grow Up pattern).")}
</section>

<section id="sec-holo-illumination" class="ks-section">
  <h2 class="ks-section-title">Holo illumination</h2>
  {render_holo_card_illumination('<span class="card-label">Lit</span><p class="mb-0">Pseudo-light layers.</p>')}
  {bc("ks-card--holo--illumination", "Layered illumination on holo card.")}
</section>

<section id="sec-iso-keypad" class="ks-section">
  <h2 class="ks-section-title">Isometric keypad</h2>
  {render_iso_keypad()}
  {bc("ks-tile--iso-keypad", "Elevated keycap grid.")}
</section>

<section id="sec-iso-grid" class="ks-section">
  <h2 class="ks-section-title">Isometric cube grid</h2>
  {render_iso_cube_grid()}
  {bc("ks-iso-cube-grid", "Compressed Z-axis cube field.")}
</section>

<section id="sec-tilt-js" class="ks-section">
  <h2 class="ks-section-title">JS pointer tilt</h2>
  {render_tilt_js_card('<span class="section-label">Pointer tilt</span><p class="mb-0 forge-support">ks-pointer-depth.js</p>')}
  {bc("ks-tilt--js", "Mouse-driven rotateX/Y via pointer engine.")}
</section>

<section id="sec-book-flip" class="ks-section">
  <h2 class="ks-section-title">Book page flip</h2>
  {render_book_page_flip("Handbook", "<p class='mb-0'>Chapter preview content.</p>")}
  {bc("ks-book--flip", "rotateY page spread on hover.")}
</section>

<section id="sec-fold-accordion" class="ks-section">
  <h2 class="ks-section-title">Fold accordion</h2>
  {render_fold_accordion([
      ("faq-1", "Governance", "<p class='mb-0'>Hash + oracle per primitive.</p>"),
      ("faq-2", "Motion", "<p class='mb-0'>Reduced-motion fallbacks required.</p>"),
  ])}
  {bc("ks-accordion--fold", "3D fold panels on expand.")}
</section>

<section id="sec-card-fan" class="ks-section">
  <h2 class="ks-section-title">Card fan</h2>
  {render_card_fan(["Alpha", "Beta", "Gamma", "Delta"])}
  {bc("ks-card--fan", "Rotated fan of choice cards.")}
</section>

<section id="sec-card-deck" class="ks-section">
  <h2 class="ks-section-title">Card deck</h2>
  {render_card_deck_stack(count=5)}
  {bc("ks-deck--stack", "Stacked deck with hover peel.")}
</section>

<section id="sec-vinyl-sleeve" class="ks-section">
  <h2 class="ks-section-title">Vinyl sleeve</h2>
  {render_vinyl_sleeve("Forge Handbook")}
  {bc("ks-vinyl", "Sleeve slide reveals cover.")}
</section>

<section id="sec-fisheye-nav" class="ks-section">
  <h2 class="ks-section-title">Fisheye depth nav</h2>
  {render_fisheye_depth_nav()}
  {bc("ks-nav--fisheye", "Parallax depth nav strip.")}
</section>
"""


def controls_sections() -> str:
    bc = _bc
    return f"""
<section id="sec-flip-clock" class="ks-section">
  <h2 class="ks-section-title">Flip clock counter</h2>
  {render_flip_clock_counter("09:41")}
  {bc("ks-flip-clock", "Mechanical digit flip segments.")}
</section>

<section id="sec-pro-mode-guard" class="ks-section">
  <h2 class="ks-section-title">Pro-mode guard toggle</h2>
  <div class="d-flex gap-4 flex-wrap align-items-center">
  {render_pro_mode_guard_toggle("demo-pmg")}
  {render_pro_mode_guard_toggle("demo-pmg-soft", soft=True)}
  </div>
  {bc("ks-switch--pro-guard", "Arm guard checkbox before main toggle engages.")}
</section>

<section id="sec-rocker-switch" class="ks-section">
  <h2 class="ks-section-title">Vertical rocker switch</h2>
  {render_vertical_rocker_switch("demo-vrk")}
  {bc("ks-switch--rocker", "Vertical rocker with 3D depth.")}
</section>

<section id="sec-css-bookmark" class="ks-section">
  <h2 class="ks-section-title">CSS bookmark</h2>
  {render_css_bookmark("demo-bkm")}
  {bc("ks-bookmark", "Bookmark animates via @property mask.")}
</section>

<section id="sec-rgb-keyboard" class="ks-section">
  <h2 class="ks-section-title">RGB keyboard</h2>
  {render_rgb_keyboard()}
  {bc("ks-keyboard", "Isometric key grid with glow.")}
</section>

<section id="sec-cube-login" class="ks-section">
  <h2 class="ks-section-title">Cube login form</h2>
  {render_cube_login_form()}
  {bc("ks-form--cube", "Skew isometric form shell with focus wipe.")}
</section>

<section id="sec-lights-rig" class="ks-section">
  <h2 class="ks-section-title">Shapes &amp; lights rig</h2>
  {render_lights_rig()}
  {bc("ks-lights-rig", "Shared lighting tokens demo.")}
</section>
"""


def rails_sections() -> str:
    bc = _bc
    stellar_items = "".join(
        f'<div class="ks-nav--stellar__slide forge-card p-3"><span class="card-label">Slide {i}</span></div>'
        for i in range(1, 4)
    )
    vtc_items = "".join(
        f'<div class="ks-carousel--vertical__member forge-card p-3"><span class="card-label">Member {i}</span></div>'
        for i in range(1, 5)
    )
    orbit_items = "".join(
        f'<div class="fs-rail__item flex-shrink-0" style="width:10rem">'
        f'<div class="forge-card p-2"><span class="section-label">O{i}</span></div></div>'
        for i in range(1, 7)
    )
    return f"""
<section id="sec-cube-gallery-photo" class="ks-section">
  <h2 class="ks-section-title">Photo cube gallery</h2>
  {render_cube_gallery_photo(["One", "Two", "Three", "Four", "Five", "Six"])}
  {bc("ks-cube-gallery--photo", "Pointer-driven photo cube (Cbg mode).")}
</section>

<section id="sec-spatial-rail-orbit" class="ks-section">
  <h2 class="ks-section-title">Orbit rail</h2>
  {render_spatial_rail_orbit(orbit_items)}
  {bc("fs-rail--orbit", "Parametric orbit placement (Srl mode).")}
</section>

<section id="sec-ring-carousel" class="ks-section">
  <h2 class="ks-section-title">Ring carousel</h2>
  {render_ring_carousel(["A", "B", "C", "D", "E", "F", "G", "H"])}
  {bc("ks-carousel--ring", "CSS-only 3D ring carousel.")}
</section>

<section id="sec-orbital-gallery" class="ks-section">
  <h2 class="ks-section-title">Orbital photo gallery</h2>
  {render_orbital_photo_gallery(["I", "II", "III", "IV", "V", "VI"])}
  {bc("ks-gallery--orbital", "Images on spherical orbit.")}
</section>

<section id="sec-stellar-nav" class="ks-section">
  <h2 class="ks-section-title">Stellar slide navigator</h2>
  {render_stellar_slide_nav(stellar_items)}
  {bc("ks-nav--stellar", "Parallax slide navigator.")}
</section>

<section id="sec-vertical-carousel" class="ks-section">
  <h2 class="ks-section-title">Vertical team carousel</h2>
  {render_vertical_team_carousel(vtc_items)}
  {bc("ks-carousel--vertical", "Vertical 3D team carousel.")}
</section>

<section id="sec-scroll-flip" class="ks-section">
  <h2 class="ks-section-title">Scroll flip strip</h2>
  {render_scroll_flip_strip(["Page 1", "Page 2", "Page 3", "Page 4"])}
  {bc("ks-strip--scroll-flip", "Flip strip for scroll storytelling.")}
</section>
"""


def ambient_sections() -> str:
    bc = _bc
    layers = (
        '<div class="ks-scroll--parallax__layer" data-depth="1">'
        '<div class="glass p-3">Back</div></div>'
        '<div class="ks-scroll--parallax__layer" data-depth="2">'
        '<div class="glass p-3">Mid</div></div>'
        '<div class="ks-scroll--parallax__layer" data-depth="3">'
        '<div class="glass p-3">Front</div></div>'
    )
    return f"""
<section id="sec-display-spiral" class="ks-section">
  <h2 class="ks-section-title">Text spiral</h2>
  {render_display_depth_spiral("FORGE")}
  {bc("ks-display--depth--spiral", "Spiral typography depth (Dpt variant).")}
</section>

<section id="sec-tunnel-warp" class="ks-section">
  <h2 class="ks-section-title">Warp tunnel</h2>
  {render_tunnel_warp("Warp-speed beam layer (Tun variant).")}
  {bc("ks-ambient--tunnel--warp", "Beam velocity overlay on tunnel grid.")}
</section>

<section id="sec-error-cube" class="ks-section">
  <h2 class="ks-section-title">Rolling cube 404</h2>
  {render_error_cube_404()}
  {bc("ks-error--cube", "404 scene with rolling cube.")}
</section>

<section id="sec-morph-poly" class="ks-section">
  <h2 class="ks-section-title">Morph polyhedron</h2>
  {render_morph_polyhedron()}
  {bc("ks-loader--morph", "Morphing polyhedron loader.")}
</section>

<section id="sec-tumbling-cubes" class="ks-section">
  <h2 class="ks-section-title">Tumbling cubes</h2>
  {render_tumbling_cubes()}
  {bc("ks-ambient--tumble", "Interconnected tumbling cubes.")}
</section>

<section id="sec-hex-tunnel" class="ks-section">
  <h2 class="ks-section-title">Hex tunnel</h2>
  {render_hex_tunnel()}
  {bc("ks-ambient--hex", "Flying-through-hexagons ambient.")}
</section>

<section id="sec-math-globe" class="ks-section">
  <h2 class="ks-section-title">Math globe</h2>
  {render_math_globe()}
  {bc("ks-ambient--globe", "Ring-based math globe.")}
</section>

<section id="sec-sphere-family" class="ks-section">
  <h2 class="ks-section-title">Sphere family</h2>
  <div class="d-flex gap-4 flex-wrap justify-content-center">
  {render_sphere_family(variant="shadow")}
  {render_sphere_family(variant="wobble")}
  </div>
  {bc("ks-sphere-family", "Consolidated sphere demos.")}
</section>

<section id="sec-scroll-parallax" class="ks-section">
  <h2 class="ks-section-title">Scroll layer parallax</h2>
  {render_scroll_layer_parallax(layers)}
  {bc("ks-scroll--parallax", "Multi-layer Z parallax section.")}
</section>

<section id="sec-curtain-reveal" class="ks-section">
  <h2 class="ks-section-title">Curtain reveal</h2>
  {render_curtain_reveal('<div class="glass p-4"><p class="mb-0">Revealed content.</p></div>')}
  {bc("ks-curtain--reveal", "Door/curtain section transition.")}
</section>

<section id="sec-tower-cubes" class="ks-section">
  <h2 class="ks-section-title">Tower cubes loader</h2>
  {render_tower_cubes_loader()}
  {bc("ks-loader--tower", "Climbing cube tower loader.")}
</section>

<section id="sec-linear-motion" class="ks-section">
  <h2 class="ks-section-title">Linear circular motion</h2>
  {render_linear_circular_motion()}
  {bc("ks-motion--linear", "Mechanical circular CSS motion.")}
</section>

<section id="sec-dots" class="ks-section">
  <h2 class="ks-section-title">Simplest dots</h2>
  {render_simplest_dots()}
  {bc("ks-dots", "Parameterized dot field.")}
</section>

<section id="sec-intersection" class="ks-section">
  <h2 class="ks-section-title">Sphere cube intersection</h2>
  {render_sphere_cube_intersection()}
  {bc("ks-scene--intersection", "Sphere + cube intersection scene.")}
</section>

<section id="sec-bubbly" class="ks-section">
  <h2 class="ks-section-title">Bubbly grid</h2>
  {render_bubbly_grid()}
  {bc("ks-bubbly", "Isometric bubbly particle grid.")}
</section>

<section id="sec-hud-space" class="ks-section">
  <h2 class="ks-section-title">HUD in space</h2>
  {render_hud_space_panel()}
  {bc("ks-hud--space", "Sci-fi HUD panel depth.")}
</section>

<section id="sec-fractured-pyramid" class="ks-section">
  <h2 class="ks-section-title">Fractured pyramid</h2>
  {render_fractured_pyramid()}
  {bc("ks-pyramid--fractured", "Gradient fractured pyramid.")}
</section>

<section id="sec-conf-block" class="ks-section">
  <h2 class="ks-section-title">Conf data block</h2>
  {render_conf_data_block()}
  {bc("ks-block--conf", "Animated data-block ambient.")}
</section>
"""
