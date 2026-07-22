"""KS spatial Wave 2 component emitters — hash-governed HTML fragments."""
from __future__ import annotations

try:
    from .components import e
    from .ks_hash_attrs import ks_hash_attrs
except ImportError:
    from components import e
    from ks_hash_attrs import ks_hash_attrs

# Wave 2 component hashes
HASH_TILT_JS = "Tlj"
HASH_PRO_MODE_GUARD = "Pmg"
HASH_VERTICAL_ROCKER = "Vrk"
HASH_CSS_BOOKMARK = "Bkm"
HASH_FLIP_CLOCK = "Fck"
HASH_RGB_KEYBOARD = "Kbd"
HASH_CUBE_LOGIN = "Clf"
HASH_LIGHTS_RIG = "Lgt"
HASH_RING_CAROUSEL = "Crg"
HASH_ORBITAL_GALLERY = "Opg"
HASH_STELLAR_NAV = "Stn"
HASH_VERTICAL_CAROUSEL = "Vtc"
HASH_BOOK_PAGE_FLIP = "Bkf"
HASH_FOLD_ACCORDION = "Fld"
HASH_CARD_FAN = "Fan"
HASH_CARD_DECK = "Dck"
HASH_VINYL_SLEEVE = "Vnl"
HASH_SCROLL_FLIP = "Stf"
HASH_ERROR_CUBE = "Erc"
HASH_MORPH_POLYHEDRON = "Mph"
HASH_TUMBLING_CUBES = "Tmb"
HASH_HEX_TUNNEL = "Hex"
HASH_MATH_GLOBE = "Glb"
HASH_SPHERE_FAMILY = "Orb"
HASH_SCROLL_PARALLAX = "Slp"
HASH_CURTAIN_REVEAL = "Cur"
HASH_TOWER_CUBES = "Twr"
HASH_LINEAR_MOTION = "Mch"
HASH_SIMPLEST_DOTS = "Dot"
HASH_SPHERE_CUBE = "Xsc"
HASH_BUBBLY_GRID = "Bbl"
HASH_HUD_SPACE = "Hud"
HASH_FRACTURED_PYRAMID = "Pry"
HASH_CONF_DATA_BLOCK = "Dbf"

# Upgraded primitives (shared hashes with spatial.py)
HASH_CUBE_GAL = "Cbg"
HASH_SPATIAL_RAIL = "Srl"
HASH_FLIP = "Flp"
HASH_DISPLAY = "Dpt"
HASH_TUNNEL = "Tun"
HASH_ISO = "Iso"
HASH_HOLO = "Hol"

_RGB_KEYBOARD_ROWS = ("QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM")
_CUBE_FACE_SIDES = ("front", "back", "right", "left", "top", "bottom")


def _attrs(hash_id: str, name: str) -> str:
    return ks_hash_attrs(hash_id, "component", name)


# --- Wave 2 controls (S33–S40) ---


def render_tilt_js_card(inner_html: str) -> str:
    """JS pointer tilt surface (ks-pointer-depth.js)."""
    return (
        f'<div class="ks-tilt--js ks-tilt-wrap ks-pointer-depth" '
        f'data-ks-pointer-max="18" {_attrs(HASH_TILT_JS, "tilt-js")}>'
        f'<div class="ks-tilt--js__inner forge-card p-3">{inner_html}</div>'
        f"</div>"
    )


def render_pro_mode_guard_toggle(switch_id: str, *, soft: bool = False) -> str:
    """Dual-checkbox pro-mode guard toggle."""
    mod = " ks-switch--pro-guard--soft" if soft else ""
    guard_id = f"{switch_id}-guard"
    return (
        f'<div class="ks-switch--pro-guard{mod}" '
        f'{_attrs(HASH_PRO_MODE_GUARD, "pro-mode-guard-toggle")}>'
        f'<input type="checkbox" class="ks-switch--pro-guard__guard visually-hidden" '
        f'id="{e(guard_id)}" aria-label="Unlock pro mode" />'
        f'<label class="ks-switch--pro-guard__guard-label" for="{e(guard_id)}">Unlock</label>'
        f'<label class="ks-switch--pro-guard__toggle">'
        f'<input type="checkbox" id="{e(switch_id)}" />'
        f'<span class="ks-switch--pro-guard__track" aria-hidden="true"></span>'
        f'<span class="ks-switch--pro-guard__thumb" aria-hidden="true"></span>'
        f"</label></div>"
    )


