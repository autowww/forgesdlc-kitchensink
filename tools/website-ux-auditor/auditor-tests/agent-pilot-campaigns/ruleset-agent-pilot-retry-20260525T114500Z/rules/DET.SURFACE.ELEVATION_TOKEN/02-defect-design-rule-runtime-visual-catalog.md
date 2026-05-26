---
title: 02 - Defect: design-rule-runtime (visual-catalog)
kind: cursor-remediation-plan
order: 2
product: Forge website
generated_at: 2026-05-25T13:42:39.950Z
audit_run_id: a181da4d5d587565
---

# 02 - Defect: design-rule-runtime (visual-catalog)

Recommended storyline for **Forge website**:

- One-liner: A Forge product site for governed AI-enabled delivery.
- Primary promise: Make the product clear, governed, and enterprise-ready.
- Audience: new visitors, technical evaluators, and internal implementers
- Story spine: human outcome -> governed system -> bounded execution -> trust -> next action


## Non-negotiable constraints

- Preserve canonical technical content. Move it to better depth instead of deleting it.
- Do not invent customers, certifications, integrations, benchmarks, compliance claims, or product capabilities.
- Keep marketing pages short, direct, and outcome-led.
- Keep docs/reference pages technically complete.
- Maintain existing build conventions, routing conventions, and component style unless the repo clearly supports a better shared pattern.
- Validate links, responsive layout, semantic headings, and basic accessibility before finishing.
- Do not respond to audits by **rewriting Markdown copy only**. First verify root `/` uses **product landing shell** vs **docs/handbook shell** per **docs/design/forge-enterprise-ai-website-standard.md**. When `homepage-shell`, `product-visual`, or `storyline-flow` findings indicate wrong shell or a missing hero visual slot, complete **Plan 02** (shell/layout separation) before hero copy work (**Plan 03**).


## Defect identity

- **checkId:** `design-rule-runtime`
- **area:** `visual-catalog`
- **severity mix:** warn:4, minor:2
- **major+ count:** 0
- **affected URLs:** 1
- **estimated overall score delta if this cluster is fixed:** **+8.00**
- **primary scorer dimension:** KS visual catalog governance
- **homepage-cap gate involved:** no

## KS visual catalog pointers (from DOM markers on affected URLs)

_No KS visual hash markers were recorded in page metrics for URLs in this cluster, and findings did not carry a three-letter `hash` field._


## Why this is prioritized

- This cluster ranks #2 by scorer impact model (homepage cap gates first, then estimated overall score delta, severity weight, and URL coverage).
- Cluster coverage share (findings in this cluster / all findings): 28.6%.

## Root-cause hypothesis

Likely shared generator/layout/content-map source; verify page-local exceptions before making per-page edits.

## Candidate files to inspect first

Cursor Agent should verify these rather than assuming they are definitive.

