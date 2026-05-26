---
title: 01 - Defect: design-rule-runtime (readability)
kind: cursor-remediation-plan
order: 1
product: Forge website
generated_at: 2026-05-25T13:42:33.120Z
audit_run_id: 8f895c64766e014e
---

# 01 - Defect: design-rule-runtime (readability)

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
- **area:** `readability`
- **severity mix:** warn:24
- **major+ count:** 0
- **affected URLs:** 2
- **estimated overall score delta if this cluster is fixed:** **+22.00**
- **primary scorer dimension:** Page depth & technical disclosure
- **homepage-cap gate involved:** no

## KS visual catalog pointers (from DOM markers on affected URLs)

```text
Affected visual hash: Msm
Contract: docs/design/catalog/desktop-interfaces/Msm-museum-studio.md
```

_When `hash` / `data-ks-hash` appears in DOM metrics for an affected URL, or a finding carries `hash`, use the matching contract as the implementation spec for that visual root._


## Why this is prioritized

- This cluster ranks #1 by scorer impact model (homepage cap gates first, then estimated overall score delta, severity weight, and URL coverage).
- Cluster coverage share (findings in this cluster / all findings): 57.1%.

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

- `depthAndTechnicalDisclosure`: rawDamage 504.00 (24 finding(s))

## Findings sampled from this run

- **WARN** Raw hex color #6b7280 is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens. (n/a)
  - Evidence: raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".st-queued" property=background hex=#6b7280 url=http://127.0.0.1:60517/
  - Remediation hint: Replace raw hex literals with theme custom properties (e.g. var(--forge-cyan)) or add the value to a theme pack token definition instead of feature CSS.
- **WARN** Raw hex color #2563eb is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens. (n/a)
  - Evidence: raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".st-running" property=background hex=#2563eb url=http://127.0.0.1:60517/
  - Remediation hint: Replace raw hex literals with theme custom properties (e.g. var(--forge-cyan)) or add the value to a theme pack token definition instead of feature CSS.
- **WARN** Raw hex color #b91c1c is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens. (n/a)
  - Evidence: raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".st-failed" property=background hex=#b91c1c url=http://127.0.0.1:60517/
  - Remediation hint: Replace raw hex literals with theme custom properties (e.g. var(--forge-cyan)) or add the value to a theme pack token definition instead of feature CSS.
- **WARN** Raw hex color #a16207 is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens. (n/a)
  - Evidence: raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".st-cancelled" property=background hex=#a16207 url=http://127.0.0.1:60517/
  - Remediation hint: Replace raw hex literals with theme custom properties (e.g. var(--forge-cyan)) or add the value to a theme pack token definition instead of feature CSS.
- **WARN** Raw hex color #1e293b is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens. (n/a)
  - Evidence: raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector="[data-bs-theme="light"] .fleet-tile .fleet-tile__label" property=color hex=#1e293b url=http://127.0.0.1:60517/
  - Remediation hint: Replace raw hex literals with theme custom properties (e.g. var(--forge-cyan)) or add the value to a theme pack token definition instead of feature CSS.
- **WARN** Raw hex color #334155 is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens. (n/a)
  - Evidence: raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector="[data-bs-theme="light"] .fleet-tile .fleet-tile__hint" property=color hex=#334155 url=http://127.0.0.1:60517/
  - Remediation hint: Replace raw hex literals with theme custom properties (e.g. var(--forge-cyan)) or add the value to a theme pack token definition instead of feature CSS.
- **WARN** Raw hex color #1e293b is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens. (n/a)
  - Evidence: raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector="[data-bs-theme="light"] .fleet-tile .fleet-tile__mem" property=color hex=#1e293b url=http://127.0.0.1:60517/
  - Remediation hint: Replace raw hex literals with theme custom properties (e.g. var(--forge-cyan)) or add the value to a theme pack token definition instead of feature CSS.
- **WARN** Raw hex color #334155 is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens. (n/a)
  - Evidence: raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector="[data-bs-theme="light"] .fleet-tile .fleet-tile__load-cousin" property=color hex=#334155 url=http://127.0.0.1:60517/
  - Remediation hint: Replace raw hex literals with theme custom properties (e.g. var(--forge-cyan)) or add the value to a theme pack token definition instead of feature CSS.

## Related RCA prompts (optional deep dive)

- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.APP.PERSISTENT_CHROME/rca-prompts/8f895c64766e014e-f01.md` · warn · http://127.0.0.1:60517/
- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.APP.PERSISTENT_CHROME/rca-prompts/8f895c64766e014e-f02.md` · warn · http://127.0.0.1:60517/
- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.APP.PERSISTENT_CHROME/rca-prompts/8f895c64766e014e-f03.md` · warn · http://127.0.0.1:60517/
- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.APP.PERSISTENT_CHROME/rca-prompts/8f895c64766e014e-f04.md` · warn · http://127.0.0.1:60517/
- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.APP.PERSISTENT_CHROME/rca-prompts/8f895c64766e014e-f05.md` · warn · http://127.0.0.1:60517/

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
