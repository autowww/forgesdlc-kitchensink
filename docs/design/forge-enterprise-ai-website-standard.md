---
id: forge.enterprise-ai-website-standard
kind: design-principle
status: draft
owner: Forge UX
applies_to:
  - forgesdlc.com
  - lcdl.forgesdlc.com
  - fleet.forgesdlc.com
  - lenses.forgesdlc.com
  - platform.forgesdlc.com
aliases:
  - Forge public website standard
  - Forge enterprise AI UX standard
  - Forge landing page principle
updated: 2026-05-18
---

**Canonical document.** All homepage shell rules, first-screen budgets, page-mode taxonomy, Platform root requirements, product-story contracts, and screenshot acceptance criteria live **in this file**. The historical companion file [`forge-enterprise-ai-website-standard-v2-addendum.md`](forge-enterprise-ai-website-standard-v2-addendum.md) is a short redirect stub for existing links.

# Forge enterprise AI website standard

## Purpose

All public Forge websites should feel bold, spacious, enterprise-ready, AI-enabled, and easy to understand. A first-time visitor should understand what the product is, what it does, who it is for, why it is trustworthy, and what to do next before encountering dense implementation details.

This standard is designed to be stored in the knowledge store and reused by any Forge website or AI coding agent.

## Core principle

Lead with the human outcome, show the governed agentic system, and reveal technical depth only when the user asks for it.

Forge should not feel like a generated documentation tree. It should feel like a coherent enterprise product ecosystem whose details remain available behind clear paths.

## Product Story Contract (Linear benchmark)

Public product homepages should mirror a **short enterprise product story**, not a documentation cover page. Use this structure:

1. **Category hero** — A tight line that states what category the product lives in and the outcome (compare: a short hero label + headline, not a README title).
2. **Immediate product/system visual** — Before the visitor reads long copy, show **one** primary visual in the hero band: product screenshot, architecture diagram, or governed flow. Icons alone do not satisfy the **Product Visual Requirement** below.
3. **Staged workflow story** — After the hero, reveal **how work flows** in discrete stages (steps, lanes, or cards). Prefer “intent → structure → execution → review → evidence” language adapted per product.
4. **AI as a real workflow capability** — AI or agents must appear as **steps, boundaries, or controls** in that workflow (delegation, review gates, contracts), not as a vague “AI-powered” badge without system placement.
5. **Proof and trust after the product promise** — Social proof, boundaries, ecosystem fit, and trust modules come **after** the visitor understands what the product **does**. Do not open with maintainer evidence, ADR trees, or compliance-adjacent walls before the promise.

**Forbidden:** Docs-first dominance — handbook framing, generated chapter lists, or sidebar indexes that occupy the first screen ahead of the landing story.

## Root Homepage Shell Contract

**Landing/product shell (required on `/`):**

- Full-width hero band with headline, subhead, CTA pair, and **hero-scale visual slot** (see Product Visual Requirement).
- Curated top navigation only on the root first screen — no persistent full documentation sidebar on desktop homepage view.
- Full handbook/reference trees live under **`/docs`**, **`/handbook`**, **`/reference`**, **`/operate`**, or equivalent deep routes — not on the root first screen.

**Docs/handbook shell (not allowed as the root `/` experience for public Forge product sites):**

- Generated multi-level docs nav or sidebar visible **before** the main hero story.
- “Handbook”, “Chapters”, exhaustive docs trees, or maintainer indexes acting as the dominant chrome on `/`.

**Verification:** Ask whether a screenshot of `/` at desktop width reads as **product/architecture landing** or **documentation reader**. If the latter, the shell is wrong regardless of hero copy quality.

**Forge Platform:** The root homepage must use **mode 1 — public landing page** (see Page mode taxonomy). Full handbook navigation belongs under **Docs / Handbook / Reference**, not the root first screen.

## Public homepage shell rule

A public Forge homepage must not use a generated handbook shell as its primary first-screen experience.

**Required:**

- No persistent full documentation sidebar on public homepage desktop view.
- No generated documentation tree before the hero.
- No duplicated desktop/mobile nav trees exposed before the main story.
- No “Handbook”, “Product-agnostic”, “Chapters”, “Docs tree”, “ADR”, “Evidence”, or “Sprints” framing above the hero unless the page is explicitly a docs/handbook page.
- Homepage layout should use a landing/product shell with full-width hero, curated top nav, short product-local nav, visual slot, outcome cards, ecosystem strip, and trust block.

