"""Landing block injection for handbook L1/L2 pages."""

from __future__ import annotations

from pathlib import Path

from forge_autodoc.ks_path import ensure_kitchensink_importable
from forge_autodoc.landing_blocks import apply_landing_blocks_to_body
from forge_autodoc.page import assemble_handbook_page


def test_landing_blocks_inject_spatial_assets_and_markers() -> None:
    ks_root = Path(__file__).resolve().parents[2]
    ensure_kitchensink_importable(ks_root)
    from handbook_landing import render_layer_card_rail

    rail = render_layer_card_rail(
        [{"layer": "Test", "product": "Product", "role": "Role text", "href": "#"}]
    )
    assert 'data-ks-hash="Hlr"' in rail
    assert "forge-card" in rail

    body = "<p>Intro</p><!-- ks-landing:layer_rail -->"
    fm = {
        "landing_blocks": {
            "layer_rail": {
                "items": [
                    {
                        "layer": "Layer",
                        "product": "Prod",
                        "role": "Desc",
                        "href": "https://example.com",
                    }
                ]
            }
        }
    }
    out = apply_landing_blocks_to_body(ks_root, body, fm)
    assert "ks-handbook-landing-band" in out
    assert "<!-- ks-landing:layer_rail -->" not in out

    html = assemble_handbook_page(
        kitchensink_root=ks_root,
        browser_title="Landing",
        handbook_name="Handbook",
        page_title="Landing",
        intro="Lede.",
        body_html=out,
        toc=[],
        sidebar_html="",
        offcanvas_html="",
        prev_link=None,
        next_link=None,
        canonical_md="",
        is_template=False,
        show_canonical_note=False,
        minimal_shell=True,
        page_type="landing",
        spatial_landing_assets=True,
    )
    assert "ks-nav-layout.css" in html
    assert "ks-peek-rail.js" in html
    assert 'data-bs-theme' in html
