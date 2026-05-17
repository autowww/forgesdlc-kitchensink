# LCDL site prompt pack

Target site: `lcdl.forgesdlc.com`

## Site role

LCDL is the governed LLM task layer. It should help Python teams turn LLM prompts into versioned, schema-aware, testable, reviewable software components.

## Primary UX goal

Make LCDL feel like an enterprise developer product, not just generated reference docs. The homepage should explain why LCDL exists, how it makes LLM calls reliable, and where developers should start.

## Target storyline

LLM calls are becoming part of production software, but many systems scatter prompts, parsing logic, retries, and model transport quirks across the codebase. LCDL turns LLM work into explicit tasks with contracts, schemas, stable result types, validation, repair hooks, and deterministic composition.

Recommended narrative arc:

1. LLM workflows are useful but fragile when prompts are scattered.
2. Production systems need contracts, validation, predictable failure, and reviewable task definitions.
3. LCDL makes LLM calls behave like software components.
4. Developers define tasks, validate outputs, compose workflows, and handle Ok/Err paths.
5. Teams get safer LLM adoption without burying prompt logic across the app.

## Recommended product one-liner

LCDL is a governed task layer for reliable LLM calls in Python systems.

## Homepage hero direction

Headline options:

- Build reliable LLM workflows in Python.
- Turn prompts into governed software components.
- Ship LLM tasks with contracts and schemas.

Preferred subhead:

LCDL turns prompts into versioned, schema-aware, testable tasks, so Python systems can use LLMs with clearer contracts, validation, and reviewable outcomes.

Primary CTA:

- Run your first task

Secondary CTA:

- Browse the task model

## Recommended homepage structure

1. Hero
   - Product category and outcome.
   - Visual: Task ID -> Contract -> Model call -> Validation/Repair -> Ok/Err -> Host app.
2. Why LCDL
   - Scattered prompts create brittle systems.
   - LCDL centralizes task contracts and output expectations.
3. How it works
   - Define task.
   - Attach contract and schema.
   - Call through helper.
   - Validate/repair output.
   - Return stable result.
4. What developers get
   - Versioned task definitions.
   - Schema-aware outputs.
   - Predictable Ok/Err handling.
   - Composable operators.
5. Enterprise trust pattern
   - Host app owns data and policy.
   - LCDL owns task contract and result boundaries.
   - Tests can verify behavior.
   - Model transport is not hidden magic.
6. Role paths
   - Python developer.
   - LLM workflow builder.
   - Platform engineer.
   - Security/reviewer.
7. Ecosystem fit
   - LCDL is the governed reasoning layer inside Forge.

## Content to move deeper

Move or keep outside the homepage:

- Full API reference.
- All task catalog internals.
- Schema sidecar implementation details.
- Detailed operator reference.
- Maintainer notes.
- Generated docs tree.

Keep a visible quickstart and link to reference.

## Prompt 1 - discovery and plan

```text
You are improving lcdl.forgesdlc.com using the Forge enterprise AI website standard.

Inspect the repo, homepage source, docs generator, navigation, task examples, and any existing design docs. Do not edit yet.

Produce a plan that identifies:
1. Homepage entry file(s).
2. Navigation/header/footer files.
3. Quickstart and reference pages that should be linked from the homepage.
4. Any existing LCDL hero or messaging docs that should become source of truth.
5. Sections that currently expose too much implementation detail too early.
6. Build/test commands.

Use this target storyline:
LLM calls should behave like software components. LCDL turns prompts into versioned, schema-aware, testable tasks with predictable success and failure paths.

Do not invent model support, integrations, benchmarks, compliance claims, or production guarantees.
```

## Prompt 2 - homepage rewrite

