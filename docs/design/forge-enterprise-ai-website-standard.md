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
updated: 2026-05-17
---

## V2 homepage shell — canonical addendum

This document remains the umbrella standard. Stricter homepage shell rules, first-screen budgets, page-mode taxonomy, Platform root requirements, and screenshot acceptance criteria live in **[forge-enterprise-ai-website-standard-v2-addendum.md](forge-enterprise-ai-website-standard-v2-addendum.md)**. Treat that addendum as **normative for public Forge homepages** when it conflicts with looser wording here.

Synopsis:

- Public product homepages **must not** use a generated handbook shell as the dominant first-screen experience (no full docs sidebar/nav tree before the hero).
- Intentionally pick a **page mode** (landing vs guide vs reference vs maintainer handbook); **`platform.forgesdlc.com` `/` must stay mode 1 (landing)** even when the repo also ships deep handbook routes.
- Enforce curated top nav + landing modules first; relocate full docs trees behind `/handbook`, `/docs`, `/reference`, or `/operate`-style routes.

---

# Forge enterprise AI website standard

## Purpose

All public Forge websites should feel bold, spacious, enterprise-ready, AI-enabled, and easy to understand. A first-time visitor should understand what the product is, what it does, who it is for, why it is trustworthy, and what to do next before encountering dense implementation details.

This standard is designed to be stored in the knowledge store and reused by any Forge website or AI coding agent.

## Core principle

Lead with the human outcome, show the governed agentic system, and reveal technical depth only when the user asks for it.

Forge should not feel like a generated documentation tree. It should feel like a coherent enterprise product ecosystem whose details remain available behind clear paths.

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

## Automation hook: Forge Website UX Auditor

The reusable auditor lives in the KS tools folder:

```text
ks/tools/website-ux-auditor/analyze-website-ux.mjs
```

Use it to inspect a website repository and a running local or deployed URL against this standard. The auditor does not edit code. It generates an audit report and ordered Cursor-ready remediation plans under `.cursor/plans/forge-ux-remediation/`.

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

The generated plan sequence is intentionally tree-like: foundation plans first, then information architecture and content depth, then trust/visual polish, then final QA. This keeps broad website changes reviewable and reduces the risk of one large uncontrolled patch.