def render_vertical_rocker_switch(switch_id: str) -> str:
    """Vertical rocker switch."""
    return (
        f'<label class="ks-switch--vertical-rocker" '
        f'{_attrs(HASH_VERTICAL_ROCKER, "vertical-rocker-switch")}>'
        f'<input type="checkbox" id="{e(switch_id)}" />'
        f'<span class="ks-switch--vertical-rocker__housing" aria-hidden="true">'
        f'<span class="ks-switch--vertical-rocker__rocker"></span></span>'
        f"</label>"
    )


def render_css_bookmark(bookmark_id: str, *, label: str = "Save") -> str:
    """CSS bookmark — checkbox hack."""
    return (
        f'<div class="ks-bookmark--css" {_attrs(HASH_CSS_BOOKMARK, "css-bookmark")}>'
        f'<input type="checkbox" class="ks-bookmark--css__trigger visually-hidden" '
        f'id="{e(bookmark_id)}" />'
        f'<label class="ks-bookmark--css__tab" for="{e(bookmark_id)}">{e(label)}</label>'
        f"</div>"
    )


def render_flip_clock_counter(value: str = "12:34") -> str:
    """Flip-clock counter segments."""
    segments = ""
    for ch in value:
        segments += (
            f'<span class="ks-flip-clock__digit">'
            f'<span class="ks-flip-clock__card">'
            f'<span class="ks-flip-clock__top">{e(ch)}</span>'
            f'<span class="ks-flip-clock__bottom">{e(ch)}</span>'
            f"</span></span>"
        )
    return (
        f'<div class="ks-flip-clock" {_attrs(HASH_FLIP_CLOCK, "flip-clock-counter")}>'
        f"{segments}</div>"
    )


def render_rgb_keyboard() -> str:
    """RGB keyboard key grid."""
    rows = ""
    for row in _RGB_KEYBOARD_ROWS:
        keys = "".join(
            f'<kbd class="ks-rgb-keyboard__key">{e(k)}</kbd>' for k in row
        )
        rows += f'<div class="ks-rgb-keyboard__row">{keys}</div>'
    return (
        f'<div class="ks-rgb-keyboard" {_attrs(HASH_RGB_KEYBOARD, "rgb-keyboard")}>'
        f"{rows}</div>"
    )


def render_cube_login_form() -> str:
    """Skew isometric login form shell."""
    return (
        f'<form class="ks-form--cube-login" {_attrs(HASH_CUBE_LOGIN, "cube-login-form")}>'
        f'<div class="ks-form--cube-login__scene">'
        f'<div class="ks-form--cube-login__panel forge-card p-3">'
        f'<label class="form-label" for="ks-clf-user">User</label>'
        f'<input class="form-control mb-2" id="ks-clf-user" type="text" '
        f'autocomplete="username" />'
        f'<label class="form-label" for="ks-clf-pass">Password</label>'
        f'<input class="form-control mb-2" id="ks-clf-pass" type="password" '
        f'autocomplete="current-password" />'
        f'<button class="btn btn-primary" type="submit">Sign in</button>'
        f"</div></div></form>"
    )


def render_lights_rig() -> str:
    """Ring + ball lights demo rig."""
    return (
        f'<div class="ks-lights-rig" {_attrs(HASH_LIGHTS_RIG, "shapes-lights-rig")}>'
        f'<div class="ks-lights-rig__ring" aria-hidden="true"></div>'
        f'<div class="ks-lights-rig__ball" aria-hidden="true"></div>'
        f"</div>"
    )


