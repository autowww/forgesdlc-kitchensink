# Nav-layout effects subsystem

Governed navigation, layout-shell, overlay, and wayfinding primitives for Kitchen Sink showcase and consumer sites.

## Dual-wiki layout

| Layer | Path | Audience |
|-------|------|----------|
| Maintainer specs | [`effects/`](effects/) | Humans — behavior, anatomy, accessibility |
| Machine oracles | [`oracles/`](oracles/) | Playwright / LCDL `ks_nav_layout_effect_evaluate_v1` |
| Design contracts | [`../catalog/components/`](../catalog/components/) | Visual catalog hash governance |

## Showcase

Live demos span showcase pages **Navigation**, **Controls**, **Layout shells**, **Overlays & transitions**, and **Presentation** (`generator/pages/`).

Emitters: `components/nav_layout.py` · Styles: `css/ks-nav-layout.css` · Scripts: `js/ks-nav-layout.js`.

## Verification

1. Build showcase (`python3 generator/build-showcase.py`).
2. Run nav-layout verifier (`tools/nav-layout-effects-verifier/`) against oracle JSON.
3. Each oracle scenario must pass with `expect.threshold` **1.0** on `root_selector`.

See [ORACLE-SCHEMA.md](ORACLE-SCHEMA.md) for JSON field definitions.

## Effect index

| Hash | Slug | Maintainer doc | Oracle |
|------|------|----------------|--------|
| `Ssd` | sticky-section-dock | [effects/sticky-section-dock.md](effects/sticky-section-dock.md) | [oracles/Ssd.json](oracles/Ssd.json) |
| `Stc` | scroll-spy-toc | [effects/scroll-spy-toc.md](effects/scroll-spy-toc.md) | [oracles/Stc.json](oracles/Stc.json) |
| `Cpb` | chapter-progress | [effects/chapter-progress.md](effects/chapter-progress.md) | [oracles/Cpb.json](oracles/Cpb.json) |
| `Bdt` | breadcrumb-depth | [effects/breadcrumb-depth.md](effects/breadcrumb-depth.md) | [oracles/Bdt.json](oracles/Bdt.json) |
| `Mns` | mobile-nav-sheet | [effects/mobile-nav-sheet.md](effects/mobile-nav-sheet.md) | [oracles/Mns.json](oracles/Mns.json) |
| `Mmg` | mega-menu | [effects/mega-menu.md](effects/mega-menu.md) | [oracles/Mmg.json](oracles/Mmg.json) |
| `Svc` | segmented-control | [effects/segmented-control.md](effects/segmented-control.md) | [oracles/Svc.json](oracles/Svc.json) |
| `Swz` | stepper-wizard | [effects/stepper-wizard.md](effects/stepper-wizard.md) | [oracles/Swz.json](oracles/Swz.json) |
| `Pgt` | pagination-tactile | [effects/pagination-tactile.md](effects/pagination-tactile.md) | [oracles/Pgt.json](oracles/Pgt.json) |
| `Fcs` | filter-chip-scroller | [effects/filter-chip-scroller.md](effects/filter-chip-scroller.md) | [oracles/Fcs.json](oracles/Fcs.json) |
| `Gcb` | governed-combobox | [effects/governed-combobox.md](effects/governed-combobox.md) | [oracles/Gcb.json](oracles/Gcb.json) |
| `Dst` | disclosure-stack | [effects/disclosure-stack.md](effects/disclosure-stack.md) | [oracles/Dst.json](oracles/Dst.json) |
| `Spr` | split-pane-resizer | [effects/split-pane-resizer.md](effects/split-pane-resizer.md) | [oracles/Spr.json](oracles/Spr.json) |
| `Ajm` | anchor-jump-menu | [effects/anchor-jump-menu.md](effects/anchor-jump-menu.md) | [oracles/Ajm.json](oracles/Ajm.json) |
| `Tsw` | tab-swimlane-sync | [effects/tab-swimlane-sync.md](effects/tab-swimlane-sync.md) | [oracles/Tsw.json](oracles/Tsw.json) |
| `Sab` | sticky-action-bar | [effects/sticky-action-bar.md](effects/sticky-action-bar.md) | [oracles/Sab.json](oracles/Sab.json) |
| `Cps` | command-palette | [effects/command-palette.md](effects/command-palette.md) | [oracles/Cps.json](oracles/Cps.json) |
| `Bsc` | bottom-sheet | [effects/bottom-sheet.md](effects/bottom-sheet.md) | [oracles/Bsc.json](oracles/Bsc.json) |
| `Vth` | view-transition-hero | [effects/view-transition-hero.md](effects/view-transition-hero.md) | [oracles/Vth.json](oracles/Vth.json) |
| `Epr` | editorial-peek-rail | [effects/editorial-peek-rail.md](effects/editorial-peek-rail.md) | [oracles/Epr.json](oracles/Epr.json) |
