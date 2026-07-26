# Handbook enterprise uplift — implementation plan

**Status:** draft plan (2026-07-02)  
**Scope:** Kitchen Sink (`forgesdlc-kitchensink`) + handbook consumers (Blueprints, Fleet/LCDL/Lenses/Platform handbooks, forgesdlc tutorials)  
**Goal:** Handbook/reference pages feel **calm, governed, and enterprise-grade** — not a generated doc tree with cramped chrome.

**Success looks like (1440px desktop, Autonomy levels as reference page):**

1. Visible **Kbc** breadcrumb + clear page title + short lede + metadata row before dense prose.
2. Sidebar and ToC type **proportional to body** (nav links ≥ ~90% of body size at xl).
3. Policy/reference tables readable at normal density (no default `table-sm`).
4. Content block fills `main` beside ToC (no trailing dead gutter).
5. Chrome hierarchy: optional product top band → breadcrumb → document header → prose (sidebar/ToC subordinate).
6. Passes `DET.NAV.BREADCRUMB`, `DET.LAYOUT.GRID_CONSISTENCY`, and targeted UX auditor AI cues for hierarchy/credibility.

**Prerequisite (done):** Wide-screen layout pass — `ks-handbook-shell`, full-width `ks-doc-toc-flow`, `--ks-nav-*` tokens (KS `de187a2`+).

---

## Architecture (target chrome stack)

```
[Optional Kpn — ks-handbook-topnav]     ← curated product/docs IA (Fleet pattern generalized)
[Optional portal/ecosystem strip]     ← Blueprints inject-portal-nav OR folded into Kpn
┌─────────────┬──────────────────────────────────────────────┐
│ Ksr sidebar │ main                                            │
│             │  Kbc breadcrumb                                 │
│             │  Document header (title, lede, meta row)      │
│             │  ┌──────────────────────┬─────────────────┐  │
│             │  │ prose (1fr)          │ Ktx ToC rail    │  │
│             │  └──────────────────────┴─────────────────┘  │
│             │  prev/next + Ksf footer                       │
└─────────────┴──────────────────────────────────────────────┘
```

**Source of truth:** implement primitives in **KS**; wire via **forge-autodoc** `assemble_handbook_page`; consume through submodule bump + rebuild per site.

---

## Phase 1 — Orientation & document header (highest ROI)

**Outcome:** Every deep handbook page answers “where am I?” and “what is this?” in the first screen.

### 1.1 Kbc breadcrumbs in `handbook_page`

| Item | Detail |
|------|--------|
| **KS** | Add `breadcrumb_html: str = ""` to `handbook_page()` in `components/layouts.py`; render above `<header>` inside `.doc-content` using existing `render_breadcrumbs()` from `components/components.py` (Kbc markers). |
| **forge-autodoc** | Add `breadcrumb_items: list[tuple[str \| None, str]] \| None` to `assemble_handbook_page()` in `forge_autodoc/page.py`; call `render_breadcrumbs()` when ≥2 items. |
| **Blueprints** | In `blueprints-website/generator/build-handbook.py`, build crumbs for **all** page kinds (not only `compact` rail); pass into `build_page` / `assemble_handbook_page`. Reuse crumb tuples already built for JSON-LD (`crumb_ld`). |
| **Private handbooks** | Fleet already uses `build_breadcrumb_html()` in `fleet_site_nav.py` via `top_shell_html` — migrate to shared Kbc emission or wrap Fleet output with Kbc markers for catalog consistency. |
| **Tests** | Extend `forge-autodoc/tests/test_handbook_layout.py`: assert `ks-doc-breadcrumb`, `data-ks-hash="Kbc"`. |
| **Audit** | `DET.NAV.BREADCRUMB` should pass on Autonomy levels after rebuild. |

**Acceptance:** Autonomy levels shows `Handbook → Software delivery → Forge → Autonomy levels` (or equivalent) above H1; keyboard-focusable crumb links.

### 1.2 Document header v2 (`ks-doc-header`)