# --- Wave 2 surfaces / rails (S41–S50) ---


def render_ring_carousel(items: list[str]) -> str:
    """CSS ring carousel."""
    slides = "".join(
        f'<div class="ks-ring-carousel__item"><span>{e(lab)}</span></div>'
        for lab in items
    )
    return (
        f'<div class="ks-ring-carousel" {_attrs(HASH_RING_CAROUSEL, "ring-carousel")}>'
        f'<div class="ks-ring-carousel__ring">{slides}</div></div>'
    )


def render_orbital_photo_gallery(labels: list[str]) -> str:
    """Orbital photo gallery."""
    orbs = "".join(
        f'<div class="ks-orbital-gallery__orb">'
        f'<span class="section-label">{e(lab)}</span></div>'
        for lab in labels
    )
    return (
        f'<div class="ks-orbital-gallery" '
        f'{_attrs(HASH_ORBITAL_GALLERY, "orbital-photo-gallery")}>'
        f'<div class="ks-orbital-gallery__scene">{orbs}</div></div>'
    )


def render_stellar_slide_nav(items_html: str) -> str:
    """Stellar slide navigator rail."""
    return (
        f'<nav class="ks-stellar-nav" '
        f'{_attrs(HASH_STELLAR_NAV, "stellar-slide-navigator")}>'
        f'<div class="ks-stellar-nav__track">{items_html}</div></nav>'
    )


def render_vertical_team_carousel(items_html: str) -> str:
    """Vertical team carousel stack."""
    return (
        f'<div class="ks-vertical-carousel" '
        f'{_attrs(HASH_VERTICAL_CAROUSEL, "vertical-team-carousel")}>'
        f'<div class="ks-vertical-carousel__stack">{items_html}</div></div>'
    )


def render_book_page_flip(title: str, page_html: str) -> str:
    """Book page flip surface."""
    return (
        f'<article class="ks-book-flip" {_attrs(HASH_BOOK_PAGE_FLIP, "book-page-flip")}>'
        f'<header class="ks-book-flip__spine"><h3>{e(title)}</h3></header>'
        f'<div class="ks-book-flip__page">{page_html}</div></article>'
    )


def render_fold_accordion(items: list[tuple[str, str, str]]) -> str:
    """Fold accordion panels — (id, title, body)."""
    panels = ""
    for item_id, title, body in items:
        panels += (
            f'<details class="ks-fold-accordion__panel" id="{e(item_id)}">'
            f"<summary>{e(title)}</summary>"
            f'<div class="ks-fold-accordion__body">{body}</div></details>'
        )
    return (
        f'<div class="ks-fold-accordion" {_attrs(HASH_FOLD_ACCORDION, "fold-accordion")}>'
        f"{panels}</div>"
    )


def render_card_fan(labels: list[str]) -> str:
    """Fanned card deck."""
    cards = "".join(
        f'<div class="ks-card-fan__card forge-card p-2"><span>{e(lab)}</span></div>'
        for lab in labels
    )
    return (
        f'<div class="ks-card-fan" {_attrs(HASH_CARD_FAN, "card-fan")}>'
        f'<div class="ks-card-fan__deck">{cards}</div></div>'
    )


def render_card_deck_stack(*, count: int = 4) -> str:
    """Stacked card deck."""
    cards = "".join(
        f'<div class="ks-card-deck__card forge-card" style="--ks-deck-i:{i}"></div>'
        for i in range(count)
    )
    return (
        f'<div class="ks-card-deck" {_attrs(HASH_CARD_DECK, "card-deck-stack")}>'
        f'<div class="ks-card-deck__stack">{cards}</div></div>'
    )


