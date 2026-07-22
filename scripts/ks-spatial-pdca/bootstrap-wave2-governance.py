#!/usr/bin/env python3
"""Bootstrap Wave 2 spatial governance artifacts from wave2-registry.yaml."""
from __future__ import annotations

import json
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[2]
REGISTRY = REPO / "docs/design/spatial/wave2-registry.yaml"
EFFECTS = REPO / "docs/design/spatial/effects"
ORACLES = REPO / "docs/design/spatial/oracles"
CONTRACTS = REPO / "docs/design/catalog/components"
SHOWCASE_BASE = "https://ks.forgesdlc.com/cases/showcase"

# FreeFrontend traceability rows: page, title, anchor_slug, ks_mapping, status
FF_ROWS: list[tuple[int, str, str, str, str]] = [
    (1, "3D Rolling Cube 404 Page Animation", "3d-rolling-cube-404-page-animation", "Erc", "planned"),
    (1, "Isometric 3D Mechanical Numpad", "isometric-3d-mechanical-numpad", "Iso variant=keypad", "partial"),
    (1, "3D Zig-Zag Edge CSS Dividers", "3d-zig-zag-edge-css-dividers", "Zzg", "implemented"),
    (1, "CSS 3D Morphing Geometric Polyhedron", "css-3d-morphing-geometric-polyhedron", "Mph", "planned"),
    (1, "3D Neumorphic Pill Toggle Switch", "3d-neumorphic-pill-toggle-switch", "Nsw", "implemented"),
    (1, "3D Warp Speed Tunnel", "3d-warp-speed-tunnel", "Tun variant=warp", "partial"),
    (1, "Neumorphic 3D Range Slider", "neumorphic-3d-range-slider", "Rng", "implemented"),
    (1, "3D Rotating Value Dial", "3d-rotating-value-dial", "Dil", "implemented"),
    (1, "Skeuomorphic Egg Toggle Switch", "skeuomorphic-egg-toggle-switch", "—", "out-of-scope"),
    (1, "Skeuomorphic Retro Casio F-91W Watch", "skeuomorphic-retro-casio-f-91w-watch", "—", "out-of-scope"),
    (1, "Skeuomorphic 3D Elastic Toggle Switch", "skeuomorphic-3d-elastic-toggle-switch", "—", "out-of-scope"),
    (1, "Skeuomorphic Lunar Desk Calendar", "skeuomorphic-lunar-desk-calendar", "—", "out-of-scope"),
    (1, "Skeuomorphic Reversi Radio Buttons", "skeuomorphic-reversi-radio-buttons", "Fch", "implemented"),
    (1, "Neon 3D Seven-Segment Digital Clock", "neon-3d-seven-segment-digital-clock", "Fck", "planned"),
    (1, "Tumbling 3D Cubes Animation", "tumbling-3d-cubes-animation", "Tmb", "planned"),
    (1, "Skeuomorphic Chess Pawn", "skeuomorphic-chess-pawn", "—", "out-of-scope"),
    (1, "Holographic 3D Interactive Card", "holographic-3d-interactive-card", "Hol", "implemented"),
    (1, "Draggable 3D Cube with Dynamic Lighting", "draggable-3d-cube-with-dynamic-lighting", "Dcb", "implemented"),
    (1, "Interactive 3D Photo Cube", "interactive-3d-photo-cube", "Cbg mode=photo", "partial"),
    (1, "Trigonometric 3D Orbit CSS Gallery", "trigonometric-3d-orbit-css-gallery", "Srl mode=orbit", "partial"),
    (1, "SlowMo Mullen Card Trick", "slowmo-mullen-card-trick", "—", "out-of-scope"),
    (1, "Blocky Digital Clock", "blocky-digital-clock", "Fck", "planned"),
    (1, "3D Glowing Button with CSS", "3d-glowing-button-with-css", "Cgb", "implemented"),
    (1, "Amateur Radio Badge 3D", "amateur-radio-badge-3d", "Hbd", "implemented"),
    (1, "Floating Headers", "floating-headers", "Flh", "implemented"),
    (1, "Grow Up, They Said...", "grow-up-they-said", "Flp variant=stack", "partial"),
    (1, "Volumetric 3D CSS Toggle Switch", "volumetric-3d-css-toggle-switch", "Vsw", "implemented"),
    (1, "Container Query Bookstore", "container-query-bookstore", "—", "out-of-scope"),
    (1, "3D Text Spiral Animation with CSS", "3d-text-spiral-animation-with-css", "Dpt variant=spiral", "partial"),
    (1, "CSS-Only Image Tilt Towards Cursor", "css-only-image-tilt-towards-cursor", "Tlz + Tlj", "partial"),
    (2, "Pure CSS 3D Animated Cat Model", "pure-css-3d-animated-cat-model", "—", "out-of-scope"),
    (2, "Pro-Mode Toggle Switch w/ Guard", "pro-mode-toggle-switch-w-guard", "Pmg", "planned"),
    (2, "Pro-Mode Toggle Switch with Guard (Softer)", "pro-mode-toggle-switch-with-guard-softer", "Pmg variant=soft", "planned"),
    (2, "Vertical Rocker Switch", "vertical-rocker-switch", "Vrk", "planned"),
    (2, "Vertical 3D Team Carousel", "vertical-3d-team-carousel", "Vtc", "planned"),
    (2, "Cube Clock with CSS 3D", "cube-clock-with-css-3d", "Fck", "planned"),
    (2, "3D Sphere with Dynamic Shadow", "3d-sphere-with-dynamic-shadow", "Orb variant=shadow", "planned"),
    (2, "Card with Illumination Effect", "card-with-illumination-effect", "Hol variant=illumination", "partial"),
    (2, "Shimmer 3D Dodecahedron", "shimmer-3d-dodecahedron", "Mph variant=dodecahedron", "planned"),
    (2, "Stellar 3D Slide Navigator", "stellar-3d-slide-navigator", "Stn", "planned"),
    (2, "Orbital Photo Gallery", "orbital-photo-gallery", "Opg", "planned"),
    (2, "Pure CSS Linear Circular Motion", "pure-css-linear-circular-motion", "Mch", "planned"),
    (2, "3D Cube Resume with CSS Transforms", "3d-cube-resume-with-css-transforms", "Cbg", "partial"),
    (2, "The Simplest Dots (CSS)", "the-simplest-dots-css", "Dot", "planned"),
    (2, "3D Glowing Bottle", "3d-glowing-bottle", "—", "out-of-scope"),
    (2, "CSS 3D Sphere Animation", "css-3d-sphere-animation", "Orb variant=rings", "planned"),
    (2, "Pure CSS Wobble-Rotating Sphere", "pure-css-wobble-rotating-sphere", "Orb variant=wobble", "planned"),
    (2, "SVG Starry Cube", "svg-starry-cube", "—", "out-of-scope"),
    (2, "The Backrooms: CSS Edition", "the-backrooms-css-edition", "—", "out-of-scope"),
    (2, "CSS Light Sphere Animation #21", "css-light-sphere-animation-21", "Orb variant=light21", "planned"),
    (2, "Complete 3D Chicken in Pure CSS", "complete-3d-chicken-in-pure-css", "—", "out-of-scope"),
    (2, "Icosphere of Spheres in Pure CSS", "icosphere-of-spheres-in-pure-css", "Opg", "partial"),
    (2, "CSS Math Globe Animation", "css-math-globe-animation", "Glb", "planned"),
    (2, "Pure CSS Animated FF Conf Logo", "pure-css-animated-ff-conf-logo", "Dbf", "planned"),
    (2, "Flying Through Hexagons", "flying-through-hexagons", "Hex", "planned"),
    (2, "Pure CSS 3D: Creation of Adam", "pure-css-3d-creation-of-adam", "—", "out-of-scope"),
    (2, "Pure CSS 3D David Eye", "pure-css-3d-david-eye", "—", "out-of-scope"),
    (2, "Card Carousel (CSS Only)", "card-carousel-css-only", "Crg", "planned"),
    (2, "Cube Grid (Pure CSS)", "cube-grid-pure-css", "Iso variant=grid", "partial"),
    (2, "CSS Bookmark", "css-bookmark", "Bkm", "planned"),
    (3, "Vinyl Albums", "vinyl-albums", "Vnl", "planned"),
    (3, "RGB Keyboard with Dark Mode", "rgb-keyboard-with-dark-mode", "Kbd", "planned"),
    (3, "Cube Login Form", "cube-login-form", "Clf", "planned"),
    (3, "3D Flip Clock Counter in Pure CSS", "3d-flip-clock-counter-in-pure-css", "Fck", "planned"),
    (3, "CSS 3D Sphere, Cubes, Intersection", "css-3d-sphere-cubes-intersection", "Xsc", "planned"),
    (3, "Pure CSS Art: 3D Walkman", "pure-css-art-3d-walkman", "—", "out-of-scope"),
    (3, "Pure CSS 3D Player/Recorder", "pure-css-3d-player-recorder", "—", "out-of-scope"),
    (3, "CSS Shapes & Lights", "css-shapes-lights", "Lgt", "planned"),
    (3, "Toast", "toast", "—", "out-of-scope"),
    (3, "Tower of Climbing Cubes", "tower-of-climbing-cubes", "Twr", "planned"),
    (3, "3D in CSS is Not Real", "3d-in-css-is-not-real", "Orb variant=cubes", "planned"),
    (3, "3D Fractured Pyramid", "3d-fractured-pyramid", "Pry", "planned"),
    (3, "Bubbly", "bubbly", "Bbl", "planned"),
    (3, "150ml of vanilla CSS", "150ml-of-vanilla-css", "—", "out-of-scope"),
    (3, "3D HUD in Space - Pure CSS", "3d-hud-in-space-pure-css", "Hud", "planned"),
    (3, "Pure CSS 3D", "pure-css-3d", "Mph", "planned"),
    (3, "3D Printer", "3d-printer", "—", "out-of-scope"),
    (3, "Town", "town", "—", "out-of-scope"),
    (3, "3D Modern House - Pure CSS", "3d-modern-house-pure-css", "—", "out-of-scope"),
]