### Pages/content
- [ ] `docs/ascii-to-ks-diagrams.md`
- [ ] `docs/BACKLOG-layouts-components.md`
- [ ] `docs/design/catalog/chrome/Kbc-doc-breadcrumb.md`
- [ ] `docs/design/catalog/chrome/Kco-doc-offcanvas.md`
- [ ] `docs/design/catalog/chrome/Kpn-product-primary-nav.md`
- [ ] `docs/design/catalog/chrome/Ksf-site-footer.md`
- [ ] `docs/design/catalog/chrome/Ksr-doc-sidebar.md`
- [ ] `docs/design/catalog/chrome/Ktx-doc-toc-sidebar.md`
- [ ] `docs/design/catalog/components/Kpr-fam-python-renderers.md`
- [ ] `docs/design/catalog/consumer-site-hash-verification.md`
- [ ] `docs/design/catalog/contract-template.md`
- [ ] `docs/design/catalog/desktop-interfaces/Msm-museum-studio.md`
- [ ] `docs/design/catalog/diagrams/Ksv-fam-svg.md`
- [ ] `docs/design/catalog/interactions/Ksj-fam-scripts.md`
- [ ] `docs/design/catalog/layouts/Chp-layout-chapter.md`
- [ ] `docs/design/catalog/layouts/Gly-layout-gallery.md`
- [ ] `docs/design/catalog/layouts/Hbk-layout-handbook.md`
- [ ] `docs/design/catalog/layouts/Ldg-layout-landing.md`
- [ ] `docs/design/catalog/layouts/Lst-layout-listing.md`
- [ ] `docs/design/catalog/layouts/Mkt-layout-marketing.md`
- [ ] `docs/design/catalog/layouts/Prd-layout-product.md`
- [ ] `docs/design/catalog/layouts/Shw-layout-showcase.md`
- [ ] `docs/design/catalog/layouts/Spl-layout-split.md`
- [ ] `docs/design/catalog/ONTOLOGY.md`
- [ ] `docs/design/catalog/page-types/Fad-forge-autodoc.md`
- [ ] `docs/design/catalog/page-types/Kdt-fam-design-terminology.md`
- [ ] `docs/design/catalog/page-types/Ks-page-type-design-guidelines.md`
- [ ] `docs/design/catalog/pages/Ctr-controls.md`
- [ ] `docs/design/catalog/pages/Dca-data-charts-api.md`
- [ ] `docs/design/catalog/pages/Dce-diagram-code-examples.md`
- [ ] `docs/design/catalog/pages/Dcs-data-charts-static.md`
- [ ] `docs/design/catalog/pages/Dgm-diagrams.md`
- [ ] `docs/design/catalog/pages/Enm-enterprise-marketing.md`
- [ ] `docs/design/catalog/pages/Fag-for-agents.md`
- [ ] `docs/design/catalog/pages/Fam-forge-ambient.md`
- [ ] `docs/design/catalog/pages/Frp-forge-react-primitives.md`
- [ ] `docs/design/catalog/pages/Hdc-handbook-chapter.md`
- [ ] `docs/design/catalog/pages/Idx-index.md`
- [ ] `docs/design/catalog/pages/Kcm-ks-creation-mindmap.md`
- [ ] `docs/design/catalog/pages/Kra-fam-showcase-react-app.md`
- [ ] `docs/design/catalog/pages/Lvg-living-background.md`
- [ ] `docs/design/catalog/pages/Lyt-layouts.md`
- [ ] `docs/design/catalog/pages/Mtn-motion.md`
- [ ] `docs/design/catalog/pages/Nav-navigation.md`
- [ ] `docs/design/catalog/pages/Ndr-nested-roadmap.md`

### Layout/navigation/components
- [ ] `docs/BACKLOG-layouts-components.md`
- [ ] `docs/design/catalog/chrome/Kpn-product-primary-nav.md`
- [ ] `docs/design/catalog/chrome/Ksr-doc-sidebar.md`
- [ ] `docs/design/catalog/chrome/Ktx-doc-toc-sidebar.md`
- [ ] `docs/design/catalog/layouts/Chp-layout-chapter.md`
- [ ] `docs/design/catalog/layouts/Gly-layout-gallery.md`
- [ ] `docs/design/catalog/layouts/Hbk-layout-handbook.md`
- [ ] `docs/design/catalog/layouts/Ldg-layout-landing.md`
- [ ] `docs/design/catalog/layouts/Lst-layout-listing.md`
- [ ] `docs/design/catalog/layouts/Mkt-layout-marketing.md`
- [ ] `docs/design/catalog/layouts/Prd-layout-product.md`
- [ ] `docs/design/catalog/layouts/Shw-layout-showcase.md`
- [ ] `docs/design/catalog/layouts/Spl-layout-split.md`
- [ ] `docs/design/catalog/pages/Lyt-layouts.md`
- [ ] `docs/design/catalog/pages/Nav-navigation.md`
- [ ] `docs/design/catalog/pages/Slt-split-layout.md`
- [ ] `docs/design/lenses-studio-shell.md`
- [ ] `docs/design/ux-audit/rule-pages/det-data-table-headers.md`
- [ ] `docs/design/ux-audit/rule-pages/det-layout-grid-consistency.md`
- [ ] `docs/design/ux-audit/rule-pages/det-nav-breadcrumb.md`
- [ ] `docs/design/ux-audit/rule-pages/det-nav-dedup.md`
- [ ] `docs/design/ux-audit/rule-pages/det-nav-depth.md`
- [ ] `docs/design/ux-audit/rule-pages/det-nav-focus-order.md`
- [ ] `docs/design/ux-audit/rule-pages/det-nav-in-page-toc.md`
- [ ] `docs/PAGE-LAYOUT-TAXONOMY.md`
- [ ] `js/docs-nav.js`
- [ ] `js/fs-nav-dropdown.js`
- [ ] `js/portal-nav.js`
- [ ] `museum/studio/assets/BlueprintsWizardLayout-WheM6hfS.js`
- [ ] `react/ForgeRunHeader.tsx`
- [ ] `tools/website-ux-auditor/.staging-det-data-table-headers.md`
- [ ] `tools/website-ux-auditor/.ux-loop-e2e-8q54ptYDtj/02-homepage-shell-and-product-landing-mode.md`
- [ ] `tools/website-ux-auditor/.ux-loop-e2e-8q54ptYDtj/04-information-architecture-and-navigation.md`
- [ ] `tools/website-ux-auditor/.ux-loop-e2e-8q54ptYDtj/09-screenshot-and-homepage-shell-review.md`
- [ ] `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.NAV.BREADCRUMB/fixture-website/assets/forge-theme.js`
- [ ] `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.NAV.BREADCRUMB/fixture-website/assets/showcase.js`
- [ ] `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.NAV.BREADCRUMB/fixture-website/index.html`
- [ ] `tools/website-ux-auditor/auditor-tests/copy-det-data-table-headers-dest.test.js`
- [ ] `tools/website-ux-auditor/auditor-tests/det-data-table-headers.test.js`
- [ ] `tools/website-ux-auditor/auditor-tests/det-layout-grid-consistency.test.js`
- [ ] `tools/website-ux-auditor/auditor-tests/det-nav-breadcrumb.test.js`
- [ ] `tools/website-ux-auditor/auditor-tests/det-nav-dedup.test.js`
- [ ] `tools/website-ux-auditor/auditor-tests/det-nav-depth.test.js`
- [ ] `tools/website-ux-auditor/auditor-tests/det-nav-focus-order.test.js`
- [ ] `tools/website-ux-auditor/auditor-tests/det-nav-in-page-toc.test.js`
- [ ] `tools/website-ux-auditor/checks/homepage-shell.js`
- [ ] `tools/website-ux-auditor/design-rules/deterministic/generated/det-data-table-headers.check.js`
- [ ] `tools/website-ux-auditor/design-rules/deterministic/generated/det-layout-grid-consistency.check.js`
- [ ] `tools/website-ux-auditor/design-rules/deterministic/generated/det-nav-breadcrumb.check.js`
- [ ] `tools/website-ux-auditor/design-rules/deterministic/generated/det-nav-dedup.check.js`

