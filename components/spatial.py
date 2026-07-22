"""Spatial / 3D KS component emitters — hash-governed HTML fragments."""
from __future__ import annotations

try:
    from .components import e
    from .ks_hash_attrs import ks_hash_attrs
except ImportError:
    from components import e
    from ks_hash_attrs import ks_hash_attrs

# Allocated hashes (visual-registry.yaml)
HASH_FLIP = "Flp"
HASH_TILT_CSS = "Tlz"
HASH_HOLO = "Hol"
HASH_ZIGZAG = "Zzg"
HASH_DISPLAY = "Dpt"
HASH_CUBE_BTN = "Cgb"
HASH_VSW = "Vsw"
HASH_RANGE = "Rng"
HASH_FLIP_CHOICE = "Fch"
HASH_HOLO_BADGE = "Hbd"
HASH_MEDIA_PX = "Mpx"
HASH_CUBE_GAL = "Cbg"
HASH_CUBE_DRAG = "Dcb"
HASH_TUNNEL = "Tun"
HASH_PERSP_STAGE = "Pst"
HASH_ISO = "Iso"
HASH_FLOAT_HDR = "Flh"
HASH_DIAL = "Dil"
HASH_NSW = "Nsw"
HASH_SPATIAL_RAIL = "Srl"


def _attrs(hash_id: str, name: str) -> str:
    return ks_hash_attrs(hash_id, "component", name)


def render_flip_card(
    front_html: str,
    back_html: str,
    *,
    trigger_id: str = "ks-flip-trigger",
    extra_class: str = "",
) -> str:
    """Flip / reveal card with checkbox trigger."""
    cls = f"ks-card--flip forge-card {extra_class}".strip()
    return (
        f'<div class="{e(cls)}" {_attrs(HASH_FLIP, "flip-card")}>'
        f'<input type="checkbox" class="ks-card--flip__trigger visually-hidden" '
        f'id="{e(trigger_id)}" aria-label="Flip card" />'
        f'<div class="ks-card--flip__inner">'
        f'<div class="ks-card--flip__face ks-card--flip__face--front p-3">{front_html}</div>'
        f'<div class="ks-card--flip__face ks-card--flip__face--back p-3 glass">{back_html}</div>'
        f"</div>"
        f'<label class="ks-card--flip__trigger-label btn btn-sm btn-outline-secondary mt-2" '
        f'for="{e(trigger_id)}">Flip</label>'
        f"</div>"
    )


def render_tilt_css_card(inner_html: str, *, extra_class: str = "") -> str:
    """CSS-only 9-zone tilt (no JS)."""
    zones = []
    for i in range(9):
        checked = " checked" if i == 4 else ""
        zones.append(
            f'<label><input type="radio" name="tilt-zone-{id(inner_html)}"{checked} /></label>'
        )
    zones_html = "".join(zones)
    cls = f"ks-tilt--css ks-spatial-cq {extra_class}".strip()
    return (
        f'<div class="{e(cls)}" {_attrs(HASH_TILT_CSS, "tilt-css")}>'
        f'<div class="ks-tilt--css__zones">{zones_html}</div>'
        f'<div class="ks-tilt--css__inner forge-card p-3">{inner_html}</div>'
        f"</div>"
    )


def render_holo_card(body_html: str, *, extra_class: str = "") -> str:
    """Holographic card — pair with ks-pointer-depth.js via data-ks-holo."""
    cls = f"ks-card--holo ks-pointer-depth {extra_class}".strip()
    return (
        f'<div class="{e(cls)}" data-ks-holo data-ks-pointer-max="14" '
        f'{_attrs(HASH_HOLO, "holo-card")}>'
        f'<div class="ks-card--holo__inner forge-card p-3">'
        f'<div class="ks-card--holo__glare" aria-hidden="true"></div>'
        f"{body_html}</div></div>"
    )