| Item | Detail |
|------|--------|
| **KS** | New helper `render_handbook_doc_header()` in `components/components.py` (or section in `layouts.py`): `page_title`, `lede`, optional `section_label`, `metadata_html` slot. |
| **CSS** | Tokens: `--ks-doc-title`, `--ks-doc-lede`, `--ks-doc-meta-size` in `css/forge-theme.css` + `docs-theme.css`. Lede uses body scale, not `forge-support` gray-only. |
| **Metadata row** | Emit from generator: **Last updated** (existing footer date → header), **Page type** badge (Policy / Guide / Reference), **Canonical** link (GitHub MD or Platform hub). |
| **Blueprints** | Map YAML frontmatter keys: `page_type`, `policy_status`, `platform_hub_url` (optional); default `page_type: guide`. |
| **Hbk contract** | Update `docs/design/catalog/layouts/Hbk-layout-handbook.md` anatomy + first-screen requirements. |

**Acceptance:** First screen at 1440×900 shows breadcrumb + title + one-line lede + metadata row without scrolling past primary H2.

### 1.3 Unify top chrome (spike → implement)

| Item | Detail |
|------|--------|
| **Spike** | Compare three patterns: Blueprints `#bp-portal-nav` (inject), Fleet `fleet-handbook-topnav` (`forge_autodoc/fleet_site_nav.py`), showcase `site-header`. |
| **Target** | Generalize to **`ks-handbook-topnav`** in KS (CSS + optional Python emitter); class prefix `ks-handbook-topnav` (keep Fleet as alias during migration). |
| **Blueprints** | Replace post-build `inject-portal-nav.py` with `top_shell_html` from generator OR style injected bar to match `ks-handbook-topnav` tokens. |
| **Decision gate** | One top band per handbook site; no duplicate 44px + 48px stacked bars with mismatched fonts. |

**Acceptance:** Blueprints handbook has single curated top band; sidebar sticky offset accounts for topnav height.

---

## Phase 2 — Typography & table density

**Outcome:** Reading and scanning feel intentional on large monitors.

### 2.1 Handbook type ramp (tokens)

Extend `docs/design/themes/default/tokens.json` and `:root`:

| Token | Default | ≥1200px | ≥1400px |
|-------|---------|---------|---------|
| `--ks-doc-title` | clamp(1.75rem, 4vw, 2.25rem) | — | — |
| `--ks-doc-h2` | 1.35rem | 1.4rem | 1.5rem |
| `--ks-doc-h3` | 1.1rem | 1.15rem | 1.2rem |
| `--ks-table-head` | 0.8125rem | 0.875rem | 0.9375rem |
| `--ks-table-cell` | 0.9375rem | 1rem | 1.0625rem |

Apply in `.ks-handbook-shell` / `.ks-doc-toc-prose` only (avoid marketing regressions).

### 2.2 Enterprise handbook tables

| Item | Detail |
|------|--------|
| **transforms** | `enhance_tables()`: add parameter or context flag `handbook=True` → `table` without `table-sm`; add class `forge-table-handbook`. |
| **CSS** | `.forge-table-handbook`: sticky `thead`, slightly stronger header background, comfortable cell padding. |
| **forge-autodoc** | Pass handbook flag from `assemble_handbook_page` markdown pipeline. |
| **Audit** | Optional new deterministic rule `DET.HANDBOOK.TABLE_DENSITY` or extend `DET.DATA.TABLE.HEADERS`. |

**Acceptance:** L0–L8 ladder readable without squinting; horizontal scroll only when columns truly require it.

### 2.3 Sidebar IA polish

| Item | Detail |
|------|--------|
| **CSS** | Stronger `.doc-sidebar-link.active` (weight, left border, background). |
| **JS (optional)** | Collapse sidebar branches not on path to current page (progressive enhancement). |
| **Generator** | `sidebar_chapters_label` from area metadata (“Forge methodology”, not generic “Chapters”). |
| **Later** | Client-side sidebar filter input (Phase 4). |

---

## Phase 3 — Enterprise visual profile (Hbk surface)

**Outcome:** Handbook pages use **calm matte** surfaces per `forge-enterprise-ui.md` enterprise pack — not full aurora/glass marketing drama.

### 3.1 `data-ks-handbook-surface="enterprise"` (or class on shell)