**Allowed:**

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

## Product Visual Requirement

The homepage **`main`** column must include **at least one hero-scale visual** in the first viewport:

- **Qualifying:** `img` (product screenshot or illustration), meaningful inline `svg` diagram/flow (minimum rendered size roughly **240×160 CSS px or larger** in the hero band), `video`, or `canvas` used as a product/system diagram.
- **Not sufficient alone:** Favicon-sized images, inline icons, decorative glyphs, or logos without a system/product diagram.

This requirement exists so teams cannot pass UX review by rewriting Markdown while leaving a text-only or docs-shaped shell.

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

## Universal storyline

Use this storyline across the Forge ecosystem, then adapt the product-specific middle section.

1. Software delivery has changed: humans now work with AI agents and automation.
2. The bottleneck is not just writing code faster. The bottleneck is clear intent, safe delegation, reviewable execution, and evidence.
3. Forge creates a governed spine from intent to execution: intent -> structured work -> human or agent execution -> review -> evidence -> release.
4. Each product owns one layer of that system.
5. Teams can move faster without losing judgment, ownership, traceability, or control.

## Master message

Forge helps teams govern software delivery in the age of AI agents.

Expanded message:

Forge turns intent into structured, traceable execution across humans, tools, and agents, so teams can move faster without losing judgment, ownership, or control.

## Product one-liners

- ForgeSDLC: The methodology for governed human + agent software delivery.
- Forge Lenses: A local-first control plane for inspecting and guiding Forge workspaces.
- Forge LCDL: A governed task layer for reliable LLM calls in Python systems.
- Forge Fleet: A controlled job execution plane for automations on infrastructure you own.
- Forge Platform: The integrated architecture that connects methodology, workspace visibility, governed reasoning, and controlled execution.

## Product-specific homepage contracts

Each site inherits the **Product Story Contract**, **Root Homepage Shell Contract**, **Public homepage shell rule**, **First-screen budget**, and **Product Visual Requirement**. Below: promised visitor outcome and the **preferred staged story** (adapt headings/visuals; keep order: promise → visual → workflow → AI capability → trust/proof).

### ForgeSDLC (`forgesdlc.com`)

- **Promise:** Govern software delivery across humans and AI agents.
- **Story:** Intent → structured work → human or agent execution → review → evidence → release.
- **Hero:** Methodology lens — outcomes for leaders, architects, and teams adopting governed delivery.

### Forge LCDL (`lcdl.forgesdlc.com`)

- **Promise:** Build governed LLM tasks into Python systems.
- **Story:** Contract → schema → model call → validation/repair → typed result → reviewable outcome.
- **Hero:** Engineers and reviewers see **tasks as components**, not prompt blobs.

### Forge Fleet (`fleet.forgesdlc.com`)

- **Promise:** Run controlled automation jobs on infrastructure you own.
- **Story:** Request → job template → containerized execution → logs/status → audit trail.
- **Hero:** Operators see **bounded execution** and ownership of the plane.

### Forge Lenses (`lenses.forgesdlc.com`)

- **Promise:** See and govern your Forge workspace locally.
- **Story:** Workspace → dashboard → health signals → guided action → optional Fleet/LLM integrations.
- **Hero:** Local-first control plane — workspace visibility before deep integrations.

### Forge Platform (`platform.forgesdlc.com`)

- **Promise:** Connect governed delivery from intent to execution.
- **Story:** Methodology → workspace visibility → governed reasoning → controlled execution → evidence.
- **Root `/` must be mode 1.** Full handbook chrome belongs on deeper routes only.
- **Must show on the root homepage:** one-sentence Platform definition; Forge layer map (ForgeSDLC, Lenses, LCDL, Fleet, Blueprints, Platform); intent-to-evidence flow; trust/boundary block; role paths; maintainer/docs CTA (compact).
- **Must not show before product explanation:** full generated sidebar; ADR, sprint, evidence, prompt, or maintainer-operation trees; repository thesis or maintainer setup as standalone first-screen sections.

## Landing page anatomy

Use this structure for public homepages and product overview pages:

1. Hero
   - One clear headline.
   - One explanatory subhead.
   - One primary CTA and one secondary CTA.
   - One product visual or system diagram.
