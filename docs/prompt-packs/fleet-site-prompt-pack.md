# Fleet site prompt pack

Target site: `fleet.forgesdlc.com`

## Site role

Fleet is the controlled job execution layer of the Forge ecosystem. It should explain how teams run containerized automation jobs through a small, governed control plane on infrastructure they own.

## Primary UX goal

Make Fleet understandable to operators, platform engineers, security reviewers, and developers before showing endpoint-level details. The homepage should not start with low-level API, Docker, SQLite, or bearer-token implementation language.

## Target storyline

Automation is powerful, but enterprise teams need to know where it runs, who can trigger it, how it is bounded, and how results can be inspected. Fleet provides a controlled job plane for launching, tracking, and auditing containerized automation jobs used by Forge tools, scripts, and operators.

Recommended narrative arc:

1. Agentic work needs controlled execution, not hidden automation.
2. Fleet runs jobs on infrastructure the team controls.
3. Jobs move through a clear lifecycle: request -> template -> container job -> logs -> status -> evidence.
4. Operators get a small API and local job history.
5. Teams can connect Lenses, scripts, and workflows without turning the homepage into API reference.

## Recommended product one-liner

Fleet is a controlled job execution plane for automations on infrastructure you own.

## Homepage hero direction

Headline options:

- Run automation jobs with control and evidence.
- Controlled execution for Forge automation.
- Launch and track jobs on infrastructure you own.

Preferred subhead:

Fleet gives Forge tools and operators a token-protected control plane for running containerized jobs, tracking status, and keeping execution history on infrastructure you control.

Primary CTA:

- See how Fleet works

Secondary CTA:

- Open operator quickstart

## Recommended homepage structure

1. Hero
   - Plain-language value proposition.
   - Visual: Request -> job template -> container run -> logs -> status -> evidence.
2. Why Fleet
   - Automation needs clear boundaries.
   - Jobs should be visible, trackable, and reviewable.
3. How it works
   - Submit request.
   - Resolve template.
   - Run containerized job.
   - Capture logs/status.
   - Review history.
4. What teams get
   - Controlled execution.
   - Local/owned infrastructure.
   - Script and tool integration.
5. Trust model
   - Token-protected access.
   - Execution stays on configured host/infrastructure.
   - Job history/logs are inspectable according to repo truth.
   - Not a general cloud scheduler unless repo says otherwise.
6. Role paths
   - Operator.
   - Platform engineer.
   - Tool integrator.
   - Security reviewer.
7. Ecosystem fit
   - Fleet is the execution layer for Lenses and Forge workflows.
8. Final CTA
   - Install/operate path.
   - API reference path.

## Content to move deeper

Move or keep outside the homepage:

- Full `/v1/*` endpoint lists.
- Docker argv details.
- SQLite implementation details.
- Compose files and scripts.
- Maintainer notes.
- Deep telemetry details.

Keep a visible operator quickstart and link to API reference.

## Technical term translations

Use these translations on public pages:

- Bearer-aware HTTP control plane -> Token-protected job control plane.
- docker_argv jobs -> Containerized jobs.
- SQLite-backed -> Local job history.
- /v1/* JSON -> API for tools and scripts.
- One Linux host -> Runs on a host you control.

## Prompt 1 - discovery and plan

```text
You are improving fleet.forgesdlc.com using the Forge enterprise AI website standard.

Inspect the repo, homepage, docs, API reference, operator guides, templates, scripts, and navigation. Do not edit yet.

Produce a plan that identifies:
1. Homepage entry file(s).
2. Nav/header/footer files.
3. Operator quickstart and API reference pages.
4. Sections that currently expose endpoint, Docker, SQLite, or script detail too early.
5. Content that should move into Operate, API Reference, Templates, or Maintainer docs.
6. Build/test commands.

Use this target storyline:
Fleet is a controlled job execution plane for automations on infrastructure the team owns. It should lead with controlled execution, job visibility, and evidence before API detail.

Do not invent deployment modes, security guarantees, multi-tenancy, compliance claims, or integrations.
```

## Prompt 2 - homepage rewrite

```text
Implement a first-pass Fleet homepage redesign.

Goal:
Make Fleet clear to operators and platform teams before showing implementation detail.

Use this page structure:
1. Hero
   - Headline: "Run automation jobs with control and evidence."
   - Subhead: "Fleet gives Forge tools and operators a token-protected control plane for running containerized jobs, tracking status, and keeping execution history on infrastructure you control."
   - Primary CTA: "See how Fleet works"
   - Secondary CTA: "Open operator quickstart"
   - Visual flow: Request -> Template -> Container job -> Logs -> Status -> Evidence.
2. Why Fleet
   - Explain that agentic work needs controlled execution, not hidden automation.
3. How it works
   - Submit request.
   - Resolve job template.
   - Run containerized job.
   - Capture logs and status.
   - Inspect history.
4. Outcome cards
   - Controlled execution.
   - Owned infrastructure.
   - Tool-friendly API.
5. Trust boundaries
   - Token-protected control plane.
   - Configured host/infrastructure boundary.
   - Job history/log boundary based on repo truth.
   - Clear statement of what Fleet is not.
6. Role paths
   - Operator quickstart.
   - Platform integration.
   - API reference.
   - Security review.
7. Ecosystem fit
   - Explain how Lenses, scripts, and Forge workflows can use Fleet as an execution layer, only if supported by existing docs.
8. Final CTA
   - "Install Fleet" and "Open API reference".

Constraints:
- Do not lead with `/v1/*`, `docker_argv`, SQLite, or bearer-token jargon.
- Preserve all technical details by moving/linking them into docs/reference.
- Do not claim cloud scheduling, multi-tenant isolation, compliance, or enterprise SSO unless repo docs prove it.
- Keep the homepage concise and operator-friendly.

After editing, summarize changed files and moved content.
```

## Prompt 3 - operator IA

```text
Reorganize Fleet docs for operator-first information architecture.

Target structure:
- Overview
- How Fleet works
- Operator quickstart
- Job templates
- API reference
- Logs and history
- Security and boundaries
- Maintainer notes

Tasks:
1. Keep the homepage focused on the product promise and job lifecycle.
2. Create or update an Operator quickstart path.
3. Move endpoint-level details into API reference.
4. Move Docker/Compose/scripts into Operate or Maintainer docs.
5. Add a "What Fleet is not" block if it does not exist.
6. Ensure navigation labels use plain-language terms.
7. Preserve important deep docs through links.
```

## Prompt 4 - trust and security language

```text
Add or improve Fleet's trust and boundary section.

Use cautious, repo-supported language only.

Include:
- Access boundary: token-protected control plane if supported by docs.
- Execution boundary: jobs run on configured infrastructure/host.
- Job boundary: templates define allowed job shapes if supported by docs.
- Evidence boundary: status, logs, and job history are inspectable if supported by docs.
- Limitation boundary: not a general-purpose multi-tenant cloud scheduler unless explicitly documented.

Avoid:
- Security guarantees beyond repo truth.
- Compliance or certification claims.
- Claims about isolation, sandboxing, or audit retention unless implemented and documented.
```

## Prompt 5 - visual polish

```text
Polish Fleet for an enterprise operations-product feel.

Apply:
- Strong hero and clear job lifecycle diagram.
- Role cards for operator, integrator, and reviewer.
- Trust block with clear boundaries.
- API details moved below or into reference pages.
- Short code/API preview only if useful.
- Spacious sections and large cards.
- Responsive layout.
- Accessible contrast and focus states.

Avoid:
- Endpoint tables in the hero path.
- Dense script lists on the homepage.
- Generic infrastructure stock art.
```

## Prompt 6 - QA

```text
Run QA for fleet.forgesdlc.com after UX changes.

Check:
1. First screen explains Fleet without endpoint jargon.
2. Job lifecycle is visible and understandable.
3. Operator quickstart and API reference are easy to find.
4. Technical details were moved or linked, not lost.
5. Security/trust language is supported by existing docs.
6. No unsupported claims about multi-tenancy, cloud scheduling, compliance, or isolation were added.
7. CTAs resolve.
8. Mobile navigation works.
9. Headings, focus states, contrast, and alt text are acceptable.

Fix verifiable issues and summarize final changes.
```