### Styles/tokens
- [ ] `css/docs-theme.css`
- [ ] `css/forge-ambient-themes.css`
- [ ] `css/forge-ambient.css`
- [ ] `css/forge-data-charts.css`
- [ ] `css/forge-fleet-admin.css`
- [ ] `css/forge-light-theme.css`
- [ ] `css/forge-react-primitives.css`
- [ ] `css/forge-theme.css`
- [ ] `css/forgesdlc-pack-contrast.css`
- [ ] `css/forgesdlc-pack-enterprise.css`
- [ ] `css/forgesdlc-pack-focus.css`
- [ ] `css/forgesdlc-pack-minimal.css`
- [ ] `css/forgesdlc-pack-showcase.css`
- [ ] `css/forgesdlc-theme.css`
- [ ] `css/fs-sticker-board.css`
- [ ] `css/ks-animated-backgrounds.css`
- [ ] `css/ks-living-background.css`
- [ ] `css/nested-roadmap.css`
- [ ] `css/script-assembly.css`
- [ ] `css/svg-background-gallery.css`
- [ ] `css/tile-dropdown.css`
- [ ] `css/wizard-flow.css`
- [ ] `css/workspace-lens.css`
- [ ] `docs/design/catalog/pages/Tkn-tokens.md`
- [ ] `docs/design/catalog/styles/Ksc-fam-styles.md`
- [ ] `docs/design/themes/default/ai-principles.md`
- [ ] `docs/design/themes/default/contracts/README.md`
- [ ] `docs/design/themes/default/design-standard.md`
- [ ] `docs/design/themes/default/deterministic-rules.md`
- [ ] `docs/design/themes/default/theme.generated.json`
- [ ] `docs/design/themes/default/theme.yaml`
- [ ] `docs/design/themes/default/tokens.json`
- [ ] `docs/design/themes/README.md`
- [ ] `docs/design/themes/softserve/ai-principles.md`
- [ ] `docs/design/themes/softserve/contracts/README.md`


## Scorer impact details

- `visualCatalogGovernance`: rawDamage 116.00 (6 finding(s))

## Findings sampled from this run

- **WARN** Template SVG assets/svg/template-bullet-chart.svg for "bullet" matches only 1/2 required catalog legend node labels (of 4 legend entries). (n/a)
  - Evidence: diagram-labels-legend-gap key=bullet svg=assets/svg/template-bullet-chart.svg matched=1 required=2 url=http://127.0.0.1:60577/
  - Remediation hint: Align SVG text nodes with catalog legend `items[].node` strings for the data-diagram-key, or update the catalog legend when labels were intentionally renamed.
