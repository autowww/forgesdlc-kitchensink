# Forge Enterprise UI — design guide (Kitchen Sink)

This document describes **selectable Forge SDLC product theme packs** (`fs_pack`), the **enterprise** visual direction, how packs are chosen at build time, and how **Lenses Enterprise** (Electron) relates to the same tokens.

**Related:** **[Forge enterprise AI website standard](forge-enterprise-ai-website-standard.md)** — copy, information architecture, landing anatomy, homepage shell vs handbook chrome, first-screen budgets, product-story contract, screenshot acceptance, and trust messaging for public Forge product sites (complements this tokens and visual guide). Historical **[v2 addendum stub](forge-enterprise-ai-website-standard-v2-addendum.md)** links into the same canonical sections.

## Principles

1. **Trust over spectacle** — Operational, calm surfaces; accents are deliberate.
2. **Hierarchy over density** — Title → status/summary → primary action scan order.
3. **Solid surfaces over glass by default** (enterprise pack) — Matte panels, quiet borders.
4. **Accent colors as signals** — Amber: primary action / authority. Cyan: data / system info. Emerald/red: status only.
5. **Metadata in rows** — Prefer compact stat rows over scattered pills where the layout pack allows.
6. **Technical detail behind disclosure** — Advanced fields optional in expand/collapse patterns.
7. **Motion for feedback** — Not ambient pulse/breathe on routine chrome (enterprise).

## Theme packs (`data-fs-pack`)

| Pack id | Name | Intent |
|---------|------|--------|
| *(omit or `default`)* | Default / Product | Current shipped forgesdlc.com look — baseline for regression tests. |
| `enterprise` | Enterprise / Control plane | Matte solids, restrained motion, metadata-friendly chrome. |
| `showcase` | Showcase / Launch | More glass/glow energy for demos; same token family. |
| `focus` | Focus / Reader | Calmer chrome, reading-oriented spacing (stubs may be minimal). |
| `contrast` | Contrast / A11y-first | Stronger borders and focus affordances. |
| `minimal` | Minimal / Dev-docs | Flatter, denser product chrome. |

Packs are implemented as **additive CSS files** in Kitchen Sink: `css/forgesdlc-pack-<id>.css`, scoped under `html[data-fs-pack="<id>"]` so the default build (no attribute, no extra stylesheet) stays unchanged.

## How to select a pack (forgesdlc.com)

1. **Site config:** In `forgesdlc/generator/content-map.yaml`, set top-level `fs_pack` to one of the ids above (e.g. `enterprise`). Omit or use `default` for the current look.
2. **CLI override:** `python3 generator/build-site.py --fs-pack enterprise` overrides the YAML value for that run.
3. **Emitted HTML:** Non-default packs set `data-fs-pack="<id>"` on `<html>` and add `<link rel="stylesheet" href="assets/forgesdlc-pack-<id>.css" />` after the base themes.

## Dynamic UI split

| Surface | Approach |
|---------|----------|
| **forgesdlc.com** | Mostly static HTML; optional **Alpine.js**-style islands later, gated to enterprise-only roots if introduced. |
| **forge-lenses — Lenses Studio** | **Electron-first** desktop app: **React/Vite** SPA at **`/studio/`**, **preload** OS bridges, Python **`/api/…`**. Canonical architecture, tokens, and KS reuse are documented in **[Lenses Studio shell](lenses-studio-shell.md)** (window contract, `/__ks/` loading, what lives in KS vs `lenses-enterprise/`). See also `forge-lenses/docs/adr-001-lenses-studio-shell.md`. |
| **Heavy tables / SPA** | Not embedded in Python string templates; lives in the Electron renderer (React per ADR). |

## Layout and shells

- **Product pages** use Kitchen Sink `product_page` (`fs-*` classes, `forgesdlc-theme.css`).
- **Handbook/showcase** layouts are unchanged by `fs_pack`; packs target the product site shell.

## Implementation appendix

| Area | Reused from Forge | Toned down in `enterprise` pack |
|------|---------------------|----------------------------------|
| Tokens (`--fs-*`, forge-theme) | Yes | — |
| `product_page`, `.btn-forge`, tables | Yes | — |
| `stat_row` / `card_grid` markup | Same bindings; class branches via `fs_pack` | Glass/breathe defaults reduced when pack requests it |
| Topic preview modal | `render_topic_preview_trigger` + `forge-theme.js` | Optional BEM modifier class for calmer card chrome |

## Implementation notes (workspace)

- **Pack CSS** lives in `forgesdlc-kitchensink/css/forgesdlc-pack-<id>.css` and is copied to `forgesdlc.com/website/assets/` by `sync_product_site_assets`.
- **Generator:** `forgesdlc/generator/fs_pack.py`, `content-map.yaml` key `fs_pack`, CLI `--fs-pack`.
- **Layouts:** `product_page` / `landing_page` accept `fs_pack` → `data-fs-pack` on `<html>`.
- **`ks_compose`:** Calm packs (`enterprise`, `minimal`, `focus`, `contrast`) use `fs-pack-stat-cell` and `fs-pack-card` classes; default/showcase keep glass/breathe.
- **Topic preview:** `fs-topic-preview-card--pack` modifier when `fs_pack=enterprise`.
- **Optional Alpine.js** for static marketing islands: load only under `data-fs-pack="enterprise"` if introduced later; not required for pack v1.
- **Lenses Studio (Electron):** `forge-lenses` serves **`/studio/`** from `lenses/static/studio/`; set **`LENSES_STUDIO_UI=1`** for the desktop shell (legacy `LENSES_ENTERPRISE_UI=1` accepted). See **[Lenses Studio shell](lenses-studio-shell.md)** and `forge-lenses/docs/adr-001-lenses-studio-shell.md`.
