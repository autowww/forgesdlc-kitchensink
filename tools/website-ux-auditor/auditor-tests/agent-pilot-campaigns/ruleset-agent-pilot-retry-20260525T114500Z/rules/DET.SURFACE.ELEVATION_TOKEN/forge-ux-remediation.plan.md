---
name: "Forge website — Forge UX remediation (Build)"
overview: "Ordered remediation for Forge website. Run 1 source(s) in this audit | 0 blocker, 0 critical, 2 major, 3 minor, 0 trivial, 0 cosmetic. See body for snapshot, URLs, and top signals. Defect plans generated: 5 (limit 10)."
generated_at: "2026-05-25T13:42:39.950Z"
audit_run_id: "a181da4d5d587565"
todos:
  - id: ux-00
    content: "Read 00-master-remediation-sequence.md and audit-report.md"
    status: pending
  - id: ux-01
    content: "Execute 01-defect-design-rule-runtime-readability.md (priority defect plan #1)"
    status: pending
  - id: ux-02
    content: "Execute 02-defect-design-rule-runtime-visual-catalog.md (priority defect plan #2)"
    status: pending
  - id: ux-03
    content: "Execute 03-defect-metadata-a11y-accessibility.md (priority defect plan #3)"
    status: pending
  - id: ux-04
    content: "Execute 04-defect-design-rule-runtime-accessibility.md (priority defect plan #4)"
    status: pending
  - id: ux-05
    content: "Execute 05-defect-readability-structure-readability.md (priority defect plan #5)"
    status: pending
isProject: true
---

# Forge website — Forge UX remediation

This `forge-ux-remediation.plan.md` file is intended for Cursor's **plan UI** (todos + **Build**). The sibling markdown files carry **defect-prioritized** remediation prompts; **this file adds the audit snapshot from the generator run** so the orchestrator is not context-free.

- After substantive edits, run your site's build command (e.g. `python3 generator/build-site.py` for generator-based sites).
- Re-run the auditor with `--site` when a dev server is available for Playwright evidence and richer DOM metrics.
- Prefer **root-cause, sitewide fixes** (generators, shared layout/shell templates, global CSS/theme tokens, navigation sources, content-map rules) when the same finding pattern appears on multiple URLs—see **`00-master-remediation-sequence.md`**. Patch individual pages only when the issue is truly local.
- Use **Plan–Do–Check–Adjust**: each defect file is the **Plan** slice; **Do** a coherent root-cause change; **Check** with build/serve and a fresh audit+score pass; **Adjust** by revisiting the same defect plan until severity/score movement is satisfactory.

## Run identity

| Field | Value |
|-------|-------|
| **audit_run_id** | `a181da4d5d587565` |
| **generated_at (UTC)** | `2026-05-25T13:42:39.950Z` |

All generated artifacts in this folder from **this** invocation share this **audit_run_id**. Each audit run creates a **new** id and timestamp (including `audit-report.md`, `audit-data.json`, `00`–`09`, and this plan).

## Plan status

This run used **`--no-refresh-plan-status`**: all todos were written as `pending`.

## Defect plans in this run (priority order)

| Order | File | Check | Area | Estimated score Δ | URLs |
|------:|------|-------|------|------------------:|-----:|
| 1 | `01-defect-design-rule-runtime-readability.md` | `design-rule-runtime` | `readability` | +15.00 | 1 |
| 2 | `02-defect-design-rule-runtime-visual-catalog.md` | `design-rule-runtime` | `visual-catalog` | +8.00 | 1 |
| 3 | `03-defect-metadata-a11y-accessibility.md` | `metadata-a11y` | `accessibility` | +2.00 | 1 |
| 4 | `04-defect-design-rule-runtime-accessibility.md` | `design-rule-runtime` | `accessibility` | +2.00 | 1 |
| 5 | `05-defect-readability-structure-readability.md` | `readability-structure` | `readability` | +1.00 | 1 |


## If the Build button does nothing

**Build** in Plan mode is meant to hand the plan to the **Agent** so it can implement. That handoff is mainly tested for plans **created in Plan Mode in the same session**. Auditor-generated `.plan.md` files are valid Markdown, but Cursor may not attach the same Build action to them (or to plans in a **nested** folder like `forge-ux-remediation/`).

Use this workflow instead:

1. Switch to **Agent** (not **Ask**), in the same workspace root as `--repo`.
2. In chat, attach this plan with **@** (e.g. `@forge-ux-remediation.plan.md` or the path under `.cursor/plans/`).
3. Ask: **Execute the YAML todos in order (ux-00 … ux-10); after each todo summarize files touched and stop for review if the change is large.**
4. If you use a repo-level orchestrator in `.cursor/plans/*.plan.md`, attach that file instead — some Cursor builds wire **Build** more reliably for plans **directly under** `.cursor/plans/` than for nested copies.
5. With **`--mirror-root-plan`**, a **uniquely named copy** is written under `.cursor/plans/`: `forge-ux-remediation__<UTC-stamp>__<audit_run_id>.plan.md` (same YAML + body). It may still not enable **Build**; use **Agent @** or `cursor-agent-run-ux-plan.sh` (see KS tool README).

## Audit snapshot (this run)


**Mode:** browser crawl (1 page(s)) starting at http://127.0.0.1:60577/.

