"""Landing block injection for handbook L1/L2 pages."""

from __future__ import annotations

from pathlib import Path

from forge_autodoc.ks_path import ensure_kitchensink_importable
from forge_autodoc.landing_blocks import apply_landing_blocks_to_body
from forge_autodoc.page import assemble_handbook_page


def test_layer_strata_renders_expandable_disclosures() -> None:
    ks_root = Path(__file__).resolve().parents[2]
    ensure_kitchensink_importable(ks_root)
    from handbook_landing import render_layer_strata

    html = render_layer_strata(
        [
            {
                "id": "conceptual",
                "stratum": "Conceptual stratum",
                "summary": "Shared meaning before automation.",
                "components": [
                    {
                        "id": "forgesdlc",
                        "label": "Methodology",
                        "name": "ForgeSDLC",
                        "role": "Ceremonies and delivery intent",
                        "href": "#",
                    },
                    {
                        "id": "blueprints",
                        "label": "Practice",
                        "name": "Blueprints",
                        "role": "Executable policy",
                        "href": "#",
                    },
                ],
            },
            {
                "id": "interaction",
                "stratum": "Interaction stratum",
                "summary": "Governed teaming.",
                "layout": "dual",
                "agent": [
                    {
                        "id": "workcells",
                        "label": "Envelope",
                        "name": "Workcells",
                        "role": "Bounded agent work",
                        "href": "#",
                    }
                ],
                "human": [
                    {
                        "id": "autonomy",
                        "label": "Maturity",
                        "name": "Autonomy ladder",
                        "role": "L0–L8 gates",
                        "href": "#",
                    }
                ],
            },
        ],
        evidence={
            "stratum": "Evidence spine",
            "summary": "Continuous proof.",
            "components": [
                {
                    "id": "forgerun",
                    "label": "Runs",
                    "name": "ForgeRun",
                    "role": "Typed runs",
                    "href": "#",
                }
            ],
        },
    )
    assert 'data-ks-hash="Hls"' in html
    assert 'data-ks-hash="Hes"' in html
    assert "ks-handbook-stratum-disclosure" in html
    assert "ks-handbook-element-card" in html
    assert "ks-handbook-layer-strata--expandable" in html
    assert "2 elements" in html
    assert "Agent permissions" in html
    assert "Human obligations" in html
    assert "<details" in html
    assert "<summary" in html


def test_resolve_landing_block_source_yaml(tmp_path: Path) -> None:
    from forge_autodoc.landing_blocks import resolve_landing_block_sources

    content_root = tmp_path
    src = content_root / "docs" / "strata.yaml"
    src.parent.mkdir(parents=True)
    src.write_text(
        "expandable: true\n"
        "evidence:\n"
        "  stratum: Evidence\n"
        "  summary: Proof\n"
        "  components:\n"
        "    - id: run\n"
        "      label: Run\n"
        "      name: ForgeRun\n"
        "      role: Runs\n"
        "      href: runs.md\n"
        "strata:\n"
        "  - id: conceptual\n"
        "    stratum: Conceptual\n"
        "    summary: Meaning\n"
        "    components:\n"
        "      - id: bp\n"
        "        label: Practice\n"
        "        name: Blueprints\n"
        "        role: Policy\n"
        "        href: blueprints.md\n",
        encoding="utf-8",
    )
    resolved = resolve_landing_block_sources(
        {
            "layer_strata": {
                "source": "docs/strata.yaml",
                "href_prefix": "../",
            }
        },
        content_root=content_root,
    )
    cfg = resolved["layer_strata"]
    assert cfg["expandable"] is True
    assert cfg["evidence"]["components"][0]["href"] == "../runs.md"
    assert cfg["strata"][0]["components"][0]["href"] == "../blueprints.md"
    assert "source" not in cfg
    assert "href_prefix" not in cfg


def test_layer_flow_pyramid_renders_vertical_stack() -> None:
    ks_root = Path(__file__).resolve().parents[2]
    ensure_kitchensink_importable(ks_root)
    from handbook_landing import render_layer_flow_chart

    flow = render_layer_flow_chart(
        [
            {"layer": "A", "product": "One", "role": "First", "href": "#"},
            {"layer": "B", "product": "Two", "role": "Second", "href": "#"},
        ],
        layout="pyramid",
    )
    assert 'data-ks-hash="Hlf"' in flow
    assert "ks-handbook-layer-flow--pyramid" in flow
    assert "ks-handbook-layer-flow__connector" in flow
    assert "forge-card" in flow
    assert "fs-rail" not in flow


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
    assert "ks-handbook-steps" in html or "ks-handbook-landing-band" in html