2. Outcome cards
   - Three cards maximum above the fold or near the top.
   - Each card should name a user outcome, not an internal mechanism.
3. How it works
   - A simple flow diagram with 4 to 6 steps.
   - Avoid implementation details unless they are essential to trust.
4. Who it is for
   - Role-based paths: leader, architect, engineer, operator, agent builder, security reviewer.
5. Trust model
   - Data boundary.
   - Execution boundary.
   - Human approval point.
   - Audit or evidence trail.
   - Explicit unsupported or out-of-scope cases.
6. Ecosystem fit
   - Show how the product relates to ForgeSDLC, Lenses, LCDL, Fleet, Platform, and Blueprints.
7. Final CTA
   - One action for new users.
   - One action for technical users.

## Visual acceptance and screenshot-based review

### General (desktop and mobile)

A public homepage should pass a screenshot review:

- The first screen is recognizable as a **product/architecture landing** page, not a documentation reader.
- The hero occupies the **visual center** of the page.
- The primary CTA is **visually dominant**.
- The main visual explains **product shape**: screenshot, system diagram, or governed flow.
- Sections use generous vertical rhythm; dense nav/link clusters do not dominate the page.
- Cards contain short **outcome-led** headings, not mechanism-first labels.

### Desktop capture (reference viewport ~1440×1000)

- Full-page capture should show landing chrome: hero + visual + staged sections; **no** full docs sidebar eating the first column.
- Use auditor output **`screenshots/01-*.png`** (or equivalent) when validating remediations.

### Mobile capture (reference viewport ~390×844)

- First screen shows headline, subhead, primary CTA, and **cropped but visible** hero visual — not a duplicated docs tree occupying the sheet.
- Hamburger/offcanvas may hold deeper links; it must not replace the landing story with a handbook index on load.
- Use auditor output **`screenshots/00-mobile-*.png`** when present.

## Page length and depth limits

Landing pages should be short enough to scan quickly.

Recommended limits:

- Hero headline: 4 to 9 words.
- Hero subhead: 18 to 36 words.
- Visible sections on landing page: 5 to 7.
- Cards per row: 3 maximum.
- Paragraphs per section: 1 to 2.
- Bullets per card: 3 maximum.
- Homepage body copy target: 700 to 1,200 words.
- Technical reference belongs in Docs, Reference, Operate, or Handbook pages, not in the public hero flow.

## Messaging rules

Always answer these five questions near the top of every major page:

1. What is this?
2. Who is it for?
3. What problem does it solve?
4. Why should I trust it?
5. What should I do next?

Prefer:

- Governed delivery
- Human-owned judgment
- Agent-ready execution
- Reviewable outcomes
- Traceable decisions
- Local-first control
- Infrastructure you own
- Contracts, evidence, boundaries

Avoid as primary messaging:

- Generic "AI-powered" claims without concrete control points.
- Long lists of endpoints, scripts, schemas, submodules, or generated files.
- Deep internal vocabulary before the user understands the product.
- Dense comparisons that require the user to already know Forge terminology.
- Multiple competing CTAs in the hero.

## Information architecture rules

Use two layers:

1. Product layer
   - Overview
   - How it works
   - Use cases
   - Trust
   - Docs
   - Ecosystem
2. Technical layer
   - Quickstart
   - Guides
   - API or CLI reference
   - Operations
   - Schemas
   - Maintainer notes

Navigation should be curated, not exhaustive. Avoid showing the full generated documentation tree in the global header or homepage.

Recommended global Forge ecosystem nav:

- ForgeSDLC
- Lenses
- LCDL
- Fleet
- Platform
- Blueprints

Recommended product-local nav:

- Overview
- How it works
- Trust
- Quickstart
- Docs

## Visual design principles

The visual language should communicate calm enterprise confidence.

Use:

- Large hero type.
- Spacious sections.
- High contrast.
- Fewer cards with stronger content.
- Product screenshots where real UI exists.
- Simple architecture diagrams where UI is not enough.
- Clear hierarchy between overview, guide, and reference content.
- Subtle AI signals: flows, nodes, decision gates, evidence trails, bounded agents.

Avoid:

- Decorative AI gimmicks.
- Overloaded grids.
- Long sidebars on marketing pages.
- Tables above the fold.
- Documentation dumps on homepages.
- Tiny type, low contrast, and weak CTA hierarchy.

## Trust block template

Every site should include a concise trust block.

