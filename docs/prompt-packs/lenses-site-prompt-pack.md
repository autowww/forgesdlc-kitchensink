# Lenses site prompt pack

Target site: `lenses.forgesdlc.com`

## Site role

Lenses is the local-first workspace visibility and control-plane experience for Forge. It should feel like the most tangible product in the ecosystem because users can picture using a dashboard.

## Primary UX goal

Make Lenses feel like a flagship product page: visual, spacious, clear, and enterprise-trustworthy. The page should lead with the dashboard outcome, local-first posture, and guided workspace actions.

## Target storyline

Modern software work spans repos, plans, docs, generated outputs, boards, automation, and AI-assisted workflows. Teams need a local-first way to see what is happening, understand health, and guide the next safe action without giving up control of their workspace. Lenses provides that view.

Recommended narrative arc:

1. AI-assisted delivery creates more workspace state than humans can track manually.
2. Teams need visibility before they delegate or automate more work.
3. Lenses runs locally and shows plans, projects, documentation health, workshops, boards, and optional integration signals.
4. Users inspect, guide, and govern their workspace from one dashboard.
5. Teams keep control because local-first is the default posture.

## Recommended product one-liner

Lenses is a local-first control plane for inspecting and guiding Forge workspaces.

## Homepage hero direction

Headline options:

- See and govern your Forge workspace locally.
- Your local control plane for Forge work.
- Turn workspace sprawl into guided delivery.

Preferred subhead:

Forge Lenses gives teams a local-first dashboard for plans, projects, documentation health, workshop flows, and AI-assisted delivery signals without moving repos out of their control.

Primary CTA:

- Install and run Lenses

Secondary CTA:

- View local-first posture

## Recommended homepage structure

1. Hero
   - Product screenshot or high-fidelity dashboard mock if real screenshot is available.
   - If no screenshot exists, use a UI-style diagram.
2. What Lenses shows
   - Repos and projects.
   - Plans and requirements.
   - Documentation health.
   - Workshop flows.
   - Boards or delivery views if supported.
3. What users can do
   - Inspect state.
   - Find gaps.
   - Guide workshops.
   - Connect controlled automation where enabled.
4. Local-first trust posture
   - Runs locally or loopback by default if supported by docs.
   - Optional outbound integrations only where enabled.
   - Write scopes are explicit if supported.
5. Role paths
   - Developer.
   - Tech lead.
   - Product/BA.
   - Documentation owner.
   - Operator/security reviewer.
6. Ecosystem fit
   - Lenses visualizes ForgeSDLC/Blueprints workspace state.
   - LCDL may support governed LLM tasks.
   - Fleet may support controlled job execution.
7. Final CTA
   - Install/run.
   - Read trust posture.

## Content to move deeper

Move or keep outside the homepage:

- Long package internals.
- Full route map.
- Generated docs lists.
- Maintainer setup details.
- Deep storage format details.
- API endpoint details.

Keep install/run instructions visible, but concise.

## Prompt 1 - discovery and plan

```text
You are improving lenses.forgesdlc.com using the Forge enterprise AI website standard.

Inspect the repo, homepage, dashboard screenshots/assets, docs, routes, navigation, local-first/security posture docs, and install instructions. Do not edit yet.

Produce a plan that identifies:
1. Homepage entry file(s).
2. Header/footer/nav files.
3. Available screenshots or UI assets.
4. Install/run docs that should be linked from the hero.
5. Trust/local-first docs that should be featured.
6. Sections that are too detailed for the landing page.
7. Build/test commands.

Use this target storyline:
Lenses is the local-first control plane for inspecting and guiding Forge workspaces. It should lead with visibility, guided action, and local control.

Do not invent features, integrations, security guarantees, or write scopes.
```

## Prompt 2 - homepage rewrite

