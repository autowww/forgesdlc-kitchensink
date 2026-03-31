# SVG ambient background catalog

Slow, looping SVG patterns for optional Forge UI backdrops. Files live under `assets/svg/backgrounds/`. Pair with `css/ks-animated-backgrounds.css`, `js/ks-animated-backgrounds.js`, and `KsAmbientBg.init()` so `var(--forge-*)` resolves (SVG must be **inlined** from `data-ks-bg-src`, not used as `<img>` if you need live theme tokens).

## Integration

```html
<section class="ks-has-ambient-bg ks-bg-overlay--soft ks-bg-density--medium">
  <div class="ks-ambient-bg ks-bg--dots-drift-01" data-ks-bg-src="assets/svg/backgrounds/dots/bg-dots-drift-01.svg" aria-hidden="true"></div>
  <div class="ks-ambient-bg-overlay" aria-hidden="true"></div>
  <div class="ks-content">…</div>
</section>
```

**Overlay:** `.ks-bg-overlay--none|soft|medium|strong` on the same section (or gallery root). **Density:** `.ks-bg-density--low|medium|high`. **Suppress:** `.ks-bg-suppressed` hides the ambient layer.

## Previewing the gallery locally

1. From the `forgesdlc-kitchensink` repo root, run `python3 generator/build-showcase.py`.
2. Start a static server with **`showcase/` as the document root**, e.g. `cd showcase && python3 -m http.server 8080`.
3. Open `http://127.0.0.1:8080/svg-backgrounds.html` (not a copy of the HTML alone from another folder — `assets/*.css` and inlined `<svg>` in the generated file must match this build).

The generated page begins with an HTML comment `<!-- kitchensink svg-backgrounds gallery build … -->` (UTC timestamp) so you can tell if the file is stale.

## Kitchensink showcase mapping

| Showcase page | Slug | Suggested backgrounds |
|---------------|------|-------------------------|
| Tokens | `tokens` | dots-drift, dots-field, stars-sparse, contour-depth |
| Surfaces / glass / cards | `surfaces` | neurons-synapse, dots-cluster, orbit-minimal, lattice-flow |
| Controls (buttons, badges, callouts, code) | `controls` | pulse-ring, dots-drift, dots-pulse, signal-trace, sine-interference, fourier-forge-spectral, grid-shift |
| Navigation | `navigation` | lattice-flow, neurons-pulsegraph, sine-layered |
| Diagrams | `diagrams` | contour-depth, stars-sparse, neurons-softmesh |
| Motion | `motion` | (see SVG ambient backgrounds page) |
| Layouts | `layouts` | contour-flow, stars-parallax, topology-soft |
| For agents | `for-agents` | grid-pulse, signal-trace (subtle) |
| Home / hero | `index` | neurons-softmesh, contour-flow, stars-parallax |

Typography-heavy bands: **sine-layered**, **signal-trace**, **contour-flow**. Tables / data: **grid-pulse**, **grid-shift**, **signal-trace**.

---

## Dots

### bg-dots-drift-01

| Field | Value |
|-------|--------|
| **Motif** | Drifting sparse dots |
| **Usage** | Buttons demo, badges, callouts, card surfaces |
| **Motion** | Slow position drift (SMIL), 42–90s feel |
| **Density** | Low |
| **Theme** | Uses `--forge-text-3`, `--forge-cyan` accents |
| **Overlay** | soft–medium on text |
| **Performance** | ~14 circles, no filters — **light** |

### bg-dots-cluster-01

| Field | Value |
|-------|--------|
| **Motif** | Soft clusters |
| **Usage** | Glass panels, small cards |
| **Motion** | Cluster translate (SMIL) |
| **Density** | Low–medium |
| **Overlay** | soft |
| **Performance** | ~11 nodes — **light** |

### bg-dots-field-01

| Field | Value |
|-------|--------|
| **Motif** | Irregular field |
| **Usage** | Section bands, wide areas |
| **Motion** | Subset drift |
| **Density** | Low |
| **Performance** | 25 static dots + 5 animated — **light** |

### bg-dots-pulse-01

| Field | Value |
|-------|--------|
| **Motif** | Breathing dots |
| **Usage** | Cards, compact controls |
| **Motion** | Opacity + radius (SMIL), ~28–45s |
| **Density** | Low |
| **Performance** | 7 circles — **light** |

## Neurons

### bg-neurons-softmesh-01

| Field | Value |
|-------|--------|
| **Motif** | Delicate mesh |
| **Usage** | Hero, section headers |
| **Motion** | Node opacity breathe |
| **Density** | Low |
| **Performance** | Lines + ~14 nodes — **light** |

### bg-neurons-pulsegraph-01

| Field | Value |
|-------|--------|
| **Motif** | Graph with dash pulse |
| **Usage** | Flow / nav sections |
| **Motion** | `stroke-dashoffset` (SMIL) |
| **Density** | Low |
| **Performance** | Moderate line count — **light** |

### bg-neurons-synapse-01

| Field | Value |
|-------|--------|
| **Motif** | Curved links |
| **Usage** | Glass, cards |
| **Motion** | Node radius breathe |
| **Density** | Low |
| **Performance** | **light** |

### bg-neurons-cluster-01