def render_zigzag_divider(*, extra_class: str = "") -> str:
    cls = f"ks-divider--zigzag-3d {extra_class}".strip()
    return (
        f'<div class="{e(cls)}" role="separator" aria-hidden="true" '
        f'{_attrs(HASH_ZIGZAG, "zigzag-divider")}></div>'
    )


def render_display_depth(text: str, *, tag: str = "h2", extra_class: str = "") -> str:
    cls = f"ks-display--depth {extra_class}".strip()
    return (
        f'<div class="{e(cls)}" {_attrs(HASH_DISPLAY, "display-depth")}>'
        f'<{tag} class="ks-display--depth__text">{e(text)}</{tag}>'
        f"</div>"
    )


def render_cube_glow_button(label: str, *, href: str = "#", extra_class: str = "") -> str:
    cls = f"ks-btn--cube ks-pointer-depth {extra_class}".strip()
    return (
        f'<a class="{e(cls)}" href="{e(href)}" data-ks-pointer-depth '
        f'{_attrs(HASH_CUBE_BTN, "cube-glow-button")}>'
        f'<span class="ks-btn--cube__scene">'
        f'<span class="ks-btn--cube__face">{e(label)}</span>'
        f"</span></a>"
    )


def render_volumetric_switch(
    *,
    switch_id: str = "ks-vsw",
    checked: bool = False,
    tactile: bool = False,
) -> str:
    hash_id = HASH_NSW if tactile else HASH_VSW
    name = "neumorphic-switch" if tactile else "volumetric-switch"
    mod = "ks-switch--tactile" if tactile else ""
    ch = " checked" if checked else ""
    return (
        f'<label class="ks-switch--volumetric {mod}" {_attrs(hash_id, name)}>'
        f'<input type="checkbox" id="{e(switch_id)}"{ch} />'
        f'<span class="ks-switch--volumetric__track" aria-hidden="true"></span>'
        f'<span class="ks-switch--volumetric__thumb" aria-hidden="true"></span>'
        f"</label>"
    )


def render_tactile_range(
    *,
    range_id: str = "ks-rng",
    min_val: int = 0,
    max_val: int = 100,
    value: int = 50,
) -> str:
    return (
        f'<input type="range" class="ks-range--tactile" id="{e(range_id)}" '
        f'min="{min_val}" max="{max_val}" value="{value}" '
        f'{_attrs(HASH_RANGE, "tactile-range")} />'
    )


def render_flip_choice(
    name: str,
    *,
    choice_id: str = "ks-fch",
    checked: bool = False,
) -> str:
    ch = " checked" if checked else ""
    return (
        f'<label class="ks-choice--flip" {_attrs(HASH_FLIP_CHOICE, "flip-choice")}>'
        f'<input type="radio" name="{e(name)}" id="{e(choice_id)}"{ch} />'
        f'<span class="ks-choice--flip__piece" aria-hidden="true"></span>'
        f"</label>"
    )


def render_holo_badge(label: str, *, extra_class: str = "") -> str:
    cls = f"ks-badge--holo ks-pointer-depth {extra_class}".strip()
    return (
        f'<span class="{e(cls)}" data-ks-holo data-ks-pointer-max="8" '
        f'{_attrs(HASH_HOLO_BADGE, "holo-badge")}>{e(label)}</span>'
    )


def render_media_frame_parallax(
    inner_html: str,
    *,
    extra_class: str = "",
) -> str:
    cls = f"ks-media--frame-parallax forge-card {extra_class}".strip()
    return (
        f'<div class="{e(cls)}" {_attrs(HASH_MEDIA_PX, "media-frame-parallax")}>'
        f'<div class="ks-media--frame-parallax__inner p-2">{inner_html}</div>'
        f"</div>"
    )


