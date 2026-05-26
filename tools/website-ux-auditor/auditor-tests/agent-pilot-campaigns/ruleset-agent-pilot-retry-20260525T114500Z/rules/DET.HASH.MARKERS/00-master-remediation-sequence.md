---
title: 00 - Master remediation sequence
kind: cursor-remediation-plan
order: 0
product: Forge website
generated_at: 2026-05-25T13:42:28.361Z
audit_run_id: 1155752f1b60c456
---

# 00 - Master remediation sequence

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


**Repo-level Build plan:** [`../forge-platform-ux-remediation.plan.md`](../forge-platform-ux-remediation.plan.md) — open from `.cursor/plans/` when this file exists (Forge Platform handbook workflow).

**Same-folder Build:** [`forge-ux-remediation.plan.md`](./forge-ux-remediation.plan.md)

> **Shell before copy:** when audits show `homepage-shell`, `product-visual`, or `storyline-flow` findings, complete **02 - Homepage shell** before **03 - Homepage storyline**.

## How to use this plan set

This folder contains ordered remediation plans generated from a deterministic UX audit.

## Prefer root-cause, sitewide fixes

Many findings repeat across URLs because they share one **upstream lever**: a static-site **generator**, a **layout/shell** template, **global CSS** or design-system tokens, a **navigation** component or data file, or a **content-map** rule. Use **01** (inventory + `content-map.md`) and clusters in `audit-report.md` to infer that lever, then fix it there so the **entire site** inherits the improvement. Treat page-level Markdown or HTML tweaks as a last resort when the signal is truly local.

## Plan–Do–Check–Adjust until acceptance

Each defect plan (`01-defect-*.md`) is one **Plan** slice. **Do** the smallest coherent root-cause change set for that defect cluster. **Check** with local build/serve and a fresh scorer+audit pass. **Adjust**: if checks fail, Major+ remains, or acceptance criteria below are not met, revisit that same defect plan with an updated root-cause hypothesis and repeat **Do→Check→Adjust** before moving forward. Automated **`run-website-ux-remediation-loop.sh`** (scorer→audit→agent until the default **quality gate** passes on **visited** pages—default caps **0/0/0/5/10/15/100** per severity) is an extra **Check** pass—it does not replace product acceptance or fixes on URLs the crawl never reached.

### Controlled workflow

Run one child plan at a time in Cursor Plan Mode, review the plan, build it, test it, then continue to the next plan.

### One-shot workflow

Ask Cursor Agent to read this master plan and execute child plans in order. This can work for smaller repos, but the controlled workflow is safer for public website redesigns.

## Plan tree

- [ ] **Defect-first remediation** (top 8/10)
  - [ ] 01 - product-visual (first-screen) · est Δ +4.00 · 1 URL(s)
  - [ ] 02 - design-rule-runtime (readability) · est Δ +10.00 · 1 URL(s)
  - [ ] 03 - design-rule-runtime (visual-catalog) · est Δ +4.00 · 1 URL(s)
  - [ ] 04 - cta-trust-ecosystem (conversion) · est Δ +2.00 · 1 URL(s)
  - [ ] 05 - metadata-a11y (metadata) · est Δ +2.00 · 1 URL(s)
  - [ ] 06 - cta-trust-ecosystem (ecosystem) · est Δ +2.00 · 1 URL(s)
  - [ ] 07 - readability-structure (messaging) · est Δ +1.00 · 1 URL(s)
  - [ ] 08 - design-rule-runtime (informationArchitecture) · est Δ +0.00 · 1 URL(s)

## Execution prompt for Cursor

Read every file in `.cursor/plans/forge-ux-remediation/`, starting with this file. Execute the child plans in numeric order. After each defect plan, summarize files changed, UX impact, remaining risks, validation performed, and whether **Check** (build, scorer delta, and audit delta) passes or you must **Adjust** by iterating the same defect plan before continuing. Stop before making risky product-claim changes that are not supported by existing repo content.

## Final acceptance criteria

- A first-time visitor can explain the product in one sentence after the first screen.
- Homepage has one dominant promise, one primary CTA, and one secondary CTA.
- Technical details are discoverable but not forced into the hero path.
- The site clearly shows what the product does, who it is for, where it fits in Forge, and why it is trustworthy.
- Navigation is curated, not a generated link wall.
- Visual hierarchy feels spacious, bold, AI-enabled, and enterprise-ready.
- Build, links, responsive layout, and accessibility checks pass or have documented exceptions.