Title: Designed for governed adoption

Recommended rows:

- Data boundary: where data stays by default.
- Execution boundary: what runs locally, remotely, or on owned infrastructure.
- Human control: where approval, review, or ownership happens.
- Evidence: what is logged, validated, or reviewable.
- Admin/operator control: what can be configured or disabled.
- Out of scope: what the product is not meant to do.

## Translation rules for technical language

Use technical language only after a plain-language explanation.

Examples:

- Bearer-aware HTTP control plane -> Token-protected job control plane.
- docker_argv jobs -> Containerized jobs.
- SQLite-backed -> Local job history.
- Schema sidecars -> Versioned output contracts.
- Deterministic operators -> Predictable workflow control.
- Governed synchronous LLM tasks -> Reviewable LLM calls in production code.
- Agent workcells -> Bounded agent execution units.

## Required reusable sections

Each product site should include:

1. A product one-liner.
2. A "what it does" section with 3 outcomes.
3. A "how it works" flow diagram.
4. A "where it fits in Forge" ecosystem strip.
5. A trust model block.
6. A short first action for new users.
7. A deeper path for technical users.

## Anti-patterns

Do not:

- Start a homepage with a documentation index.
- Make users learn internal vocabulary before understanding the product.
- Put install scripts, endpoint lists, schema directories, or submodule notes in the hero path.
- Treat every page as a handbook page.
- Let generated navigation dominate the first screen.
- Use more than two CTA levels on one screen.
- Hide security, data, or execution boundaries.

## Agent implementation rules

When an AI coding agent modifies a Forge website:

1. Preserve canonical technical content by moving it to the right depth instead of deleting it.
2. Do not invent product capabilities, integrations, certifications, customers, compliance claims, or metrics.
3. Use product-specific truth from the repo as the source of record.
4. Prefer small, reviewable page and component changes.
5. Keep marketing pages short and direct.
6. Keep docs pages complete and precise.
7. Add redirects or cross-links when moving content.
8. Validate navigation, links, responsive layout, and accessibility.
9. Provide a change summary grouped by user-facing impact.

## Acceptance checklist

A Forge website passes this standard when:

- A new visitor can explain the product in one sentence after 10 seconds.
- The homepage has one dominant promise.
- Technical detail is discoverable but not forced.
- The site shows the product's trust model.
- The site shows where the product fits in the Forge ecosystem.
- The site has no long generated link walls on the primary landing page.
- CTAs are clear and role-appropriate.
- Copy is outcome-led before it becomes mechanism-led.
- Visual hierarchy feels spacious and enterprise-grade.
- Accessibility basics are respected, including readable contrast, keyboard-friendly navigation, semantic headings, and visible focus states.

**Homepage-specific bar (merged normative checks):**

- The root first screen is **landing/product mode**, not handbook/reference mode.
- Generated documentation navigation is **not** visible before the hero.
- The first screen has **one** product promise, **one** subhead, **one** primary CTA, **one** secondary CTA, and **one** qualifying visual or diagram (Product Visual Requirement).
- Trust and ecosystem fit appear **after** the core product story, as designed modules.
- Desktop and mobile screenshots confirm spacious enterprise hierarchy.

## Automation hook: Forge Website UX Auditor

The reusable auditor lives in the KS tools folder:

```text
ks/tools/website-ux-auditor/analyze-website-ux.mjs
```

Use it to inspect a website repository and a running local or deployed URL against this standard. The auditor does not edit code. It generates an audit report and ordered Cursor-ready remediation plans under `.cursor/plans/forge-ux-remediation`.

Recommended workflow:

1. Run the website locally.
2. Run the auditor with the correct `--site-kind`.
3. Open `.cursor/plans/forge-ux-remediation/00-master-remediation-sequence.md` in Cursor.
4. Execute child plans in numeric order, preferably one plan at a time.
5. Re-run the auditor after changes and compare the report.

Example:

```bash
node ks/tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --site http://localhost:3000 \
  --standard ks/forge-enterprise-ai-website-standard.md \
  --site-kind lenses \
  --out .cursor/plans/forge-ux-remediation \
  --install-rule
```

The generated plan sequence is intentionally tree-like: foundation plans first, then shell/layout separation before hero copy, then information architecture and content depth, then trust/visual polish, then final QA. This keeps broad website changes reviewable and reduces the risk of one large uncontrolled patch.
