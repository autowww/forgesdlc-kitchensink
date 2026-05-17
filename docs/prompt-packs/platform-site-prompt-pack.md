# Platform site prompt pack

Target site: `platform.forgesdlc.com`

## Shell and routing

- **Public root `/`** must use **page mode 1** ([v2 addendum](../design/forge-enterprise-ai-website-standard-v2-addendum.md)): product/landing shell, **curated top nav only** — no full generated handbook sidebar or ADR/Sprints/Evidence tree as the dominant first-screen chrome.
- Move the **generated handbook** (chapters, docs index, maintainer operations) under deep routes such as `/handbook`, `/docs`, `/reference`, or `/maintainer`. The homepage surfaces a **Docs/Handbook** CTA and maybe a **For maintainers** card — not the full tree before the hero.
- **Desktop home:** no persistent full documentation rail beside the hero; use full-width landing sections (hero, outcomes, layer map, trust block, role paths, final CTA). See the v2 addendum for first-screen budgets and screenshot acceptance.

## Site role

Platform should be the ecosystem architecture layer of Forge. It should explain how methodology, workspace visibility, governed reasoning, controlled execution, and reusable practice knowledge fit together.

## Primary UX goal

Make Platform understandable as a public ecosystem/product architecture page, not an internal maintainer handbook. Keep canonical Markdown, submodules, generator scripts, repo thesis, and maintainer operations in a deeper Maintainer or Architecture docs area.

## Target storyline

Agentic delivery needs more than a methodology and more than individual AI tools. Teams need a connected operating layer: a method for shaping work, a local view of workspace state, a governed way to call LLMs, a controlled way to run jobs, and a body of reusable practice knowledge. Forge Platform connects those layers.

Recommended narrative arc:

1. AI-assisted delivery fails when tools, docs, agents, and automation are disconnected.
2. Forge Platform gives the ecosystem a coherent operating architecture.
3. Each product owns a layer: ForgeSDLC, Lenses, LCDL, Fleet, Blueprints, and Platform glue.
4. The architecture keeps humans in control while giving agents clearer context and boundaries.
5. Technical maintainers can still access canonical repo docs, generation scripts, schemas, and submodule guidance deeper in the site.

## Recommended product one-liner

Forge Platform is the integrated architecture for methodology, workspace visibility, governed reasoning, and controlled execution.

## Homepage hero direction

Headline options:

- A governed platform for human + agent delivery.
- The operating architecture for Forge delivery.
- Connect methodology, agents, and execution.

Preferred subhead:

Forge Platform connects the layers teams need for agentic delivery: methodology, workspace visibility, governed LLM tasks, controlled job execution, and reusable practice knowledge.

Primary CTA:

- Explore the architecture

Secondary CTA:

- Open maintainer docs

## Recommended homepage structure

1. Hero
   - Explain Platform as the ecosystem architecture.
   - Visual: ForgeSDLC -> Lenses -> LCDL -> Fleet -> Blueprints -> Evidence/Delivery.
2. Why Platform
   - AI tools create speed but also fragmentation.
   - Platform connects method, context, execution, and evidence.
3. The Forge layers
   - ForgeSDLC: methodology.
   - Lenses: workspace visibility.
   - LCDL: governed reasoning.
   - Fleet: controlled execution.
   - Blueprints: practice knowledge.
   - Platform: integration architecture and conventions.
4. How the system works
   - Human intent.
   - Structured workspace.
   - Agent-ready tasks.
   - Governed LLM calls.
   - Controlled jobs.
   - Evidence and review.
5. Trust model
   - Human ownership remains explicit.
   - Integrations have boundaries.
   - Technical details remain inspectable.
   - Maintainer paths are separated from product overview.
6. Role paths
   - Executive sponsor.
   - Platform architect.
   - Engineering lead.
   - Maintainer.
   - Agent builder.
7. Maintainer path
   - Link canonical Markdown, submodule, generator, schema, and release docs, but do not make them the homepage story.
8. Final CTA
   - Explore architecture.
   - Open maintainer docs.

## Content to move deeper

Move or keep outside the homepage:

- Canonical Markdown instructions.
- Submodule refresh instructions.
- Generator scripts.
- Schema internals.
- Repo bootstrap commands.
- Maintainer-only release steps.
- Internal repository thesis language.

Do not delete. Move to Maintainer docs, Architecture reference, or Repository operations pages.

## Prompt 1 - discovery and plan