```text
Implement a first-pass Lenses homepage redesign.

Goal:
Make Lenses feel like the flagship tangible product experience in the Forge ecosystem.

Use this page structure:
1. Hero
   - Headline: "See and govern your Forge workspace locally."
   - Subhead: "Forge Lenses gives teams a local-first dashboard for plans, projects, documentation health, workshop flows, and AI-assisted delivery signals without moving repos out of their control."
   - Primary CTA: "Install and run Lenses"
   - Secondary CTA: "View local-first posture"
   - Use a real dashboard screenshot if available. If not, create a lightweight UI-style diagram using existing visual system.
2. What Lenses shows
   - Three to five cards: projects, plans, docs health, workshops, boards/automation if supported.
3. What teams can do
   - Inspect workspace state.
   - Find gaps and stale docs.
   - Guide workshops.
   - Trigger or connect controlled workflows only if supported.
4. Local-first trust block
   - Runs locally/loopback by default if supported.
   - Repos stay under user control.
   - Optional outbound integrations are explicit.
   - Write scopes are explicit if documented.
5. Role paths
   - Developer, lead, product/BA, documentation owner, operator/security reviewer.
6. Ecosystem fit
   - ForgeSDLC/Blueprints provide methodology and knowledge.
   - Lenses provides visibility.
   - LCDL supports governed reasoning where enabled.
   - Fleet supports controlled execution where enabled.
7. Final CTA
   - "Start locally" and "Read the trust posture".

Constraints:
- Do not overfill the homepage with internal route/docs lists.
- Preserve technical details by moving/linking them.
- Do not invent screenshots or claim features not present in the repo.
- Keep install instructions concise above the fold; full setup belongs in docs.

After editing, summarize changed files and moved content.
```

## Prompt 3 - product visual pass

```text
Improve the visual proof on the Lenses homepage.

Tasks:
1. Search for existing dashboard screenshots or product images.
2. If real screenshots exist, place the strongest one in the hero with descriptive alt text.
3. If no screenshot exists, create a simple UI preview component using existing styles. Do not misrepresent it as a screenshot.
4. Add a compact "workspace signals" visual that shows projects, docs health, workshops, and optional integrations.
5. Keep all visuals responsive.
6. Avoid generic AI/robot imagery.

The visual should make a visitor immediately understand that Lenses is usable software, not only documentation.
```

## Prompt 4 - local-first trust posture

```text
Add or improve the Lenses local-first trust posture section.

Use only repo-supported claims.

Include:
- Runtime boundary: local server/dashboard behavior if documented.
- Data boundary: repos/workspace stay under user control if supported.
- Network boundary: loopback/local by default if supported.
- Integration boundary: Fleet/LLM/outbound connections are optional or explicit if documented.
- Write boundary: what Lenses can write or modify if documented.
- Reviewer path: link to deeper trust/security docs.

Avoid unsupported claims about security certifications, privacy guarantees, or isolation.
```

## Prompt 5 - docs and nav cleanup

```text
Clean up Lenses navigation for product-first UX.

Target product nav:
- Overview
- Install
- What it shows
- Trust posture
- Guides
- Reference

Tasks:
1. Keep the homepage focused on overview and outcomes.
2. Move route maps, storage details, generated indexes, and maintainer notes into docs/reference.
3. Keep install/run path very easy to find.
4. Ensure local-first posture is visible from the homepage and nav.
5. Add ecosystem links to ForgeSDLC, LCDL, Fleet, Platform, and Blueprints where appropriate.
```

## Prompt 6 - QA

```text
Run QA for lenses.forgesdlc.com after UX changes.

Check:
1. First screen makes Lenses feel like a product/dashboard.
2. The local-first posture is visible and supported by docs.
3. Install/run CTA resolves.
4. Technical internals are linked but not dumped.
5. Any screenshot or visual is truthful and has alt text.
6. Optional integrations are not described as default unless docs prove it.
7. CTAs resolve.
8. Mobile layout works.
9. Headings, focus states, contrast, and link labels are acceptable.
10. No unsupported security or privacy claims were added.

Fix verifiable issues and summarize final changes.
```