**Crawl outcome:** `normal_completion` — Major+ count `2`; queued URLs `3`; page capture budget `1`. Use `--breadth-crawl` (alias `--stop-disable`) to crawl full `--max-pages` breadth regardless of backlog.

**Findings (by tier):** major: 2; minor: 3

Severity counts use schema v2 (`audit-data.json`). See report appendix for the ladder definitions.

### Pages / sources

- http://127.0.0.1:60577/

### Top signals (max 10)

- **major** [accessibility] Potential low-contrast text was detected.
  - *Evidence:* 1 samples below expected contrast thresholds.
- **major** [accessibility] Body UI text has insufficient contrast (3.81:1) against its background; WCAG AA requires at least 4.5:1 for this font size.
  - *Evidence:* low_contrast tag=a ratio=3.81 size=16px threshold=4.5 text="Explore docs" url=http://127.0.0.1:60577/
- **warn** [visual-catalog] Template SVG assets/svg/template-bullet-chart.svg for "bullet" matches only 1/2 required catalog legend node labels (of 4 legend entries).
  - *Evidence:* diagram-labels-legend-gap key=bullet svg=assets/svg/template-bullet-chart.svg matched=1 required=2 url=http://127.0.0.1:60577/
- **warn** [visual-catalog] Template SVG assets/svg/template-pie-donut.svg for "pie" matches only 0/2 required catalog legend node labels (of 4 legend entries).
  - *Evidence:* diagram-labels-legend-gap key=pie svg=assets/svg/template-pie-donut.svg matched=0 required=2 url=http://127.0.0.1:60577/
- **warn** [visual-catalog] Template SVG assets/svg/template-radar.svg for "radar" matches only 1/2 required catalog legend node labels (of 3 legend entries).
  - *Evidence:* diagram-labels-legend-gap key=radar svg=assets/svg/template-radar.svg matched=1 required=2 url=http://127.0.0.1:60577/
- **warn** [visual-catalog] Template SVG assets/svg/template-waterfall.svg for "waterfall" matches only 2/3 required catalog legend node labels (of 5 legend entries).
  - *Evidence:* diagram-labels-legend-gap key=waterfall svg=assets/svg/template-waterfall.svg matched=2 required=3 url=http://127.0.0.1:60577/
- **warn** [readability] Raw hex color #6b7280 is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens.
  - *Evidence:* raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".st-queued" property=background hex=#6b7280 url=http://127.0.0.1:60577/
- **warn** [readability] Raw hex color #2563eb is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens.
  - *Evidence:* raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".st-running" property=background hex=#2563eb url=http://127.0.0.1:60577/
- **warn** [readability] Raw hex color #b91c1c is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens.
  - *Evidence:* raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".st-failed" property=background hex=#b91c1c url=http://127.0.0.1:60577/
- **warn** [readability] Raw hex color #a16207 is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens.
  - *Evidence:* raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".st-cancelled" property=background hex=#a16207 url=http://127.0.0.1:60577/

_Top ten preview; **21 findings** flattened in `audit-report.md` → **All findings this run** Major+ crawl governor **was off** (`--breadth-crawl`)._

### Candidate content paths (inventory)

- `docs/ascii-to-ks-diagrams.md`
- `docs/BACKLOG-layouts-components.md`
- `docs/design/catalog/chrome/Kbc-doc-breadcrumb.md`
- `docs/design/catalog/chrome/Kco-doc-offcanvas.md`
- `docs/design/catalog/chrome/Kpn-product-primary-nav.md`
- `docs/design/catalog/chrome/Ksf-site-footer.md`
- `docs/design/catalog/chrome/Ksr-doc-sidebar.md`
- `docs/design/catalog/chrome/Ktx-doc-toc-sidebar.md`
- `docs/design/catalog/components/Kpr-fam-python-renderers.md`
- `docs/design/catalog/consumer-site-hash-verification.md`
- `docs/design/catalog/contract-template.md`
- `docs/design/catalog/desktop-interfaces/Msm-museum-studio.md`
- `docs/design/catalog/diagrams/Ksv-fam-svg.md`
- `docs/design/catalog/interactions/Ksj-fam-scripts.md`
- `docs/design/catalog/layouts/Chp-layout-chapter.md`
- `docs/design/catalog/layouts/Gly-layout-gallery.md`
- `docs/design/catalog/layouts/Hbk-layout-handbook.md`
- `docs/design/catalog/layouts/Ldg-layout-landing.md`


## Quantitative metrics (per URL)

| URL | Score | Maj+ | Sub-maj | H1 words | H1 preview | Words (sample) | Trust terms | Ecosystem terms | Header nav links | Sidebar/offcanvas links | Handbook chrome hits |
|-----|-------|-----|---------|----------|-----------|----------------|-------------|-----------------|----------|------------|------------------------|
| http://127.0.0.1:60577/ | 20 | 2 | 19 | 4 | Govern delivery with evidence | 95 | 14 | 7 | 2 | 0 | 0 |

Static-only audits use repo-derived text samples; re-run with `--site` for live DOM, homepage-shell sidebar metrics, and screenshots.

## Files in this folder

| File | Role |
|------|------|
| `audit-report.md` | Full heuristic table and evidence |
| `00-master-remediation-sequence.md` | Sequence and constraints |
| `01`–`10` | Defect remediation prompts (ordered by estimated score impact) |