```text
Implement a first-pass LCDL homepage redesign.

Goal:
Make LCDL immediately understandable as a governed LLM task layer for Python systems.

Use this page structure:
1. Hero
   - Headline: "Build reliable LLM workflows in Python."
   - Subhead: "LCDL turns prompts into versioned, schema-aware, testable tasks, so Python systems can use LLMs with clearer contracts, validation, and reviewable outcomes."
   - Primary CTA: "Run your first task"
   - Secondary CTA: "Browse the task model"
   - Visual flow: Task ID -> Contract -> Model call -> Validation/Repair -> Ok/Err -> Host app.
2. Problem
   - Explain prompt sprawl, brittle JSON recovery, ad hoc retries, and hidden transport quirks in plain language.
3. How LCDL works
   - Define task.
   - Attach contract and schema.
   - Execute through helper.
   - Validate and repair output.
   - Return Ok/Err.
4. Outcome cards
   - Governed prompts.
   - Schema-aware outputs.
   - Predictable composition.
5. Trust boundaries
   - What LCDL owns.
   - What the host app owns.
   - What can be tested.
   - What is not hidden.
6. Developer paths
   - Quickstart.
   - Task catalog.
   - Operators.
   - Reference.
7. Ecosystem fit
   - LCDL as the governed reasoning layer for Forge.
8. Final CTA
   - "Start with a task" and "Open reference docs".

Constraints:
- Keep the homepage short and developer-readable.
- Do not dump full API reference on the landing page.
- Preserve technical reference by moving or linking it.
- Keep code examples small: one minimal example only if it improves clarity.
- Do not invent features.

After editing, summarize changed files and moved content.
```

## Prompt 3 - docs split and IA

```text
Reorganize LCDL information architecture for progressive disclosure.

Target structure:
- Overview
- Quickstart
- Concepts
  - Tasks
  - Contracts
  - Schemas
  - Results
  - Operators
- Guides
- API reference
- Maintainer notes
- Ecosystem

Tasks:
1. Ensure the homepage links to Quickstart, Concepts, and API reference without listing everything.
2. Move deep implementation details out of the homepage.
3. Create or update a Concepts landing page if missing.
4. Ensure navigation labels use user-facing language.
5. Add breadcrumbs or section context if supported by the existing site generator.
6. Keep existing URLs stable where practical; add redirects or cross-links when moving content.
```

## Prompt 4 - developer trust block

```text
Add or improve LCDL's enterprise/developer trust block.

The block should be concise and non-hype.

Include:
- Data boundary: LCDL runs in the host application's context; do not claim data isolation beyond repo truth.
- Task boundary: task IDs, contracts, and schemas define expected behavior.
- Output boundary: validation, repair, and Ok/Err results make failure explicit.
- Testing boundary: task behavior can be unit-tested or integration-tested where the repo supports it.
- Responsibility boundary: host app owns policy, secrets, model selection, and deployment controls unless the repo says otherwise.

Do not invent compliance certifications, audit guarantees, or security claims. Link to real docs if they exist.
```

## Prompt 5 - visual polish

```text
Polish LCDL visual design for a premium developer-product feel.

Apply:
- Spacious hero.
- Clear developer-oriented type hierarchy.
- One small code example or contract snippet, not a wall of code.
- A visual task lifecycle diagram.
- Three concise outcome cards.
- Trust block with a strong border or panel treatment.
- Clear Quickstart CTA.
- Responsive layout.
- Accessible contrast and focus states.

Avoid:
- Full reference tables on the homepage.
- Long generated sidebars in the hero path.
- Generic robot/AI decoration.
```

## Prompt 6 - QA

```text
Run QA for lcdl.forgesdlc.com after the UX changes.

Check:
1. A Python developer can understand LCDL in one sentence from the first screen.
2. The homepage explains tasks, contracts, schemas, validation, and Ok/Err without overwhelming the user.
3. Full API/reference detail is reachable but not dumped.
4. CTAs resolve.
5. Navigation is not a full generated docs tree on the landing page.
6. Any code snippet is valid or copied from existing repo examples.
7. No unsupported feature, model, compliance, or security claim was added.
8. Mobile layout, headings, focus states, and contrast are acceptable.

Fix verifiable issues and summarize final changes.
```