UPGRADE_ORACLE_SCENARIOS: dict[str, dict] = {
    "S24": {
        "id": "cbg-photo-mode",
        "prefers_reduced_motion": False,
        "actions": [],
        "expect": {
            "root_selector": '.ks-cube-gallery--photo[data-ks-hash="Cbg"]',
            "threshold": 1,
        },
    },
    "S25": {
        "id": "srl-orbit-mode",
        "prefers_reduced_motion": False,
        "actions": [],
        "expect": {
            "root_selector": '.fs-rail--orbit[data-ks-hash="Srl"]',
            "threshold": 1,
        },
    },
    "S26": {
        "id": "flp-stack-variant",
        "prefers_reduced_motion": False,
        "actions": [],
        "expect": {
            "root_selector": '.ks-card--flip-stack[data-ks-hash="Flp"]',
            "threshold": 1,
        },
    },
    "S27": {
        "id": "dpt-spiral-variant",
        "prefers_reduced_motion": False,
        "actions": [],
        "expect": {
            "root_selector": '.ks-display--depth--spiral[data-ks-hash="Dpt"]',
            "threshold": 1,
        },
    },
    "S28": {
        "id": "tun-warp-variant",
        "prefers_reduced_motion": False,
        "actions": [],
        "expect": {
            "root_selector": '.ks-ambient--tunnel--warp[data-ks-hash="Tun"]',
            "threshold": 1,
        },
    },
    "S29": {
        "id": "iso-keypad-variant",
        "prefers_reduced_motion": False,
        "actions": [],
        "expect": {
            "root_selector": '.ks-tile--iso-keypad[data-ks-hash="Iso"]',
            "threshold": 1,
        },
    },
    "S30": {
        "id": "iso-grid-variant",
        "prefers_reduced_motion": False,
        "actions": [],
        "expect": {
            "root_selector": '.ks-iso-cube-grid[data-ks-hash="Iso"]',
            "threshold": 1,
        },
    },
    "S31": {
        "id": "hol-illumination-variant",
        "prefers_reduced_motion": False,
        "actions": [],
        "expect": {
            "root_selector": '.ks-card--holo--illumination[data-ks-hash="Hol"]',
            "threshold": 1,
        },
    },
}