```text
You are improving platform.forgesdlc.com using the Forge enterprise AI website standard.

Inspect the repo, homepage, architecture docs, maintainer docs, nav, generation scripts references, schema pages, and ecosystem links. Do not edit yet.

Produce a plan that identifies:
1. Homepage entry file(s).
2. Header/footer/nav files.
3. Maintainer docs pages or pages that can receive internal operations content.
4. Current sections that feel internal-first rather than public/product-first.
5. Existing architecture or ecosystem diagrams that can be reused.
6. Build/test commands.

Use this target storyline:
Forge Platform connects methodology, workspace visibility, governed LLM tasks, controlled job execution, and reusable practice knowledge into a coherent architecture for human + agent delivery.

Do not invent product capabilities, integrations, customer claims, certifications, or architecture that the repo does not support.
```

## Prompt 2 - homepage rewrite

```text
Implement a first-pass Platform homepage redesign.

Goal:
Make Platform feel like the clear ecosystem architecture page for Forge, not a maintainer handbook.

Use this page structure:
1. Hero
   - Headline: "A governed platform for human + agent delivery."
   - Subhead: "Forge Platform connects the layers teams need for agentic delivery: methodology, workspace visibility, governed LLM tasks, controlled job execution, and reusable practice knowledge."
   - Primary CTA: "Explore the architecture"
   - Secondary CTA: "Open maintainer docs"
   - Visual: ForgeSDLC -> Lenses -> LCDL -> Fleet -> Blueprints -> Evidence/Delivery.
2. Why Platform
   - Explain that AI tools create speed but also fragmentation.
   - Platform connects method, context, execution, and evidence.
3. The Forge layers
   - Cards for ForgeSDLC, Lenses, LCDL, Fleet, Blueprints, Platform.
4. How it works
   - Human intent -> structured workspace -> governed reasoning -> controlled execution -> review/evidence.
5. Trust and boundaries
   - Humans own judgment.
   - Integrations have explicit boundaries.
   - Technical details are inspectable.
   - Maintainer operations are separated from product overview.
6. Role paths
   - Executive sponsor, platform architect, engineering lead, maintainer, agent builder.
7. Maintainer path
   - Link canonical Markdown, generators, submodules, schemas, and repo operations from a dedicated Maintainer card.
8. Final CTA
   - "Explore architecture" and "Open maintainer docs".

Constraints:
- Do not lead with canonical Markdown, submodule, generator, schema, or repo bootstrap details.
- Preserve all internal technical content by moving/linking it.
- Do not invent product claims or ecosystem relationships not present in docs.
- Keep the landing page concise.

After editing, summarize changed files and moved content.
```

## Prompt 3 - ecosystem architecture visual

```text
Create or improve the Platform ecosystem architecture visual.

The visual should show:
- ForgeSDLC as the methodology layer.
- Lenses as workspace visibility/control plane.
- LCDL as governed LLM task layer.
- Fleet as controlled execution layer.
- Blueprints as reusable practice knowledge.
- Platform as the integration architecture/conventions tying the layers together.
- Evidence/review as the delivery outcome.

Rules:
- Keep the diagram simple and readable.
- Use existing design tokens/styles.
- Add meaningful alt text.
- Do not imply integrations or data flows that are not supported by docs.
- Provide a text fallback for screen readers.
```

## Prompt 4 - maintainer docs separation

```text
Separate public Platform positioning from maintainer documentation.

Tasks:
1. Identify homepage content that is maintainer-only: canonical Markdown rules, submodule refresh, generation scripts, schemas, repo operations, bootstrap commands.
2. Move or link this content under a dedicated Maintainer docs area.
3. Add a homepage card called "For maintainers" that points to that area.
4. Keep public architecture sections short and user-facing.
5. Ensure no canonical instructions are lost.
6. Add redirects or cross-links if URLs change.

The homepage should explain the platform; maintainer docs should explain how to operate the repo.
```

## Prompt 5 - nav and IA cleanup

```text
Clean up Platform navigation for a public enterprise architecture site.

Target nav:
- Overview
- Architecture
- Forge layers
- Trust model
- Maintainer docs
- Ecosystem

Tasks:
1. Reduce any global link wall.
2. Move generated indexes deeper.
3. Keep architecture and maintainer docs reachable.
4. Add ecosystem links to ForgeSDLC, Lenses, LCDL, Fleet, and Blueprints.
5. Use user-facing labels before repo-internal labels.
6. Verify mobile nav.
```

## Prompt 6 - QA

```text
Run QA for platform.forgesdlc.com after UX changes.

Check:
1. First screen explains Platform as the Forge ecosystem architecture.
2. Homepage no longer opens with maintainer/repo operations detail.
3. Maintainer content remains reachable.
4. Layer descriptions are accurate and not overclaimed.
5. Architecture diagram does not imply unsupported integrations.
6. CTAs resolve.
7. Navigation and mobile layout work.
8. Headings, focus states, contrast, and alt text are acceptable.
9. No unsupported security, compliance, customer, or metric claims were added.

Fix verifiable issues and summarize final changes.
```