| Item | Detail |
|------|--------|
| **CSS** | On `.ks-handbook-shell`: suppress or reduce `.forge-aurora`; solid `--forge-surface` for callouts/table wraps; disable breathe on chrome. |
| **Light mode** | Verify AA contrast for nav, tables, breadcrumbs in `[data-bs-theme="light"]`. |
| **Layout** | Opt-in via `handbook_page(body_surface_class=...)` default **on** for autodoc builds. |

### 3.2 Callout & status primitives

| Item | Detail |
|------|--------|
| **Components** | `render_policy_badge()`, `render_platform_hub_callout()` in `components/components.py`. |
| **Markdown** | Convention: YAML `policy_status: defined` → badge in header; `platform_hub: url` → cyan callout after lede. |
| **Autonomy levels** | Move readiness summary table into header “at a glance” panel (content + layout). |

---

## Phase 4 — Page-type variants & generator IA

**Outcome:** Policy, guide, and reference pages get predictable structure without one-size-fits-all Markdown.

### 4.1 `page_kind` in frontmatter

| `page_kind` | Header extras | Body layout |
|-------------|---------------|-------------|
| `policy` | Status badge, readiness panel | Wide tables default |
| `guide` | “You’ll need” strip (optional) | Step-friendly spacing |
| `reference` | Symbol/API index link | Monospace lanes emphasized |

Wire in `forge-autodoc` + `build-handbook.py`; `handbook_page` receives `page_kind` for modifier classes.

### 4.2 Content helpers (Blueprints)

- Policy pages: auto-insert Platform hub callout when `platform_hub` in frontmatter.
- Related links: keep bottom section; add compact **Related** row in metadata/footer.

---

## Phase 5 — Quality loop & rollout

### 5.1 Deterministic audits (KS UX auditor)

| Rule | Intent |
|------|--------|
| `DET.NAV.BREADCRUMB` | Kbc on deep handbook pages |
| `DET.LAYOUT.GRID_CONSISTENCY` | No trailing gutter; nav/body ratio |
| New: `DET.HANDBOOK.FIRST_SCREEN` | Title + lede + start of primary content visible at 1440×900 |
| New: `DET.HANDBOOK.TABLE_DENSITY` | Flag `table-sm` in `.ks-doc-toc-prose` |

Unit tests in `tools/website-ux-auditor/auditor-tests/`.

### 5.2 Visual regression

- Capture Hbk screenshot at ~1440px (`screenshot_status: captured` in `Hbk-layout-handbook.md`).
- Pages: Autonomy levels, one guide, one reference API page.
- Run `analyze-website-ux.mjs` on `blueprints-website` post-deploy; file remediation plan if AI flags hierarchy/credibility.

### 5.3 Consumer rollout order

1. **forgesdlc-kitchensink** — commit primitives + CSS + autodoc + tests + showcase rebuild.
2. **blueprints-website** — submodule bump, `build-handbook.py` wiring, rebuild `website/`, deploy `forge-sdlc-blueprints`.
3. **forge-fleet-website** — align topnav/breadcrumb with generalized Kpn/Kbc; deploy `fleet-2f1d3`.
4. **forge-lcdl-website**, **forge-lenses-website** — submodule bump + build + deploy.
5. **forge-platform-website** — **shipped (2026-07):** `docs/site-nav.yaml`, `handbook_homepage_minimal_shell`, `platform_nav` filter, `ks-handbook-topnav`, hydration-runs excluded from build; see [platform-site-prompt-pack.md](../../prompt-packs/platform-site-prompt-pack.md).
5. **forgesdlc** — tutorials/handbook pages if they use `handbook_page`.
6. **`sync-kitchensink-and-rebuild.sh`** for public sites; manual bump for private handbooks if Fleet submodule dirty.

**Git:** one commit per repo; never cross-repo commits.

---

## Work packages (suggested PRs)

| PR | Repo | Summary | Depends on |
|----|------|---------|------------|
| **PR-A** | KS | Kbc in `handbook_page` + `render_handbook_doc_header` + CSS tokens | — |
| **PR-B** | forge-autodoc (in KS) | `breadcrumb_items`, metadata/header wiring in `assemble_handbook_page` | PR-A |
| **PR-C** | KS | Handbook tables (`forge-table-handbook`, transforms flag) | PR-A |
| **PR-D** | KS | `ks-handbook-topnav` generalization + CSS; Fleet alias | PR-A |
| **PR-E** | KS | Enterprise surface profile + callout primitives | PR-A |
| **PR-F** | KS | UX audit rules + Hbk contract + tokens.json | PR-A,C |
| **PR-G** | blueprints-website | Frontmatter, crumbs, header metadata, Autonomy content tweak | PR-B,C |
| **PR-H** | private handbooks | Submodule bumps + topnav migration | PR-D |
| **PR-I** | all handbooks | Deploy + UX auditor run + screenshot capture | PR-G,H |