def ff_url(page: int, slug: str) -> str:
    base = "https://freefrontend.com/css-3d-examples/"
    if page > 1:
        base += f"page/{page}/"
    return f"{base}#{slug}"


def ks_showcase_url(mapping: str, wave: dict) -> str:
    if mapping == "—" or mapping.startswith("—"):
        return "—"
    h = mapping.split()[0]
    for ph in wave["phases"].values():
        if ph.get("hash") == h and ph.get("showcase_page"):
            anchor = ph.get("showcase_anchor", "")
            return f"{SHOWCASE_BASE}/{ph['showcase_page']}{anchor}"
    for ph in wave["phases"].values():
        if ph.get("hash") == h.split("=")[0]:
            page = ph.get("showcase_page", "spatial-effects.html")
            anchor = ph.get("showcase_anchor", "")
            return f"{SHOWCASE_BASE}/{page}{anchor}"
    return f"{SHOWCASE_BASE}/spatial-effects.html"


def write_traceability(wave: dict) -> None:
    path = REPO / "docs/design/spatial/freefrontend-traceability.md"
    lines = [
        "# FreeFrontend CSS 3D traceability matrix",
        "",
        "Maps [FreeFrontend CSS 3D examples](https://freefrontend.com/css-3d-examples/) "
        "(pages 1–3, ~79 entries) to KS spatial primitives.",
        "",
        "| Page | FF example | FF link | KS mapping | Status | KS showcase |",
        "|------|------------|---------|------------|--------|-------------|",
    ]
    for page, title, slug, mapping, status in FF_ROWS:
        ff = ff_url(page, slug)
        ks = ks_showcase_url(mapping, wave)
        lines.append(f"| {page} | {title} | [FF]({ff}) | `{mapping}` | {status} | {ks} |")
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {path} ({len(FF_ROWS)} rows)")