- **WARN** Template SVG assets/svg/template-pie-donut.svg for "pie" matches only 0/2 required catalog legend node labels (of 4 legend entries). (n/a)
  - Evidence: diagram-labels-legend-gap key=pie svg=assets/svg/template-pie-donut.svg matched=0 required=2 url=http://127.0.0.1:60577/
  - Remediation hint: Align SVG text nodes with catalog legend `items[].node` strings for the data-diagram-key, or update the catalog legend when labels were intentionally renamed.
- **WARN** Template SVG assets/svg/template-radar.svg for "radar" matches only 1/2 required catalog legend node labels (of 3 legend entries). (n/a)
  - Evidence: diagram-labels-legend-gap key=radar svg=assets/svg/template-radar.svg matched=1 required=2 url=http://127.0.0.1:60577/
  - Remediation hint: Align SVG text nodes with catalog legend `items[].node` strings for the data-diagram-key, or update the catalog legend when labels were intentionally renamed.
- **WARN** Template SVG assets/svg/template-waterfall.svg for "waterfall" matches only 2/3 required catalog legend node labels (of 5 legend entries). (n/a)
  - Evidence: diagram-labels-legend-gap key=waterfall svg=assets/svg/template-waterfall.svg matched=2 required=3 url=http://127.0.0.1:60577/
  - Remediation hint: Align SVG text nodes with catalog legend `items[].node` strings for the data-diagram-key, or update the catalog legend when labels were intentionally renamed.
- **MINOR** generator/bootstrap_missing_rule_pages.py inlines governed KS hash attributes (/data-ks-hash\s*=\s*["']/) — route through ks_hash_attrs or ks_catalog_hashes helpers. (n/a)
  - Evidence: python_source=generator/bootstrap_missing_rule_pages.py kind=manual-literal
  - Remediation hint: Remove inline hash/data-ks-* attribute strings; use `ks_hash_attrs()` or `layout_shell_attrs` / `page_main_attrs` / `chrome_region_attrs` from `components/ks_catalog_hashes.py`.
- **MINOR** generator/build_rule_defect_fixtures.py inlines governed KS hash attributes (/data-ks-hash\s*=\s*["']/) — route through ks_hash_attrs or ks_catalog_hashes helpers. (n/a)
  - Evidence: python_source=generator/build_rule_defect_fixtures.py kind=manual-literal
  - Remediation hint: Remove inline hash/data-ks-* attribute strings; use `ks_hash_attrs()` or `layout_shell_attrs` / `page_main_attrs` / `chrome_region_attrs` from `components/ks_catalog_hashes.py`.

## Related RCA prompts (optional deep dive)

- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.SURFACE.ELEVATION_TOKEN/rca-prompts/a181da4d5d587565-f01.md` · major · http://127.0.0.1:60577/
- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.SURFACE.ELEVATION_TOKEN/rca-prompts/a181da4d5d587565-f02.md` · warn · http://127.0.0.1:60577/
- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.SURFACE.ELEVATION_TOKEN/rca-prompts/a181da4d5d587565-f03.md` · warn · http://127.0.0.1:60577/
- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.SURFACE.ELEVATION_TOKEN/rca-prompts/a181da4d5d587565-f04.md` · warn · http://127.0.0.1:60577/
- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.SURFACE.ELEVATION_TOKEN/rca-prompts/a181da4d5d587565-f05.md` · warn · http://127.0.0.1:60577/

## Plan–Do–Check–Adjust

### Plan

- [ ] Confirm whether this defect pattern is shared across routes (generator/layout/nav/theme) or page-local.
- [ ] Identify the minimal shared lever and exact files to touch.

### Do

- [ ] Implement the root-cause fix at the shared lever first.
- [ ] If a route-specific exception remains, apply a narrow page-level patch and document why it is local-only.

### Check

- [ ] Run build/check commands from this repo.
- [ ] Re-run scorer and auditor on the same campaign output folder.
- [ ] Verify this cluster's severity count drops and relevant scorer dimension improves.

### Adjust

- [ ] If score/finding movement is insufficient, revise root-cause hypothesis and iterate this plan again before proceeding.

## Completion checklist

- [ ] Cluster reduced or cleared across affected URLs.
- [ ] No regression introduced in other major dimensions.
- [ ] Changes remain consistent with product truth and non-negotiable constraints.
