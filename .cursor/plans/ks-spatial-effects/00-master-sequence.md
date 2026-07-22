# 00 — Master sequence (KS spatial effects)

Governed spatial-effects campaign for **forgesdlc-kitchensink**: architecture foundation, dual-wiki corpus, Playwright oracle verification, Wave 1 primitives (S03–S22), and Wave 2 FreeFrontend Yes/Partial expansion (S23–S67).

**Orchestration:** `scripts/ks-spatial-pdca/`  
**Prompts:** `docs/prompts/ks-spatial-pdca/`  
**Handbook surface:** KS showcase only (`generator/pages/spatial-effects.py` → `showcase/spatial-effects.html`)

Do **not** edit the attached Cursor plan file; this master sequence is the operator-facing phase index.

## Goal

| Criterion | Evidence |
|-----------|----------|
| 20 spatial primitives shipped | Registry rows + hash markers in showcase HTML |
| Wave 2 FF Yes/Partial | S23 traceability + S24–S67 primitives/modes ([`freefrontend-traceability.md`](../../../docs/design/spatial/freefrontend-traceability.md)) |
| Dual-wiki parity | Maintainer spec + design contract + showcase section per effect |
| Actual vs expected | Oracle JSON + `tools/spatial-effects-verifier/` + optional LCDL evaluate task |
| PDCA orchestration | `pdca-orchestrate.sh` runs S00→S22 with gate files |
| Drift prevention | `check-phase-gate.sh` + `check-oracle-doc-sync.mjs` |

## Execution order

```text
S00 (css/js foundation)
  → S01 (docs + showcase hub + hash allocation)
    → S02 (verifier + DET bootstrap + tilt golden path)
      → S03…S22 (one component per phase)
        → S23 (traceability) → S24…S67 (Wave 2)
```

**Extra dependencies** (see `scripts/ks-spatial-pdca/SEQUENCE.yaml`):

- S13–S15, S22 also depend on S00 (pointer / presentation touchpoints)
- S19 depends on S07
- S21 depends on S09
- S24 depends on S14; S25/S43/S44 depend on S22; S28 on S16; S27 on S07; S29–S30 on S18; S31 on S05; S40 before S31 showcase refresh; S57 on S17 + S19

Consumer propagation (`sync-kitchensink-and-rebuild.sh`) is **out of scope** per phase; optional manual release after S22 GREEN.

## Wave 2 index (S23–S67)

| Wave | Phases | Content |
|------|--------|---------|
| traceability | S23 | FF matrix, `wave2-registry.yaml`, hash allocation |
| upgrades | S24–S32 | v2 modes on `Cbg`, `Srl`, `Flp`, `Dpt`, `Tun`, `Iso`, `Hol`; `Fck` flip clock |
| controls | S33–S40 | `Tlj`, `Pmg`, `Vrk`, `Bkm`, `Kbd`, `Clf`, `Lgt` (S37 skip = duplicate `Fck`) |
| surfaces-rails | S41–S50 | `Crg`, `Opg`, `Stn`, `Vtc`, `Bkf`, `Fld`, `Fan`, `Dck`, `Vnl`, `Stf` |
| ambient | S51–S60 | `Erc`, `Mph`, `Tmb`, `Hex`, `Glb`, `Orb`, `Slp`, `Cur`, `Twr`, `Ifn` |
| optional | S61–S67 | `Mch`, `Dot`, `Xsc`, `Bbl`, `Hud`, `Pry`, `Dbf` |

Hash note: `Fcc` / `C3r` / `Err` were renamed to **`Fck`**, **`Crg`**, **`Erc`** (three distinct letters required by `ks_hash_attrs`).

## Phase index

### Foundation (wave-foundation)

| Phase | Title | Stop condition |
|-------|-------|----------------|
| **S00** | Architecture spike | `ks-spatial.css`, `ks-pointer-depth.js`, tilt refactor, fallbacks wired |
| **S01** | Dual-wiki spike | `docs/design/spatial/` tree, registry hashes, showcase hub |
| **S02** | Test harness spike | `tools/spatial-effects-verifier/`, tilt golden oracle, DET.SPATIAL bootstrap |

### Components (wave-components)