def render_vinyl_sleeve(title: str) -> str:
    """Vinyl sleeve media frame."""
    return (
        f'<figure class="ks-vinyl-sleeve" {_attrs(HASH_VINYL_SLEEVE, "vinyl-sleeve-media")}>'
        f'<div class="ks-vinyl-sleeve__disc" aria-hidden="true"></div>'
        f'<figcaption class="ks-vinyl-sleeve__label">{e(title)}</figcaption>'
        f"</figure>"
    )


def render_scroll_flip_strip(labels: list[str]) -> str:
    """Scroll-driven flip strip."""
    panels = "".join(
        f'<section class="ks-scroll-flip__panel"><span>{e(lab)}</span></section>'
        for lab in labels
    )
    return (
        f'<div class="ks-scroll-flip" {_attrs(HASH_SCROLL_FLIP, "scroll-flip-strip")}>'
        f"{panels}</div>"
    )


# --- Wave 2 ambient (S51–S67) ---


def render_error_cube_404() -> str:
    """Rolling cube 404 scene."""
    face_labels = ["4", "0", "4", "?", "!", "X"]
    faces = "".join(
        f'<div class="ks-error-cube__face"><span>{e(lab)}</span></div>'
        for lab in face_labels
    )
    return (
        f'<div class="ks-error-cube" role="img" aria-label="404" '
        f'{_attrs(HASH_ERROR_CUBE, "rolling-cube-404")}>'
        f'<div class="ks-error-cube__scene">{faces}</div></div>'
    )


def render_morph_polyhedron() -> str:
    """Morphing polyhedron loader."""
    return (
        f'<div class="ks-morph-polyhedron" aria-hidden="true" '
        f'{_attrs(HASH_MORPH_POLYHEDRON, "morph-polyhedron")}>'
        f'<div class="ks-morph-polyhedron__solid"></div></div>'
    )


def render_tumbling_cubes() -> str:
    """Tumbling cubes ambient."""
    cubes = "".join(
        f'<div class="ks-tumbling-cubes__cube" style="--ks-tmb-i:{i}"></div>'
        for i in range(3)
    )
    return (
        f'<div class="ks-tumbling-cubes" {_attrs(HASH_TUMBLING_CUBES, "tumbling-cubes")}>'
        f"{cubes}</div>"
    )


def render_hex_tunnel() -> str:
    """Hex tunnel ambient grid."""
    cells = "".join('<div class="ks-hex-tunnel__cell"></div>' for _ in range(12))
    return (
        f'<div class="ks-hex-tunnel" {_attrs(HASH_HEX_TUNNEL, "hex-tunnel")}>'
        f'<div class="ks-hex-tunnel__grid">{cells}</div></div>'
    )


def render_math_globe() -> str:
    """Math globe ambient."""
    return (
        f'<div class="ks-math-globe" {_attrs(HASH_MATH_GLOBE, "math-globe")}>'
        f'<div class="ks-math-globe__sphere" aria-hidden="true"></div>'
        f'<div class="ks-math-globe__grid" aria-hidden="true"></div></div>'
    )


def render_sphere_family(*, variant: str = "shadow") -> str:
    """Sphere family ambient — variant: shadow | wire | glow."""
    return (
        f'<div class="ks-sphere-family ks-sphere-family--{e(variant)}" '
        f'{_attrs(HASH_SPHERE_FAMILY, "sphere-family")}>'
        f'<div class="ks-sphere-family__orb" aria-hidden="true"></div></div>'
    )


def render_scroll_layer_parallax(layers_html: str) -> str:
    """Scroll layer parallax stack."""
    return (
        f'<div class="ks-scroll-parallax" '
        f'{_attrs(HASH_SCROLL_PARALLAX, "scroll-layer-parallax")}>'
        f'<div class="ks-scroll-parallax__layers">{layers_html}</div></div>'
    )


def render_curtain_reveal(content_html: str) -> str:
    """Curtain reveal overlay."""
    return (
        f'<div class="ks-curtain-reveal" {_attrs(HASH_CURTAIN_REVEAL, "curtain-reveal")}>'
        f'<div class="ks-curtain-reveal__curtain" aria-hidden="true"></div>'
        f'<div class="ks-curtain-reveal__content">{content_html}</div></div>'
    )