def ensure_effect_doc(hash_id: str, slug: str, purpose: str) -> None:
    path = EFFECTS / f"{slug}.md"
    if path.exists() and "Wave 2" not in path.read_text(encoding="utf-8"):
        return
    anchor = f"#sec-{slug.replace('-', '-')}"
    content = f"""# {slug.replace('-', ' ').title()} (`{hash_id}`)

**Hash:** `{hash_id}` · **Slug:** `{slug}` · **Showcase:** `{anchor}`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

{purpose}

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/{hash_id}.json`](../oracles/{hash_id}.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="{hash_id}"`.
- Motion respects `prefers-reduced-motion: reduce`.
"""
    path.write_text(content, encoding="utf-8")


def ensure_oracle(
    hash_id: str,
    slug: str,
    page: str,
    anchor: str,
    extra_scenarios: list[dict] | None = None,
) -> None:
    path = ORACLES / f"{hash_id}.json"
    scenarios = [
        {
            "id": f"{slug[:3]}-dom-present",
            "prefers_reduced_motion": False,
            "actions": [],
            "expect": {"root_selector": f'[data-ks-hash="{hash_id}"]', "threshold": 1},
        }
    ]
    if extra_scenarios:
        scenarios.extend(extra_scenarios)
    if path.exists():
        existing = json.loads(path.read_text(encoding="utf-8"))
        ids = {s["id"] for s in existing.get("scenarios", [])}
        for s in scenarios:
            if s["id"] not in ids:
                existing.setdefault("scenarios", []).append(s)
        path.write_text(json.dumps(existing, indent=2) + "\n", encoding="utf-8")
        return
    data = {
        "hash": hash_id,
        "slug": slug,
        "showcase_anchor": anchor,
        "showcase_page": page,
        "scenarios": scenarios,
    }
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def ensure_contract(hash_id: str, slug: str, purpose: str) -> None:
    path = CONTRACTS / f"{hash_id}-{slug}.md"
    if path.exists():
        return
    content = f"""# {hash_id} — {slug.replace('-', ' ').title()}

**Hash:** `{hash_id}` · **Type:** component · **Family:** spatial · **Status:** active

Source: spatial emitters · Showcase anchor: `{slug}`

## Purpose

{purpose}

## Deterministic checks

Oracle: `docs/design/spatial/oracles/{hash_id}.json`

## Root element

```html
<div data-ks-hash="{hash_id}" data-ks-type="component" data-ks-name="{slug}">
```
"""
    path.write_text(content, encoding="utf-8")


