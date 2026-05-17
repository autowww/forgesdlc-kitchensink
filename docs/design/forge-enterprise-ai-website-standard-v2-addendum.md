---
id: forge.enterprise-ai-website-standard.v2-addendum
kind: design-principle-addendum
status: draft
owner: Forge UX
updated: 2026-05-17
applies_to:
  - forgesdlc.com
  - lcdl.forgesdlc.com
  - fleet.forgesdlc.com
  - lenses.forgesdlc.com
  - platform.forgesdlc.com
---

# Forge enterprise AI website standard — v2 addendum

This addendum tightens the original standard so agents cannot satisfy the UX goal with copy changes while leaving a generated handbook shell in place.

## Public homepage shell rule

A public Forge homepage must not use a generated handbook shell as its primary first-screen experience.

Required:

- No persistent full documentation sidebar on public homepage desktop view.
- No generated documentation tree before the hero.
- No duplicated desktop/mobile nav trees exposed before the main story.
- No “Handbook”, “Product-agnostic”, “Chapters”, “Docs tree”, “ADR”, “Evidence”, or “Sprints” framing above the hero unless the page is explicitly a docs/handbook page.
- Homepage layout should use a landing/product shell with full-width hero, curated top nav, short product-local nav, visual slot, outcome cards, ecosystem strip, and trust block.

Allowed:

- A compact “Docs” or “Handbook” CTA.
- A “For maintainers” card later on the page.
- Full generated navigation only inside `/docs`, `/handbook`, `/reference`, `/operate`, or equivalent routes.

## First-screen budget

For public homepages at desktop width:

- Hero headline: 4–9 words.
- Subhead: 18–36 words.
- Total visible first-screen narrative copy: 80–140 words, excluding navigation labels.
- CTA count: exactly one primary and at most one secondary CTA.
- Visible navigation choices before the hero: 4–7 top-level choices.
- Visible links before the first H2: maximum 10, excluding skip links and theme controls.
- No code, table, endpoint, schema, sprint, ADR, evidence, or maintainer-operation links before the first product explanation.

## Page mode taxonomy

Use one of these modes intentionally.

### 1. Public landing page

Goal: explain product value quickly.

Shell: product/landing shell.

Navigation: curated top nav only.

Content: hero, outcomes, how it works, trust, ecosystem, CTA.

### 2. Product guide page

Goal: help a user complete a task.

Shell: guide/docs shell permitted.

Navigation: local guide nav.

Content: steps, examples, troubleshooting.

### 3. Reference page

Goal: precise technical lookup.

Shell: docs/handbook shell permitted.

Navigation: full reference nav allowed.

Content: APIs, schemas, commands, definitions.

### 4. Maintainer handbook page

Goal: operate or maintain the repo/site.

Shell: handbook shell permitted.

Navigation: generated tree allowed.

Content: canonical Markdown, generation scripts, submodules, release steps.

The homepage of `platform.forgesdlc.com` must be mode 1, even if the same repo also publishes modes 2–4.

## Visual acceptance criteria

A public homepage should pass a screenshot review at desktop and mobile widths:

- The first screen is recognizable as a product/architecture landing page, not a documentation reader.
- The hero occupies the visual center of the page.
- The primary CTA is visually dominant.
- The main visual explains product shape: screenshot, system diagram, or governed flow.
- Sections use generous vertical rhythm; dense nav/link clusters do not dominate the page.
- Cards contain short outcome-led headings, not mechanism-first labels.

## Platform homepage requirements

Platform is allowed to be a handbook behind the scenes, but its public root must behave like an ecosystem architecture landing page.

Root homepage must show:

1. One-sentence definition of Platform.
2. Forge layer map: ForgeSDLC, Lenses, LCDL, Fleet, Blueprints, Platform.
3. Intent-to-evidence flow.
4. Trust/boundary block.
5. Role paths.
6. Maintainer/docs CTA.

Root homepage must not show:

- Full generated sidebar before hero.
- ADR, sprint, evidence, prompt, or maintainer-operation trees before product explanation.
- Repository thesis or maintainer setup as standalone homepage sections.

## Updated acceptance checklist

A Forge homepage does not pass until:

- The root first screen is landing/product mode, not handbook/reference mode.
- Generated documentation navigation is not visible before the hero.
- The first screen has one product promise, one subhead, one primary CTA, one secondary CTA, and one visual or diagram.
- Technical depth is reachable but not forced.
- Trust and ecosystem fit are visible as designed modules.
- Desktop and mobile screenshots confirm spacious enterprise hierarchy.
