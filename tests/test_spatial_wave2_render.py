"""Unit tests for spatial Wave 2 render emitters."""
from __future__ import annotations

import re
import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "components"))

import spatial  # noqa: E402
import spatial_wave2 as sw2  # noqa: E402

HASH_ATTR = re.compile(r'data-ks-hash="([A-Z][a-z]{2})"')


def _hash(html: str) -> str:
    match = HASH_ATTR.search(html)
    assert match, f"missing data-ks-hash in: {html[:120]!r}..."
    return match.group(1)


@pytest.mark.parametrize(
    ("renderer", "expected_hash", "needle"),
    [
        (lambda: sw2.render_flip_clock_counter(), "Fck", "ks-flip-clock"),
        (lambda: sw2.render_tilt_js_card("<p>x</p>"), "Tlj", "ks-tilt--js"),
        (lambda: sw2.render_ring_carousel(["A", "B"]), "Crg", "ks-ring-carousel"),
        (lambda: sw2.render_error_cube_404(), "Erc", "ks-error-cube"),
        (lambda: sw2.render_bubbly_grid(), "Bbl", "ks-bubbly"),
    ],
)
def test_wave2_component_emitters(renderer, expected_hash: str, needle: str) -> None:
    html = renderer()
    assert _hash(html) == expected_hash
    assert needle in html


@pytest.mark.parametrize(
    ("renderer", "expected_hash", "needle"),
    [
        (lambda: sw2.render_cube_gallery_photo(["a", "b", "c"]), "Cbg", "ks-cube-gallery--photo"),
        (lambda: sw2.render_spatial_rail_orbit("<span>x</span>"), "Srl", "fs-rail--orbit"),
        (lambda: sw2.render_flip_card_stack([("a", "b")]), "Flp", "ks-card--flip-stack"),
        (lambda: sw2.render_display_depth_spiral("HELLO"), "Dpt", "ks-display--depth--spiral"),
        (lambda: sw2.render_tunnel_warp(), "Tun", "ks-ambient--tunnel--warp"),
        (lambda: sw2.render_iso_keypad(), "Iso", "ks-tile--iso-keypad"),
        (lambda: sw2.render_iso_cube_grid(), "Iso", "ks-iso-cube-grid"),
        (lambda: sw2.render_holo_card_illumination("<p>x</p>"), "Hol", "ks-card--holo--illumination"),
    ],
)
def test_wave2_upgrade_emitters(renderer, expected_hash: str, needle: str) -> None:
    html = renderer()
    assert _hash(html) == expected_hash
    assert needle in html


def test_spatial_py_reexports_v2_modes() -> None:
    for name in (
        "render_cube_gallery_photo",
        "render_spatial_rail_orbit",
        "render_flip_card_stack",
        "render_display_depth_spiral",
        "render_tunnel_warp",
        "render_iso_keypad",
        "render_iso_cube_grid",
        "render_holo_card_illumination",
    ):
        assert hasattr(spatial, name), name
        assert callable(getattr(spatial, name))