def bootstrap_components(wave: dict) -> None:
    seen_hashes: set[str] = set()
    for phase_id, ph in wave["phases"].items():
        if ph.get("kind") == "skip" or ph.get("kind") == "foundation":
            continue
        h = ph.get("hash")
        slug = ph.get("slug")
        if not h or not slug:
            continue
        title = ph.get("title", slug)
        page = ph.get("showcase_page", "spatial-effects.html")
        anchor = ph.get("showcase_anchor", f"#sec-{slug}")
        ensure_effect_doc(h, slug, title)
        ensure_oracle(h, slug, page, anchor)
        if ph.get("kind") == "component":
            if h not in seen_hashes:
                ensure_contract(h, slug, title)
                seen_hashes.add(h)
        elif ph.get("kind") == "upgrade":
            scenario = UPGRADE_ORACLE_SCENARIOS.get(phase_id)
            if scenario:
                extra = [scenario]
                ensure_oracle(h, slug, page, anchor, extra)


def ensure_ifn_artifacts() -> None:
    ensure_effect_doc("Ifn", "fisheye-depth-nav", "Fisheye depth navigation strip")
    ensure_oracle(
        "Ifn",
        "fisheye-depth-nav",
        "spatial-surfaces.html",
        "#sec-fisheye-nav",
    )
    ensure_contract("Ifn", "fisheye-depth-nav", "Fisheye depth navigation strip")


def sync_sequence_yaml(wave: dict) -> None:
    seq_path = REPO / "scripts/ks-spatial-pdca/SEQUENCE.yaml"
    text = seq_path.read_text(encoding="utf-8")
    if "  S23:" in text:
        return
    w = wave["waves"]
    wave_insert = (
        "  wave-traceability:\n"
        f"    phases: {w['traceability']}\n"
        "  wave-upgrades:\n"
        f"    phases: {w['upgrades']}\n"
        "  wave-controls:\n"
        f"    phases: {w['controls']}\n"
        "  wave-surfaces-rails:\n"
        f"    phases: {w['surfaces_rails']}\n"
        "  wave-ambient:\n"
        f"    phases: {w['ambient']}\n"
        "  wave-optional:\n"
        f"    phases: {w['optional']}\n"
    )
    text = text.replace(
        "  plan-only:\n    phases: [S00, S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22]",
        wave_insert
        + "  plan-only:\n    phases: [S00, S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, "
        + ", ".join(
            w["traceability"]
            + w["upgrades"]
            + w["controls"]
            + w["surfaces_rails"]
            + w["ambient"]
            + w["optional"]
        )
        + "]",
    )
    phase_lines = []
    for phase_id, ph in sorted(wave["phases"].items(), key=lambda x: x[0]):
        phase_lines.append(f"  {phase_id}:")
        phase_lines.append(f"    title: {ph['title']}")
        phase_lines.append(f"    kind: {ph['kind']}")
        if ph.get("hash"):
            phase_lines.append(f"    hash: {ph['hash']}")
        if ph.get("slug"):
            phase_lines.append(f"    slug: {ph['slug']}")
        phase_lines.append(f"    depends_on: {ph.get('depends_on', [])}")
    text = text.rstrip() + "\n" + "\n".join(phase_lines) + "\n"
    seq_path.write_text(text, encoding="utf-8")
    print(f"updated {seq_path}")