| Phase | Effect | Hash | Slug |
|-------|--------|------|------|
| **S03** | Flip / reveal card | Flp | flip-card |
| **S04** | CSS-only pointer tilt zones | Tlz | tilt-css |
| **S05** | Holographic interactive card | Hol | holo-card |
| **S06** | 3D zig-zag section divider | Zzg | zigzag-divider |
| **S07** | Volumetric display typography | Dpt | display-depth |
| **S08** | Cube-glow CTA button | Cgb | cube-glow-button |
| **S09** | Volumetric toggle switch | Vsw | volumetric-switch |
| **S10** | Tactile range slider | Rng | tactile-range |
| **S11** | Flip choice control | Fch | flip-choice |
| **S12** | Holographic badge | Hbd | holo-badge |
| **S13** | Inner-frame media parallax | Mpx | media-parallax |
| **S14** | 6-face cube media gallery | Cbg | cube-gallery |
| **S15** | Draggable cube + face lighting | Dcb | draggable-cube |
| **S16** | Warp tunnel hero ambient | Tun | tunnel-ambient |
| **S17** | Perspective section staging | Pst | perspective-stage |
| **S18** | Isometric elevated tile | Iso | isometric-tile |
| **S19** | Scroll-linked floating headers | Flh | floating-header |
| **S20** | `@property` depth dial / metrics | Dil | depth-dial |
| **S21** | Neumorphic tactile switch variant | Nsw | neumorphic-switch |
| **S22** | Spatial presentation rail (coverflow) | Srl | spatial-rail |

## Per-phase PDCA ritual

1. **Plan** — `./scripts/ks-spatial-pdca/pdca-run-phase.sh <PHASE> plan`
2. **Approve** — operator reviews `runs/<PHASE>/latest/plan.md`, then `approve`
3. **Do** — implement phase deliverables
4. **Check** — `./scripts/ks-spatial-pdca/pdca-run-phase.sh <PHASE> check`
5. **Act** — remediate until GREEN (max `KS_SPATIAL_PDCA_MAX_ACT`, default 3)

## Wave commands

```bash
cd forgesdlc-kitchensink
./scripts/ks-spatial-pdca/pdca-orchestrate.sh wave-foundation   # S00–S02
./scripts/ks-spatial-pdca/pdca-orchestrate.sh wave-components   # S03–S22
./scripts/ks-spatial-pdca/pdca-orchestrate.sh wave-traceability # S23
./scripts/ks-spatial-pdca/pdca-orchestrate.sh wave-upgrades       # S24–S32
./scripts/ks-spatial-pdca/pdca-orchestrate.sh wave-controls     # S33–S40
./scripts/ks-spatial-pdca/pdca-orchestrate.sh wave-surfaces-rails
./scripts/ks-spatial-pdca/pdca-orchestrate.sh wave-ambient      # S51–S60
./scripts/ks-spatial-pdca/pdca-orchestrate.sh wave-optional     # S61–S67
./scripts/ks-spatial-pdca/pdca-orchestrate.sh wave2-all         # S23–S67
./scripts/ks-spatial-pdca/pdca-run-phase.sh S05 check           # single phase
```

## Validation commands (every Check)

```bash
python3 generator/build-showcase.py
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase
cd tools/spatial-effects-verifier && npm test -- --hash <HASH>   # S02+ / component phases
```

## Governance (non-negotiable)

- **No Fleet-specific UX auditor profile** — Fleet may appear only as a generic regression fixture.
- `analyze-website-ux.mjs` and `score-website-ux.mjs` must **not** call each other.
- Spatial verifier is a **third** toolchain (may share Playwright import patterns only).
- One commit per phase in `forgesdlc-kitchensink`; LCDL evaluate schema changes commit separately in `forge-lcdl`.

## Per-phase checklist template

- **Goal:** one sentence.
- **Files to inspect:** key paths from prompt pack.
- **Expected changes:** artifacts and code.
- **Validation:** `check-phase-gate.sh` + hash-scoped verifier tests.
- **Risks:** oracle drift, reduced-motion, coarse pointer.
- **Stop condition:** gate GREEN + ledger entry.
- **Rollback:** revert single-phase commit.
