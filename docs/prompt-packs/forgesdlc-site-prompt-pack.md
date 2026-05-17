# ForgeSDLC site prompt pack

Target site: `forgesdlc.com`

## Site role

ForgeSDLC is the methodology layer of the Forge ecosystem. It should explain how teams govern software delivery when humans work with AI agents.

## Primary UX goal

Make the site feel like a clear enterprise methodology product, not a long encyclopedia. The homepage should help a first-time visitor understand why ForgeSDLC exists, what it does, how it works, and where to go next.

## Target storyline

AI changes software delivery because agents can generate code, tests, specs, and docs faster than traditional process models expect. But speed does not remove human responsibility. ForgeSDLC gives teams a lean operating model where humans own intent, risk, judgment, and evidence while agents accelerate execution inside explicit boundaries.

Recommended narrative arc:

1. AI has changed execution speed.
2. The new bottleneck is governance, not typing.
3. ForgeSDLC creates a governed spine from intent to evidence.
4. Teams shape work into Sparks, use discipline Versonas when stakes warrant, inspect Charge state, and release through evidence-based decisions.
5. The result is faster delivery without losing accountability.

## Recommended product one-liner

ForgeSDLC is the methodology for governed human + agent software delivery.

## Homepage hero direction

Headline options:

- Govern software delivery across humans and AI agents.
- Human-owned delivery for the agentic era.
- Turn intent into governed agentic execution.

Preferred subhead:

ForgeSDLC helps teams shape intent, delegate safely, challenge AI output, and release with evidence, so speed does not come at the cost of judgment or control.

Primary CTA:

- Explore the methodology

Secondary CTA:

- See how agents fit

## Recommended homepage structure

1. Hero
   - Clear headline and subhead.
   - One visual: Intent -> Spark -> Charge -> Human/Agent execution -> Versona challenge -> Evidence -> Release.
2. Why now
   - Traditional delivery assumed human-only throughput.
   - AI changes execution, but not accountability.
3. How ForgeSDLC works
   - Ore/Idea -> Ingot/shape -> Spark -> Charge -> Versona challenge -> Ember log -> Assay gate.
   - Explain terms in plain language first.
4. What teams get
   - Clear intent.
   - Safer delegation.
   - Reviewable decisions.
   - Less process weight.
5. Who it is for
   - Engineering leaders.
   - Product and architecture leaders.
   - Teams using Cursor, Copilot, Windsurf, or autonomous agents.
   - Enterprises moving away from heavyweight process.
6. Trust model
   - Humans own binding decisions.
   - Versonas challenge outputs, not replace accountability.
   - Evidence gates protect release quality.
7. Ecosystem fit
   - Lenses shows workspace state.
   - LCDL governs LLM tasks.
   - Fleet runs controlled jobs.
   - Platform ties layers together.
   - Blueprints provide practice knowledge.
8. Final CTA
   - Start with What is ForgeSDLC.
   - Browse Blueprints.

## Content to move deeper

Move or keep outside the homepage:

- Long generated topic lists.
- Full methodology encyclopedia.
- Dense comparisons to every methodology.
- Deep Versona catalogs.
- Agent tasklet install commands.
- Auto-generated knowledge base indexes.

Do not delete these. Move them to Knowledge, Practice, Master, For Agents, or Docs pages and link from curated cards.

## Prompt 1 - discovery and plan

Paste into Cursor:

```text
You are improving forgesdlc.com using the Forge enterprise AI website standard.

First inspect the repository structure, homepage source, navigation components, generated docs/index pages, and any design system or template files. Do not edit yet.

Produce a concise implementation plan that identifies:
1. The homepage entry file(s).
2. The navigation/header/footer files.
3. Which sections currently make the homepage feel like an encyclopedia or generated documentation tree.
4. Which content should stay on the homepage, which should move to deeper pages, and which existing pages can receive moved links.
5. Any build or test command available in the repo.

Use the target storyline:
AI changes execution speed, but humans still own intent, risk, judgment, and evidence. ForgeSDLC is the methodology for governed human + agent software delivery.

Do not invent product claims, customers, metrics, certifications, or integrations.
```

