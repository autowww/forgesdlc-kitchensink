# N03+ — Component phase template

Use this prompt for **component phases N03–S22**. The orchestrator injects phase-specific metadata (`PHASE`, hash, slug, title) into the agent prompt at runtime.

## Placeholders (filled by pdca-run-phase.sh)

| Field | Example (N05) |
|-------|----------------|
| `PHASE` | N05 |
| `title` | Holographic interactive card |
| `hash` | Hol |
| `slug` | holo-card |
| `kind` | component |

## Goal

Ship one nav-layout primitive end-to-end: Python emitter, CSS/JS, design contract, maintainer doc, JSON oracle, showcase demo section, and passing verifier gate for this hash only.

## Files to touch

| Area | Paths |
|------|-------|
| Emitter | `components/nav-layout.py` — `render_*` for this effect |
| Styles | `css/ks-nav-layout.css` (and `forge-theme.css` only when migrating shared tilt rules) |
| Scripts | `js/ks-nav-shared.js`, `js/ks-nav-layout-*.js` as needed |
| Maintainer doc | `docs/design/nav-layout/effects/<slug>.md` |
| Oracle | `docs/design/nav-layout/oracles/<HASH>.json` |
| Contract | `docs/design/catalog/components/<HASH>-<slug>.md` |
| Registry | `docs/design/catalog/visual-registry.yaml` (row must match hash) |
| Showcase | `generator/pages/nav-layout-effects.py` — live demo + expected-behavior callout |
| DET rules | `docs/design/ux-audit/rule-pages/DET.SPATIAL.<HASH>.*.md` when repeatable |

## Acceptance criteria

- `[data-ks-hash="<HASH>"]` present in built `showcase/nav-layout-effects.html`
- Maintainer doc scenario IDs match oracle JSON
- Design contract covers states: default, hover/focus, active, `prefers-reduced-motion`, `@supports` fallback
- `./scripts/ks-nav-layout-pdca/check-phase-gate.sh <PHASE>` is GREEN
- `npm test -- --hash <HASH>` in `tools/nav-layout-effects-verifier/` passes

## Check commands

```bash
./scripts/ks-nav-layout-pdca/pdca-run-phase.sh <PHASE> check
```

Optional LCDL parity (when evaluate task is installed):

```bash
python -m forge_lcdl.run_task ks_nav-layout_effect_evaluate_v1 \
  --input scripts/ks-nav-layout-pdca/runs/<PHASE>/evaluate-input.json
```

## Rollback

Revert the single-phase commit; remove registry row, contract, oracle, and showcase section for this hash.

## Governance

- **No Fleet-specific UX auditor profile.**
- One commit per phase in `forgesdlc-kitchensink` only.
- Do not expand scope to unrelated effects or consumer submodule bumps (optional S23 release gate is manual).
- Propose a candidate deterministic `DET.SPATIAL.*` rule when a failure pattern is repeatable.

## Phase map (reference)

| Phase | Effect | Hash | Slug |
|-------|--------|------|------|
| N03 | Flip / reveal card | Flp | flip-card |
| N04 | CSS-only pointer tilt zones | Tlz | tilt-css |
| N05 | Holographic interactive card | Hol | holo-card |
| N06 | 3D zig-zag section divider | Zzg | zigzag-divider |
| N07 | Volumetric display typography | Dpt | display-depth |
| N08 | Cube-glow CTA button | Cgb | cube-glow-button |
| N09 | Volumetric toggle switch | Vsw | volumetric-switch |
| S10 | Tactile range slider | Rng | tactile-range |
| S11 | Flip choice control | Fch | flip-choice |
| S12 | Holographic badge | Hbd | holo-badge |
| S13 | Inner-frame media parallax | Mpx | media-parallax |
| S14 | 6-face cube media gallery | Cbg | cube-gallery |
| S15 | Draggable cube + face lighting | Dcb | draggable-cube |
| S16 | Warp tunnel hero ambient | Tun | tunnel-ambient |
| S17 | Perspective section staging | Pst | perspective-stage |
| S18 | Isometric elevated tile | Iso | isometric-tile |
| S19 | Scroll-linked floating headers | Flh | floating-header |
| S20 | `@property` depth dial / metrics | Dil | depth-dial |
| S21 | Neumorphic tactile switch variant | Nsw | neumorphic-switch |
| S22 | Nav-layout presentation rail (coverflow) | Srl | nav-layout-rail |
