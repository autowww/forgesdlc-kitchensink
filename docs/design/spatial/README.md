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

Emitters: `components/spatial.py` (Wave 1 + v2 re-exports) · Wave 2: `components/spatial_wave2.py`, `components/nav_layout.py` (`Ifn`) · Styles: `css/ks-spatial.css`, `css/ks-spatial-wave2.css` · Scripts: `js/ks-pointer-depth.js`, `js/ks-tilt-tiles.js`, `js/ks-spatial-cube.js`, `js/ks-spatial-rail.js`.

**FreeFrontend traceability:** [freefrontend-traceability.md](freefrontend-traceability.md) (79-row matrix, pages 1–3).

Category showcase pages: `spatial-surfaces`, `spatial-controls`, `spatial-ambient`, `spatial-rails`.

## Verification

1. Build showcase (`python3 generator/build-showcase.py`).
2. Run spatial verifier (`tools/spatial-effects-verifier/`) against oracle JSON.
3. Run render unit tests (`pytest tests/test_spatial_wave2_render.py`).
4. Each oracle scenario must pass with `expect.threshold` **1.0** on `root_selector`.

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

## Wave 2 (S23–S67)

Governed primitives for FreeFrontend CSS 3D **Yes/Partial** coverage. Phase map: [`wave2-registry.yaml`](wave2-registry.yaml). PDCA waves: `wave-traceability`, `wave-upgrades`, `wave-controls`, `wave-surfaces-rails`, `wave-ambient`, `wave-optional`.