| Field | Value |
|-------|--------|
| **Motif** | Tight cluster |
| **Usage** | Small crops, stat tiles |
| **Motion** | Subtle opacity |
| **Density** | Medium in center |
| **Performance** | **light** |

## Sinusoids & signals

### bg-sine-layered-01

| Field | Value |
|-------|--------|
| **Motif** | Layered waves |
| **Usage** | Headings, typography bands |
| **Motion** | Horizontal translate (SMIL) |
| **Performance** | 3 paths — **light** |

### bg-sine-ribbon-01

| Field | Value |
|-------|--------|
| **Motif** | Ribbon curves |
| **Usage** | Wide sections |
| **Motion** | Slow translate |
| **Performance** | **light** |

### bg-sine-interference-01

| Field | Value |
|-------|--------|
| **Motif** | Two-phase waves |
| **Usage** | Code blocks, diagrams |
| **Motion** | Opposing drift |
| **Performance** | **light** |

### bg-fourier-forge-spectral-01

| Field | Value |
|-------|--------|
| **Motif** | Fourier harmonic stacks → FORGE mask |
| **Usage** | Hero, brand moments, playful tech |
| **Motion** | Backdrop drift + masked band shear |
| **Performance** | **medium** (many short polylines) |

### bg-fourier-forge-spectral-animated-01

| Field | Value |
|-------|--------|
| **Motif** | Same as static |
| **Usage** | When you want obvious slow life in the lettering |
| **Motion** | Per-row horizontal loops (staggered) + global horizontal + vertical SMIL |
| **Performance** | **medium–heavy** (many polylines × SMIL) |

### bg-signal-trace-01

| Field | Value |
|-------|--------|
| **Motif** | Trace + sweep |
| **Usage** | Tables, code, data |
| **Motion** | Dash sweep |
| **Density** | Low |
| **Performance** | **light** |

## Stars

### bg-stars-parallax-01

| Field | Value |
|-------|--------|
| **Motif** | Layered depth |
| **Usage** | Hero, footer |
| **Motion** | Layer translate + soft twinkle |
| **Performance** | **light** |

### bg-stars-drift-01

| Field | Value |
|-------|--------|
| **Motif** | Field drift |
| **Usage** | Transition sections |
| **Motion** | Whole-field translate 180s |
| **Performance** | **light** |

### bg-stars-sparse-01

| Field | Value |
|-------|--------|
| **Motif** | Minimal + faint ring |
| **Usage** | Modals, previews |
| **Motion** | Twinkle |
| **Performance** | **light** |

## Grids & lattice

### bg-grid-pulse-01

| Field | Value |
|-------|--------|
| **Motif** | Grid + cell pulse |
| **Usage** | Tables, charts |
| **Motion** | Rect opacity |
| **Performance** | **light** |

### bg-grid-shift-01

| Field | Value |
|-------|--------|
| **Motif** | Moving grid |
| **Usage** | Structured UI |
| **Motion** | Translate 72s loop |
| **Performance** | Many lines — **moderate** |

### bg-lattice-flow-01

| Field | Value |
|-------|--------|
| **Motif** | Diagonal lattice |
| **Usage** | Nav, cards |
| **Motion** | Translate |
| **Performance** | **moderate** |

### bg-hex-drift-01

| Field | Value |
|-------|--------|
| **Motif** | Sparse hex |
| **Usage** | Sections |
| **Motion** | Group drift |
| **Performance** | **light** |

## Contours

### bg-contour-flow-01

| Field | Value |
|-------|--------|
| **Motif** | Flowing contours |
| **Usage** | Hero, narrative |
| **Motion** | Vertical sway |
| **Performance** | **light** |

### bg-contour-depth-01

| Field | Value |
|-------|--------|
| **Motif** | Nested ellipses |
| **Usage** | Gallery, wide |
| **Motion** | Axis breathe |
| **Performance** | **light** |

### bg-topology-soft-01

| Field | Value |
|-------|--------|
| **Motif** | Gradient + paths |
| **Usage** | Hero, large sections |
| **Motion** | Gradient stop + path drift |
| **Performance** | Gradient animate — **moderate** |

## Orbits & accents

### bg-orbit-minimal-01

| Field | Value |
|-------|--------|
| **Motif** | Ring + dot |
| **Usage** | Compact, badges |
| **Motion** | Rotate 120s |
| **Performance** | **light** |

### bg-orbit-node-01

| Field | Value |
|-------|--------|
| **Motif** | Dashed orbit + hub |
| **Usage** | Cards, stats |
| **Motion** | Rotate |
| **Performance** | **light** |

### bg-signal-beacon-01

| Field | Value |
|-------|--------|
| **Motif** | Radial pulse |
| **Usage** | Callouts |
| **Motion** | r + opacity |
| **Performance** | **light** |

### bg-pulse-ring-01

| Field | Value |
|-------|--------|
| **Motif** | Expanding rings |
| **Usage** | Buttons, badges (not spinners) |
| **Motion** | r / opacity loop |
| **Performance** | **light** |

---

## Preview

Open **`svg-backgrounds.html`** from the built **`showcase/`** tree (see **Previewing the gallery locally** above). The gallery **inlines** each SVG (uniquified `id`s per cell); other pages can use `data-ks-bg-src` + `KsAmbientBg.init()`. Sidebar: Patterns → SVG ambient backgrounds.