def render_cube_gallery(faces: list[str]) -> str:
    labels = (faces + ["", "", "", "", "", ""])[:6]
    face_html = ""
    for i, lab in enumerate(labels):
        side = ["front", "back", "right", "left", "top", "bottom"][i]
        face_html += (
            f'<div class="ks-cube-gallery__face ks-cube-gallery__face--{side}">'
            f'<span class="section-label">{e(lab or side)}</span></div>'
        )
    return (
        f'<div class="ks-cube-gallery" {_attrs(HASH_CUBE_GAL, "cube-gallery")}>'
        f'<div class="ks-cube-gallery__scene">{face_html}</div></div>'
    )


def render_draggable_cube(face_labels: list[str] | None = None) -> str:
    labels = face_labels or ["1", "2", "3", "4", "5", "6"]
    faces = "".join(
        f'<div class="ks-cube--draggable__face"><span>{e(lab)}</span></div>'
        for lab in labels[:6]
    )
    return (
        f'<div class="ks-cube--draggable" {_attrs(HASH_CUBE_DRAG, "draggable-cube")}>'
        f'<div class="ks-cube--draggable__scene">{faces}</div></div>'
    )


def render_tunnel_ambient(*, caption: str = "") -> str:
    cap = f'<p class="forge-support position-relative z-1 p-3 mb-0">{e(caption)}</p>' if caption else ""
    return (
        f'<div class="ks-ambient--tunnel rounded" {_attrs(HASH_TUNNEL, "tunnel-ambient")}>'
        f'<div class="ks-ambient--tunnel__grid" aria-hidden="true"></div>{cap}</div>'
    )


def render_perspective_stage(content_html: str) -> str:
    return (
        f'<section class="ks-section--perspective-stage" '
        f'{_attrs(HASH_PERSP_STAGE, "perspective-stage")}>'
        f'<div class="ks-section--perspective-stage__layer">{content_html}</div>'
        f"</section>"
    )


def render_iso_tile(inner_html: str) -> str:
    return (
        f'<div class="ks-tile--iso forge-card p-3" {_attrs(HASH_ISO, "isometric-tile")}>'
        f"{inner_html}</div>"
    )


def render_floating_header(text: str) -> str:
    return (
        f'<div class="ks-display--depth ks-display--depth--float" '
        f'{_attrs(HASH_FLOAT_HDR, "floating-header")}>'
        f'<h2 class="ks-display--depth__text">{e(text)}</h2></div>'
    )


def render_depth_dial(value: str, *, angle_deg: int = 120) -> str:
    return (
        f'<div class="ks-dial--depth" style="--ks-dial-angle:{angle_deg}deg" '
        f'{_attrs(HASH_DIAL, "depth-dial")}>'
        f'<span class="ks-dial--depth__value">{e(value)}</span></div>'
    )


def render_spatial_rail(items_html: str) -> str:
    return (
        f'<div class="fs-rail fs-rail--cards fs-rail--spatial overflow-auto" '
        f'{_attrs(HASH_SPATIAL_RAIL, "spatial-rail")}>'
        f'<div class="fs-rail__track d-flex gap-3 py-3">{items_html}</div></div>'
    )


def render_spatial_rail_item(card_html: str) -> str:
    return f'<div class="fs-rail__item flex-shrink-0" style="width:14rem">{card_html}</div>'


# Wave 2 v2 modes — implementations in spatial_wave2; re-exported here for discoverability.
try:
    from .spatial_wave2 import (
        render_cube_gallery_photo,
        render_display_depth_spiral,
        render_flip_card_stack,
        render_holo_card_illumination,
        render_iso_cube_grid,
        render_iso_keypad,
        render_spatial_rail_orbit,
        render_tunnel_warp,
    )
except ImportError:
    from spatial_wave2 import (  # type: ignore[no-redef]
        render_cube_gallery_photo,
        render_display_depth_spiral,
        render_flip_card_stack,
        render_holo_card_illumination,
        render_iso_cube_grid,
        render_iso_keypad,
        render_spatial_rail_orbit,
        render_tunnel_warp,
    )