## Prompt 2 - homepage rewrite

```text
Implement a first-pass homepage redesign for forgesdlc.com.

Goal:
Make the homepage bold, spacious, enterprise-looking, and clear within the first screen.

Use this page structure:
1. Hero
   - Headline: "Govern software delivery across humans and AI agents."
   - Subhead: "ForgeSDLC helps teams shape intent, delegate safely, challenge AI output, and release with evidence, so speed does not come at the cost of judgment or control."
   - Primary CTA: "Explore the methodology"
   - Secondary CTA: "See how agents fit"
   - Add or preserve a simple visual flow: Intent -> Spark -> Charge -> Human/Agent execution -> Versona challenge -> Evidence -> Release.
2. Why now
   - Explain that AI changes execution speed, but not accountability.
3. How it works
   - Use 4 to 6 steps.
   - Explain Forge terms in plain language before using them heavily.
4. What teams get
   - Three outcome cards: Clear intent, Safer delegation, Reviewable delivery.
5. Built for
   - Role cards for engineering leaders, product/architecture leaders, agent-enabled teams, and enterprises adopting AI delivery.
6. Trust model
   - Humans own binding decisions.
   - Versonas challenge outputs at decision points.
   - Ember logs and evidence gates make decisions reviewable.
7. Ecosystem fit
   - Link Lenses, LCDL, Fleet, Platform, and Blueprints with one-line descriptions.
8. Final CTA
   - "Start with the methodology" and "Browse the knowledge base".

Constraints:
- Keep the page concise.
- Do not show a full generated docs tree on the homepage.
- Preserve existing canonical content by moving or linking it, not deleting it.
- Do not invent unsupported claims.
- Reuse existing CSS/design system if available.
- Add semantic headings and alt text for any diagram.

After editing, summarize changed files and any content moved deeper.
```

## Prompt 3 - navigation cleanup

```text
Improve the forgesdlc.com navigation and information architecture without removing important pages.

Goal:
Make the public nav curated and enterprise-friendly while keeping deep content accessible.

Recommended global nav groups:
- Why Forge
- How it works
- Who it is for
- Knowledge base
- For Agents
- Blueprints

Recommended homepage-visible links:
- What is ForgeSDLC?
- Methodology overview
- Agentic advantage
- Principles
- Adoption overview
- Blueprints handbook

Move long topic lists and generated indexes to Knowledge base or For Agents. The homepage and header should not display hundreds of links.

Add an ecosystem strip or footer section that links:
- ForgeSDLC
- Lenses
- LCDL
- Fleet
- Platform
- Blueprints

Verify all existing important pages remain reachable through at least one curated path.
```

## Prompt 4 - visual polish

```text
Polish the visual design of forgesdlc.com to feel bold, spacious, and enterprise-grade.

Apply these design moves:
- Increase hero whitespace and type hierarchy.
- Use a restrained dark/light theme with high contrast.
- Keep cards large and sparse; maximum three per row.
- Make CTAs visually distinct.
- Add a simple governed-flow diagram if no product screenshot exists.
- Use short section labels and large readable headings.
- Remove dense tables from the landing page flow.
- Ensure responsive layout works on mobile.
- Ensure visible focus states and semantic heading order.

Do not introduce a heavy animation library. Prefer CSS and existing components.
```

## Prompt 5 - QA

```text
Run a QA pass for forgesdlc.com after the UX changes.

Check:
1. The first screen answers what ForgeSDLC is, who it is for, what it does, why it is trustworthy, and what to do next.
2. The homepage is not a generated documentation index.
3. Technical or encyclopedic detail is linked through Knowledge, Practice, For Agents, or Blueprints.
4. All CTAs resolve.
5. All moved content is still reachable.
6. Header and mobile navigation work.
7. Headings are semantic.
8. Focus states are visible.
9. Any diagram has alt text.
10. No invented customer, certification, security, or performance claims were added.

Fix issues you can verify from the repo. Then provide a final diff summary and any unresolved questions.
```