def generate_phase_hash_map(wave: dict) -> None:
    path = REPO / "scripts/ks-spatial-pdca/phase-hash-map.sh"
    lines = ["#!/usr/bin/env bash", "# Generated by bootstrap-wave2-governance.py", "phase_hash_from_map() {", "  case \"$1\" in"]
    base = {
        "S03": "Flp", "S04": "Tlz", "S05": "Hol", "S06": "Zzg", "S07": "Dpt",
        "S08": "Cgb", "S09": "Vsw", "S10": "Rng", "S11": "Fch", "S12": "Hbd",
        "S13": "Mpx", "S14": "Cbg", "S15": "Dcb", "S16": "Tun", "S17": "Pst",
        "S18": "Iso", "S19": "Flh", "S20": "Dil", "S21": "Nsw", "S22": "Srl",
        "S02": "Tlz",
    }
    for k, v in base.items():
        lines.append(f"    {k}) echo \"{v}\" ;;")
    for phase_id, ph in wave["phases"].items():
        if ph.get("kind") in ("skip", "foundation"):
            lines.append(f"    {phase_id}) echo \"\" ;;")
        elif ph.get("hash"):
            lines.append(f"    {phase_id}) echo \"{ph['hash']}\" ;;")
    lines.append('    *) echo "" ;;')
    lines.append("  esac")
    lines.append("}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    path.chmod(0o755)


def append_registry_entries(wave: dict) -> None:
    reg_path = REPO / "docs/design/catalog/visual-registry.yaml"
    text = reg_path.read_text(encoding="utf-8")
    new_hashes = []
    for phase_id, ph in wave["phases"].items():
        if ph.get("kind") != "component":
            continue
        h = ph.get("hash")
        slug = ph.get("slug")
        if not h or not slug or f"hash: {h}\n" in text:
            continue
        page = ph.get("showcase_page", "spatial-effects.html")
        anchor = ph.get("showcase_anchor", "")
        url = f"{SHOWCASE_BASE}/{page}{anchor}"
        block = f"""
- family: python-components
  aliases: []
  parent_hash: Ksp
  child_hashes: []
  accessibility_notes: See docs/design/spatial/effects/{slug}.md
  responsive_notes: See oracle scenarios in docs/design/spatial/oracles/{h}.json
  owner: forge-ks
  last_reviewed: '2026-07-22'
  notes: Spatial Wave 2 primitive ({phase_id}).
  hash_exception_reason: null
  design_standard_refs:
  - docs/design/forge-enterprise-ai-website-standard.md
  hash: {h}
  name: {slug.replace('-', ' ').title()}
  slug: {slug}
  type: component
  category: component
  status: active
  source_paths:
  - components/spatial_wave2.py
  - css/ks-spatial-wave2.css
  source_symbols: []
  root_selector: '[data-ks-hash="{h}"]'
  contract: docs/design/catalog/components/{h}-{slug}.md
  contract_status: own
  showcase_url: {url}
  screenshot_url: null
  screenshot_status: planned
  emit_marker_in_showcase: true
  emits_html: true
"""
        new_hashes.append(block)
    if not new_hashes:
        return
    marker = "  hash: Srl\n  name: Spatial Rail"
    idx = text.find(marker)
    if idx == -1:
        text = text.rstrip() + "\n" + "".join(new_hashes)
    else:
        insert_at = text.find("\n- family:", idx + 1)
        if insert_at == -1:
            insert_at = len(text)
        text = text[:insert_at] + "".join(new_hashes) + text[insert_at:]
    reg_path.write_text(text, encoding="utf-8")
    print(f"appended {len(new_hashes)} registry entries")


def main() -> None:
    wave = yaml.safe_load(REGISTRY.read_text(encoding="utf-8"))
    write_traceability(wave)
    bootstrap_components(wave)
    ensure_ifn_artifacts()
    sync_sequence_yaml(wave)
    generate_phase_hash_map(wave)
    append_registry_entries(wave)
    print("bootstrap complete")


if __name__ == "__main__":
    main()