| Hash | Slug | Maintainer doc | Oracle |
|------|------|----------------|--------|
| `Fck` | flip-clock-counter | [effects/flip-clock-counter.md](effects/flip-clock-counter.md) | [oracles/Fck.json](oracles/Fck.json) |
| `Tlj` | tilt-js | [effects/tilt-js.md](effects/tilt-js.md) | [oracles/Tlj.json](oracles/Tlj.json) |
| `Pmg` | pro-mode-guard-toggle | [effects/pro-mode-guard-toggle.md](effects/pro-mode-guard-toggle.md) | [oracles/Pmg.json](oracles/Pmg.json) |
| `Vrk` | vertical-rocker-switch | [effects/vertical-rocker-switch.md](effects/vertical-rocker-switch.md) | [oracles/Vrk.json](oracles/Vrk.json) |
| `Bkm` | css-bookmark | [effects/css-bookmark.md](effects/css-bookmark.md) | [oracles/Bkm.json](oracles/Bkm.json) |
| `Kbd` | rgb-keyboard | [effects/rgb-keyboard.md](effects/rgb-keyboard.md) | [oracles/Kbd.json](oracles/Kbd.json) |
| `Clf` | cube-login-form | [effects/cube-login-form.md](effects/cube-login-form.md) | [oracles/Clf.json](oracles/Clf.json) |
| `Lgt` | shapes-lights-rig | [effects/shapes-lights-rig.md](effects/shapes-lights-rig.md) | [oracles/Lgt.json](oracles/Lgt.json) |
| `Crg` | ring-carousel | [effects/ring-carousel.md](effects/ring-carousel.md) | [oracles/Crg.json](oracles/Crg.json) |
| `Opg` | orbital-photo-gallery | [effects/orbital-photo-gallery.md](effects/orbital-photo-gallery.md) | [oracles/Opg.json](oracles/Opg.json) |
| `Stn` | stellar-slide-navigator | [effects/stellar-slide-navigator.md](effects/stellar-slide-navigator.md) | [oracles/Stn.json](oracles/Stn.json) |
| `Vtc` | vertical-team-carousel | [effects/vertical-team-carousel.md](effects/vertical-team-carousel.md) | [oracles/Vtc.json](oracles/Vtc.json) |
| `Bkf` | book-page-flip | [effects/book-page-flip.md](effects/book-page-flip.md) | [oracles/Bkf.json](oracles/Bkf.json) |
| `Fld` | fold-accordion | [effects/fold-accordion.md](effects/fold-accordion.md) | [oracles/Fld.json](oracles/Fld.json) |
| `Fan` | card-fan | [effects/card-fan.md](effects/card-fan.md) | [oracles/Fan.json](oracles/Fan.json) |
| `Dck` | card-deck-stack | [effects/card-deck-stack.md](effects/card-deck-stack.md) | [oracles/Dck.json](oracles/Dck.json) |
| `Vnl` | vinyl-sleeve-media | [effects/vinyl-sleeve-media.md](effects/vinyl-sleeve-media.md) | [oracles/Vnl.json](oracles/Vnl.json) |
| `Stf` | scroll-flip-strip | [effects/scroll-flip-strip.md](effects/scroll-flip-strip.md) | [oracles/Stf.json](oracles/Stf.json) |
| `Erc` | rolling-cube-404 | [effects/rolling-cube-404.md](effects/rolling-cube-404.md) | [oracles/Erc.json](oracles/Erc.json) |
| `Mph` | morph-polyhedron | [effects/morph-polyhedron.md](effects/morph-polyhedron.md) | [oracles/Mph.json](oracles/Mph.json) |
| `Tmb` | tumbling-cubes | [effects/tumbling-cubes.md](effects/tumbling-cubes.md) | [oracles/Tmb.json](oracles/Tmb.json) |
| `Hex` | hex-tunnel | [effects/hex-tunnel.md](effects/hex-tunnel.md) | [oracles/Hex.json](oracles/Hex.json) |
| `Glb` | math-globe | [effects/math-globe.md](effects/math-globe.md) | [oracles/Glb.json](oracles/Glb.json) |
| `Orb` | sphere-family | [effects/sphere-family.md](effects/sphere-family.md) | [oracles/Orb.json](oracles/Orb.json) |
| `Slp` | scroll-layer-parallax | [effects/scroll-layer-parallax.md](effects/scroll-layer-parallax.md) | [oracles/Slp.json](oracles/Slp.json) |
| `Cur` | curtain-reveal | [effects/curtain-reveal.md](effects/curtain-reveal.md) | [oracles/Cur.json](oracles/Cur.json) |
| `Twr` | tower-cubes-loader | [effects/tower-cubes-loader.md](effects/tower-cubes-loader.md) | [oracles/Twr.json](oracles/Twr.json) |
| `Ifn` | fisheye-depth-nav | [effects/fisheye-depth-nav.md](effects/fisheye-depth-nav.md) | [oracles/Ifn.json](oracles/Ifn.json) |
| `Mch` | linear-circular-motion | [effects/linear-circular-motion.md](effects/linear-circular-motion.md) | [oracles/Mch.json](oracles/Mch.json) |
| `Dot` | simplest-dots | [effects/simplest-dots.md](effects/simplest-dots.md) | [oracles/Dot.json](oracles/Dot.json) |
| `Xsc` | sphere-cube-intersection | [effects/sphere-cube-intersection.md](effects/sphere-cube-intersection.md) | [oracles/Xsc.json](oracles/Xsc.json) |
| `Bbl` | bubbly-grid | [effects/bubbly-grid.md](effects/bubbly-grid.md) | [oracles/Bbl.json](oracles/Bbl.json) |
| `Hud` | hud-space-panel | [effects/hud-space-panel.md](effects/hud-space-panel.md) | [oracles/Hud.json](oracles/Hud.json) |
| `Pry` | fractured-pyramid | [effects/fractured-pyramid.md](effects/fractured-pyramid.md) | [oracles/Pry.json](oracles/Pry.json) |
| `Dbf` | conf-data-block | [effects/conf-data-block.md](effects/conf-data-block.md) | [oracles/Dbf.json](oracles/Dbf.json) |

**v2 modes** on existing hashes (same oracle files, new scenarios): `Cbg` photo, `Srl` orbit, `Flp` stack, `Dpt` spiral, `Tun` warp, `Iso` keypad/grid, `Hol` illumination.
