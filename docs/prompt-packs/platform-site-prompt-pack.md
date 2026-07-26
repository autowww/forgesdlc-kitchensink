# Platform site prompt pack

Target site: `platform.forgesdlc.com` (Firebase `forge-platform-1541d`, handbook shell **fpw**)

Canonical UX standard: [forge-enterprise-ai-website-standard.md](../design/forge-enterprise-ai-website-standard.md) (Platform root **mode 1**).

## Repos and commands

| Abbr | Repo | Role |
|------|------|------|
| **fp** | `forge-platform/` | Markdown source (`docs/`, `adr/`, `sprints/`, `mcp/`) |
| **fpw** | `forge-platform-website/` | `generator/build-site.py` → `website/` |
| **ks** | `forgesdlc-kitchensink/` | `kitchensink/` submodule — forge-autodoc, Hbk/Kpn chrome |

```bash
# Edit fp standalone, then bump fp submodule in fpw when integrating.
cd forge-platform-website
git submodule update --init --recursive
pip install markdown
python3 generator/build-site.py
python3 scripts/check-generated-site.py --strict-diagrams
```

Deploy (when asked): `./deploy-websites.sh --only forge-platform-website` from workspace root.

## Handbook chrome stack (dual-wiki)

| Hash | Contract | Platform wiring |
|------|----------|-----------------|
| **Hbk** | [Hbk-layout-handbook.md](../design/catalog/layouts/Hbk-layout-handbook.md) | All inner handbook pages via forge-autodoc |
| **Kpn** | [Kpn-product-primary-nav.md](../design/catalog/chrome/Kpn-product-primary-nav.md) | `docs/site-nav.yaml` → `fleet_site_nav.build_top_nav_html` |
| **Kbc** | [Kbc-doc-breadcrumb.md](../design/catalog/chrome/Kbc-doc-breadcrumb.md) | Emitted when `seo_public_origin` set + site nav |
| **Ksr** | [Ksr-doc-sidebar.md](../design/catalog/chrome/Ksr-doc-sidebar.md) | Section-scoped via `site-nav.yaml` `sidebar_prefix` + `platform_nav.filter_sidebar_pages` |
| **Ktx** | [Ktx-doc-toc-sidebar.md](../design/catalog/chrome/Ktx-doc-toc-sidebar.md) | On-page ToC from headings |
| **Ksf** | [Ksf-site-footer.md](../design/catalog/chrome/Ksf-site-footer.md) | Handbook footer |

Homepage mode 1: `HandbookBuildConfig.handbook_homepage_minimal_shell=True` on `docs/index.md` — **Kpn** top nav only, no **Ksr** mega-rail on `/`.

Nav exclusions (sidebar + sitemap): `docs/hydration-runs/`, `docs-governance/`, `prompts/`, `product-repo-stubs/`, `hermes/`.

## Site role

Platform is the ecosystem architecture layer of Forge: methodology, workspace visibility, governed reasoning, controlled execution, and reusable practice knowledge.

## Primary UX goal

Public `/` is a product landing (mode 1). Maintainer corpus (submodule bumps, generators, hydration WIP, governance registries) stays reachable under **More → Maintainers** — not in first-screen chrome.

## Target storyline

Agentic delivery needs more than a methodology and more than individual AI tools. Teams need a connected operating layer. Forge Platform connects those layers while keeping humans in control and agents in bounded workcells.

## Phased execution (Composer 2.5)

Run phases **sequentially**. One commit per repo when committing.

### P0 — Baseline inventory (read-only)

```text
Inventory fpw generator/build-site.py, fp docs/index.md, hydration page count, and peer handbooks (ffw, flw).
Compare against forge-enterprise-ai-website-standard.md Platform section.
Output gap matrix + top 10 junk drivers. No edits.
```

### P1 — KS dual-wiki uplift

```text
Repo: forgesdlc-kitchensink only.
Update this prompt pack (phased prompts + chrome stack table).
Patch docs/design/plans/handbook-enterprise-uplift.md — Platform consumer: in progress (site-nav + minimal home).
If Hbk/Kpn contracts contradict minimal_shell + Kpn coexistence, add one clarifying paragraph.
Docs-only unless showcase contracts change.
```