def render_tower_cubes_loader() -> str:
    """Tower cubes loading animation."""
    cubes = "".join(
        f'<div class="ks-tower-cubes__cube" style="--ks-twr-i:{i}"></div>'
        for i in range(5)
    )
    return (
        f'<div class="ks-tower-cubes" role="status" aria-label="Loading" '
        f'{_attrs(HASH_TOWER_CUBES, "tower-cubes-loader")}>'
        f'<div class="ks-tower-cubes__stack">{cubes}</div></div>'
    )


def render_linear_circular_motion() -> str:
    """Linear-to-circular motion demo."""
    return (
        f'<div class="ks-linear-motion" '
        f'{_attrs(HASH_LINEAR_MOTION, "linear-circular-motion")}>'
        f'<div class="ks-linear-motion__path" aria-hidden="true">'
        f'<div class="ks-linear-motion__dot"></div></div></div>'
    )


def render_simplest_dots() -> str:
    """Simplest dots ambient grid."""
    dots = "".join('<span class="ks-dots__dot"></span>' for _ in range(9))
    return (
        f'<div class="ks-dots" {_attrs(HASH_SIMPLEST_DOTS, "simplest-dots")}>'
        f"{dots}</div>"
    )


def render_sphere_cube_intersection() -> str:
    """Sphere–cube intersection scene."""
    return (
        f'<div class="ks-intersection-scene" '
        f'{_attrs(HASH_SPHERE_CUBE, "sphere-cube-intersection")}>'
        f'<div class="ks-intersection-scene__cube" aria-hidden="true"></div>'
        f'<div class="ks-intersection-scene__sphere" aria-hidden="true"></div></div>'
    )


def render_bubbly_grid() -> str:
    """Bubbly grid ambient."""
    cells = "".join('<div class="ks-bubbly-grid__cell"></div>' for _ in range(16))
    return (
        f'<div class="ks-bubbly-grid" {_attrs(HASH_BUBBLY_GRID, "bubbly-grid")}>'
        f"{cells}</div>"
    )


def render_hud_space_panel() -> str:
    """HUD in-space panel."""
    return (
        f'<div class="ks-hud-space" {_attrs(HASH_HUD_SPACE, "hud-space-panel")}>'
        f'<div class="ks-hud-space__frame forge-card p-3">'
        f'<span class="section-label">HUD</span></div></div>'
    )


def render_fractured_pyramid() -> str:
    """Fractured pyramid shards."""
    shards = "".join(
        f'<div class="ks-fractured-pyramid__shard" style="--ks-pry-i:{i}"></div>'
        for i in range(4)
    )
    return (
        f'<div class="ks-fractured-pyramid" '
        f'{_attrs(HASH_FRACTURED_PYRAMID, "fractured-pyramid")}>'
        f'<div class="ks-fractured-pyramid__scene">{shards}</div></div>'
    )


def render_conf_data_block() -> str:
    """Conference data block."""
    return (
        f'<div class="ks-conf-data-block forge-card p-3" '
        f'{_attrs(HASH_CONF_DATA_BLOCK, "conf-data-block")}>'
        f'<pre class="ks-conf-data-block__content mb-0">'
        f"<code>data: conferenced</code></pre></div>"
    )


# --- Wave 2 upgrades (S24–S31) ---


def render_cube_gallery_photo(faces: list[str]) -> str:
    """Cube gallery photo mode."""
    labels = (faces + ["", "", "", "", "", ""])[:6]
    face_html = ""
    for i, lab in enumerate(labels):
        side = _CUBE_FACE_SIDES[i]
        face_html += (
            f'<div class="ks-cube-gallery__face ks-cube-gallery__face--{side}">'
            f'<span class="section-label">{e(lab or side)}</span></div>'
        )
    return (
        f'<div class="ks-cube-gallery ks-cube-gallery--photo" '
        f'{_attrs(HASH_CUBE_GAL, "cube-gallery-photo")}>'
        f'<div class="ks-cube-gallery__scene">{face_html}</div></div>'
    )