---

## Out of scope (this plan)

- Rewriting all Blueprints Markdown content.
- Full-text search across handbooks.
- PDF export / “Edit on GitHub” buttons (nice-to-have; slot reserved in header).
- Applying `fs_pack: enterprise` to **marketing** pages (separate track).
- Proxima Nova webfont licensing/hosting (display font fallback remains Open Sans until font kit added).

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Double top bars (portal + topnav) | Phase 1.3 decision gate before wide deploy |
| Fleet `fleet-handbook-topnav` divergence | Generalize from `fleet_site_nav.py`; deprecate duplicate CSS gradually |
| `table-sm` removal breaks dense internal tables | Scope to `.ks-doc-toc-prose` handbook builds only |
| Full-width prose hurts long-form readability | Optional `page_kind: guide` may reintroduce measure cap for paragraphs only (not tables) |
| forge-fleet submodule dirty blocks sync | Manual submodule bump per consumer (documented in rollout) |

---

## Reference files

| Area | Path |
|------|------|
| Layout emitter | `forgesdlc-kitchensink/components/layouts.py` |
| Breadcrumbs (Kbc) | `forgesdlc-kitchensink/components/components.py` (`render_breadcrumbs`) |
| Markdown transforms | `forgesdlc-kitchensink/components/transforms.py` |
| Handbook CSS | `forgesdlc-kitchensink/css/forge-theme.css`, `docs-theme.css` |
| Hbk contract | `forgesdlc-kitchensink/docs/design/catalog/layouts/Hbk-layout-handbook.md` |
| Kbc contract | `forgesdlc-kitchensink/docs/design/catalog/chrome/Kbc-doc-breadcrumb.md` |
| Page-type guidance | `forgesdlc-kitchensink/docs/design/catalog/page-types/Ks-page-type-design-guidelines.md` |
| Enterprise standard | `forgesdlc-kitchensink/docs/design/forge-enterprise-ai-website-standard.md` |
| Autodoc assembly | `forgesdlc-kitchensink/forge-autodoc/forge_autodoc/page.py` |
| Fleet topnav | `forgesdlc-kitchensink/forge-autodoc/forge_autodoc/fleet_site_nav.py` |
| Blueprints generator | `blueprints-website/generator/build-handbook.py` |
| Portal inject (legacy) | `blueprints-website/generator/inject-portal-nav.py` |
| Grid audit | `forgesdlc-kitchensink/tools/website-ux-auditor/design-rules/deterministic/generated/det-layout-grid-consistency.check.js` |
| Reference page | `blueprints-website/website/sdlc--methodologies-forge-autonomy-levels.html` |

---

## Phase 4 — Light chrome + spatial L1/L2 (2026-07)

| Item | Detail |
|------|--------|
| **Light theme** | Kpn/Kbc/Ksr explicit `html[data-bs-theme="light"]` overrides in `forge-theme.css` + `forge-light-theme.css` |
| **Spatial bands** | `handbook_landing.py` — Hlr/Hst/Dck/Hlp; wired via `landing_blocks` frontmatter in forge-autodoc |
| **Platform** | Richest L1 (`docs/index.md`) + L2 hubs (`start/`, `architecture/`, `guides/`, `sprints/`) |
| **Peers** | Fleet/LCDL/Lenses L1 landing rails after KS submodule bump |

---

## Suggested execution order (when implementing)

1. **PR-A + PR-B** — breadcrumbs + document header (visible win immediately).
2. **PR-C** — handbook tables on Autonomy levels.
3. **PR-G** — Blueprints wiring + deploy; validate with user at 1440 and 1920.
4. **PR-D** — topnav unification.
5. **PR-E + PR-F** — surface profile, audits, screenshots.
6. **PR-H + PR-I** — remaining handbooks + QA loop.
