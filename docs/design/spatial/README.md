# Spatial effects subsystem

Governed 3D and depth primitives for Kitchen Sink showcase and consumer sites.

## Dual-wiki layout

| Layer | Path | Audience |
|-------|------|----------|
| Maintainer specs | [`effects/`](effects/) | Humans — behavior, anatomy, accessibility |
| Machine oracles | [`oracles/`](oracles/) | Playwright / LCDL `ks_spatial_effect_evaluate_v1` |
| Design contracts | [`../catalog/components/`](../catalog/components/) | Visual catalog hash governance |

## Showcase

Live demos: showcase page **Spatial & 3D Effects** (`generator/pages/spatial-effects.py`).

Emitters: `components/spatial.py` · Styles: `css/ks-spatial.css` · Scripts: `js/ks-pointer-depth.js`, `js/ks-tilt-tiles.js`, `js/ks-spatial-cube.js`, `js/ks-spatial-rail.js`.

## Verification

1. Build showcase (`python3 generator/build-showcase.py`).
2. Run spatial verifier (`tools/spatial-effects-verifier/`) against oracle JSON.
3. Each oracle scenario must pass with `expect.threshold` **1.0** on `root_selector`.

See [ORACLE-SCHEMA.md](ORACLE-SCHEMA.md) for JSON field definitions.

## Effect index

| Hash | Slug | Maintainer doc | Oracle |
|------|------|----------------|--------|
| `Flp` | flip-card | [effects/flip-card.md](effects/flip-card.md) | [oracles/Flp.json](oracles/Flp.json) |
| `Tlz` | tilt-css | [effects/tilt-css.md](effects/tilt-css.md) | [oracles/Tlz.json](oracles/Tlz.json) |
| `Hol` | holo-card | [effects/holo-card.md](effects/holo-card.md) | [oracles/Hol.json](oracles/Hol.json) |
| `Zzg` | zigzag-divider | [effects/zigzag-divider.md](effects/zigzag-divider.md) | [oracles/Zzg.json](oracles/Zzg.json) |
| `Dpt` | display-depth | [effects/display-depth.md](effects/display-depth.md) | [oracles/Dpt.json](oracles/Dpt.json) |
| `Cgb` | cube-glow-button | [effects/cube-glow-button.md](effects/cube-glow-button.md) | [oracles/Cgb.json](oracles/Cgb.json) |
| `Vsw` | volumetric-switch | [effects/volumetric-switch.md](effects/volumetric-switch.md) | [oracles/Vsw.json](oracles/Vsw.json) |
| `Rng` | tactile-range | [effects/tactile-range.md](effects/tactile-range.md) | [oracles/Rng.json](oracles/Rng.json) |
| `Fch` | flip-choice | [effects/flip-choice.md](effects/flip-choice.md) | [oracles/Fch.json](oracles/Fch.json) |
| `Hbd` | holo-badge | [effects/holo-badge.md](effects/holo-badge.md) | [oracles/Hbd.json](oracles/Hbd.json) |
| `Mpx` | media-parallax | [effects/media-parallax.md](effects/media-parallax.md) | [oracles/Mpx.json](oracles/Mpx.json) |
| `Cbg` | cube-gallery | [effects/cube-gallery.md](effects/cube-gallery.md) | [oracles/Cbg.json](oracles/Cbg.json) |
| `Dcb` | draggable-cube | [effects/draggable-cube.md](effects/draggable-cube.md) | [oracles/Dcb.json](oracles/Dcb.json) |
| `Tun` | tunnel-ambient | [effects/tunnel-ambient.md](effects/tunnel-ambient.md) | [oracles/Tun.json](oracles/Tun.json) |
| `Pst` | perspective-stage | [effects/perspective-stage.md](effects/perspective-stage.md) | [oracles/Pst.json](oracles/Pst.json) |
| `Iso` | isometric-tile | [effects/isometric-tile.md](effects/isometric-tile.md) | [oracles/Iso.json](oracles/Iso.json) |
| `Flh` | floating-header | [effects/floating-header.md](effects/floating-header.md) | [oracles/Flh.json](oracles/Flh.json) |
| `Dil` | depth-dial | [effects/depth-dial.md](effects/depth-dial.md) | [oracles/Dil.json](oracles/Dil.json) |
| `Nsw` | neumorphic-switch | [effects/neumorphic-switch.md](effects/neumorphic-switch.md) | [oracles/Nsw.json](oracles/Nsw.json) |
| `Srl` | spatial-rail | [effects/spatial-rail.md](effects/spatial-rail.md) | [oracles/Srl.json](oracles/Srl.json) |