def render_spatial_rail_orbit(items_html: str) -> str:
    """Spatial rail orbit mode."""
    return (
        f'<div class="fs-rail fs-rail--cards fs-rail--orbit overflow-auto" '
        f'{_attrs(HASH_SPATIAL_RAIL, "spatial-rail-orbit")}>'
        f'<div class="fs-rail__track d-flex gap-3 py-3">{items_html}</div></div>'
    )


def render_flip_card_stack(items: list[tuple[str, str]]) -> str:
    """Flip card stack — list of (front, back) pairs."""
    cards = ""
    for i, (front, back) in enumerate(items):
        tid = f"ks-flip-stack-{i}"
        cards += (
            f'<div class="ks-card--flip-stack__item">'
            f'<input type="checkbox" class="ks-card--flip__trigger visually-hidden" '
            f'id="{e(tid)}" aria-label="Flip card" />'
            f'<div class="ks-card--flip__inner">'
            f'<div class="ks-card--flip__face ks-card--flip__face--front p-2">'
            f"{front}</div>"
            f'<div class="ks-card--flip__face ks-card--flip__face--back p-2 glass">'
            f"{back}</div></div></div>"
        )
    return (
        f'<div class="ks-card--flip-stack" {_attrs(HASH_FLIP, "flip-card-stack")}>'
        f"{cards}</div>"
    )


def render_display_depth_spiral(text: str) -> str:
    """Display depth spiral variant."""
    return (
        f'<div class="ks-display--depth ks-display--depth--spiral" '
        f'{_attrs(HASH_DISPLAY, "display-depth-spiral")}>'
        f'<h2 class="ks-display--depth__text">{e(text)}</h2></div>'
    )


def render_tunnel_warp(caption: str = "") -> str:
    """Tunnel warp ambient variant."""
    cap = (
        f'<p class="forge-support position-relative z-1 p-3 mb-0">{e(caption)}</p>'
        if caption
        else ""
    )
    return (
        f'<div class="ks-ambient--tunnel ks-ambient--tunnel--warp rounded" '
        f'{_attrs(HASH_TUNNEL, "tunnel-warp")}>'
        f'<div class="ks-ambient--tunnel__grid" aria-hidden="true"></div>'
        f"{cap}</div>"
    )


def render_iso_keypad() -> str:
    """Isometric keypad tile grid."""
    keys = "".join(
        f'<button type="button" class="ks-iso-keypad__key">{e(str(n))}</button>'
        for n in list(range(1, 10)) + [0]
    )
    return (
        f'<div class="ks-tile--iso-keypad" {_attrs(HASH_ISO, "iso-keypad")}>'
        f'<div class="ks-iso-keypad__grid">{keys}</div></div>'
    )


def render_iso_cube_grid() -> str:
    """Isometric cube grid."""
    cells = "".join('<div class="ks-iso-cube-grid__cell"></div>' for _ in range(9))
    return (
        f'<div class="ks-iso-cube-grid" {_attrs(HASH_ISO, "iso-cube-grid")}>'
        f"{cells}</div>"
    )


def render_holo_card_illumination(body_html: str) -> str:
    """Holo card illumination variant."""
    return (
        f'<div class="ks-card--holo ks-card--holo--illumination ks-pointer-depth" '
        f'data-ks-holo data-ks-pointer-max="14" '
        f'{_attrs(HASH_HOLO, "holo-card-illumination")}>'
        f'<div class="ks-card--holo__inner forge-card p-3">'
        f'<div class="ks-card--holo__glare" aria-hidden="true"></div>'
        f'<div class="ks-card--holo__glow" aria-hidden="true"></div>'
        f"{body_html}</div></div>"
    )