### P2 — Nav manifest + generator wire

```text
Repo: forge-platform + forge-platform-website.
Add fp/docs/site-nav.yaml (Home, Start, Architecture, Standout, Guides, Deliver, Reference, More).
In fpw generator/build-site.py: site_nav_yaml, handbook_homepage_minimal_shell=True,
expanded nav_exclude_path_prefixes, seo_public_origin, platform_nav.filter_sidebar_pages,
robots.txt + sitemap.xml (exclude hydration/governance slugs).
Rebuild; verify ks-handbook-topnav on index.html and no hydration in default sidebar.
```

### P3 — Mode-1 homepage rewrite

```text
Repo: forge-platform.
Rewrite docs/index.md with layout_type: landing / page_contract_profile: landing.
Hero, outcomes, layer map (reuse docs/assets/ecosystem/platform-layers.svg), how-it-works,
trust, role paths, maintainer CTA. Move numbered "Start here" list to docs/start/index.md.
Rebuild fpw.
```

### P4 — Hub pages + KS controls

```text
Repo: forge-platform.
Ensure hubs: docs/start/index.md, docs/architecture/index.md, docs/standout/index.md (polish),
docs/guides/README.md, sprints/index.md, mcp/servers/README.md (reference hub).
Link docs/for-architects.md from Architecture hub. hide_from_nav on moved stubs (docs/forge-agent.md).
Use blueprint-diagram or existing SVGs where present; no new one-off CSS.
```

### P5 — Deliver + Reference polish

```text
Repo: forge-platform/docs/site-nav.yaml.
Deliver dropdown caps milestone charters (M0–M6, selfhost-alpha); not every evidence leaf.
Reference: MCP hub + ecosystem/schema pointers. Confirm prompts/hermes still excluded from nav.
```

### P6 — QA loop

```text
cd forge-platform-website && python3 generator/build-site.py
python3 scripts/check-generated-site.py --strict-diagrams
Fix broken links on primary nav paths only. Summarize remaining link_report debt.
Toggle light theme on `/` and one L2 hub — Kpn/Kbc/Ksr labels must stay readable (no light-on-light).
Confirm spatial landing hashes on homepage: Hlr, Hst, Dck, Hlp.
```

## Spatial L1–L2 uplift

Homepage and hub pages use `landing_blocks` frontmatter + `<!-- ks-landing:TYPE -->` markers in Markdown. Renderers live in `forgesdlc-kitchensink/components/handbook_landing.py` (Hlr layer rail, Hst steps band, Dck trust deck, Hlp role-path rail). forge-autodoc injects `ks-nav-layout.css`, `ks-spatial*.css`, and peek-rail JS when `page_contract_profile` is `landing` or `hub`.

```yaml
landing_blocks:
  layer_rail:
    items:
      - layer: Methodology
        product: ForgeSDLC
        role: Governed delivery
        href: https://forgesdlc.com
```

## Light-theme QA

Handbook chrome light overrides live in `forge-theme.css`, `forge-light-theme.css`, and `docs-theme.css`. After CSS changes, rebuild and verify `data-bs-theme="light"` on Kpn nav links, sidebar labels, and landing spatial cards.

### P7 — Drift gate

```text
Confirm fp docs, fpw README, ks prompt pack, and built index.html tell the same story.
Report files changed per repo and before/after nav behavior.
```

## Homepage hero (normative copy)

- **Headline:** A governed platform for human + agent delivery.
- **Subhead:** Forge Platform connects the layers teams need for agentic delivery: methodology, workspace visibility, governed LLM tasks, controlled job execution, and reusable practice knowledge.
- **Primary CTA:** Explore the architecture → `docs/architecture/index.md`
- **Secondary CTA:** Open maintainer docs → `docs-governance/OPERATING-CADENCE.md`

## Ecosystem links (footer / role paths)

- ForgeSDLC — https://forgesdlc.com
- Blueprints — https://blueprints.forgesdlc.com
- Lenses — https://lenses.forgesdlc.com
- LCDL — https://lcdl.forgesdlc.com
- Fleet — https://fleet.forgesdlc.com

Do not invent customers, certifications, metrics, or integrations not documented in fp.
