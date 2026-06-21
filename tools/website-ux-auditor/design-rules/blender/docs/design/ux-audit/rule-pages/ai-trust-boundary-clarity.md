---
rule_id: AI.TRUST.BOUNDARY_CLARITY
lane: ai
title: Trust boundary clarity
summary: Data, execution, and human-control boundaries are stated in plain language a first-time reader can map—without insider jargon or hand-wavy AI magic.
page_version: 05cfeed6895aa8ca26fa395f48d8fcdb271ad70f4e4ab826d0ccbb81537ecf2c
generated_at: 2026-05-28T16:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-trust-boundary-clarity
related_rules:
  - AI.GOVERNANCE.CREDIBILITY
  - AI.CREDIBILITY.NO_OVERCLAIM
  - AI.NARRATIVE.COHERENCE
  - AI.CONTEXT.COGNITIVE_CLARITY
  - AI.PREMIUM.ENTERPRISE_FEEL
  - DET.PROSE.LENGTH
  - DET.LANDMARKS.REQUIRED
---

## Purpose

Kitchen Sink **`landing_page`**, **`product_page`**, and **`forge-section`** trust bands must answer three operator questions without insider vocabulary: **where data lives**, **where work runs**, and **who can stop or approve it**. This AI rule judges whether those boundaries are **understandable without Forge-specific knowledge**—not whether the product is secure or compliant.

Deterministic checks (`DET.PROSE.LENGTH`, `DET.LANDMARKS.REQUIRED`) keep blocks readable and landmarked; they do **not** detect conflated “cloud + local + automated” copy, undefined control-plane jargon, or trust paragraphs that collapse data, execution, and human gates into one hand-wavy sentence. Reviewers apply this rule on heroes, trust strips, mechanism bands, and footer-adjacent policy copy.

**Plan:** Label every trust claim as **data**, **execution**, or **human control**; flag sentences that mix two or three without scope. **Do:** Split into three plain-language tiles or paragraphs; define jargon on first use or replace it. **Check:** A reader who does not know Forge can restate all three boundaries in their own words. **Adjust:** If the same conflation repeats (single “AI-powered secure cloud” band), propose a deterministic `DET.*` trust-block schema or required three-tile pattern.

## Passing signals

- Hero or `landing-hero-clarification` states **scope in plain language** (what stays on your machine vs what a hosted service touches) before mechanism vocabulary.
- Trust band uses **separate surfaces** for data, execution, and human control—`forge-card` tiles with `card-label` headings, not one paragraph that says “secure AI.”
- **Data boundary** names what is stored, transmitted, or logged (handbook files, job payloads, tokens)—and what is explicitly out of scope.
- **Execution boundary** names where code runs (local daemon, your container host, operator-launched job plane)—without implying “everything is automatic.”
- **Human-control boundary** names review gates, approval points, or kill switches—who can pause, reject, or override agent output.
- Jargon (`control plane`, `orchestrator`, `bearer token`) appears **only after** a plain-language gloss or link to a definition page.
- Mechanism steps in a later `forge-section` **reuse the same boundary words** as the trust band (`AI.NARRATIVE.COHERENCE`).
- “AI-enabled” or “agent” language is paired with **bounded delegation**—not magic, autopilot, or black-box shorthand.
- Links point to maintainable trust docs (`/trust#data-boundary`, `/trust#human-control`) rather than undefined “learn more.”

## Failing signals

- Single trust sentence bundles **data + execution + human control** (“enterprise-grade secure AI in the cloud”) with no separable claims.
- **Hand-wavy AI magic**: “powered by advanced AI,” “fully autonomous delivery,” “magic orchestration” without saying what runs where or who approves.
- **Insider-only trust copy**: control plane, tenancy, argv jobs, or hash governance named without a one-line plain-language definition for a public reader.
- **Boundary flip** within one band: “100% local” in the hero and “managed cloud sync” in the trust `forge-card` with no reconciliation.
- **Execution conflated with data**: “runs in your VPC” while copy also says telemetry and prompts are sent to a vendor API—without saying which is which.
- **Human control omitted** where the product delegates to agents: automation promised with no mention of review, approval, or operator override.
- Trust band is **only badges or superlatives** with no three-boundary structure (pair with `AI.CREDIBILITY.NO_OVERCLAIM` when claims are invented).
- Footer or hero CTA implies **zero operator responsibility** while docs describe human-owned delivery.

## Before example

Failing KS markup: one vague trust band, insider jargon, and conflated data / execution / human-control boundaries.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-boundary-fail"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="row align-items-center g-4 landing-hero-grid">
      <div class="col-12 col-xl-7 landing-hero-copy text-center text-xl-start">
        <p class="landing-hero-kicker mb-0">Job execution plane</p>
        <h1 class="font-display forge-gradient-text product-landing-title mb-3">
          AI-powered orchestration for modern teams
        </h1>
        <p class="forge-support landing-hero-tagline mb-4">
          Our intelligent control plane handles delivery end to end—secure, scalable, and effortless.
        </p>
        <div class="landing-hero-actions">
          <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-0">
            <a class="btn btn-forge" href="#">Start automating</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Tru" data-ks-hash="Tru" data-ks-type="section" data-ks-name="trust-boundary-vague">
  <div class="container">
    <p class="section-label text-cyan mb-2">Trust</p>
    <h2 class="h3 mb-4">Enterprise-grade by design</h2>
    <div class="forge-card p-4">
      <p class="forge-support mb-0">
        The platform uses AI agents and bearer-protected orchestration so jobs run safely in your environment.
        Data stays protected, execution is automated, and the service scales with your tenancy—no
        manual gates required. See the control plane docs for argv job semantics and SQLite catalogs.
      </p>
    </div>
  </div>
</section>
```

## After example

Passing KS markup: three separable boundaries in plain language, aligned hero clarification, and doc links.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-boundary-pass"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="row align-items-center g-4 landing-hero-grid">
      <div class="col-12 col-xl-7 landing-hero-copy text-center text-xl-start">
        <p class="landing-hero-kicker mb-0">Job execution plane</p>
        <h1 class="font-display forge-gradient-text product-landing-title mb-3">
          Run container jobs on infrastructure you operate
        </h1>
        <p class="forge-support landing-hero-tagline mb-2">
          Launch, track, and audit argv jobs through a token-protected API—not a black-box autopilot.
        </p>
        <p class="landing-hero-clarification forge-support mb-4">
          <strong>Data</strong> stays in your job store and logs on the host you configure.
          <strong>Execution</strong> is Docker argv work you trigger via the API.
          <strong>Control</strong> stays with operators who hold the bearer token and approve what runs.
        </p>
        <div class="landing-hero-actions">
          <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-0">
            <a class="btn btn-forge" href="/quickstart">Quickstart</a>
            <a class="btn btn-cyan-outline" href="/trust">Read trust model</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Tru" data-ks-hash="Tru" data-ks-type="section" data-ks-name="trust-boundary-clear">
  <div class="container">
    <p class="section-label text-cyan mb-2">Trust model</p>
    <h2 class="h3 mb-4">Three boundaries, plain language</h2>
    <div class="row g-3">
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust#data-boundary">
          <p class="card-label">Data</p>
          <h3 class="h5 mt-2 mb-1">What is stored where</h3>
          <p class="forge-support mb-0">
            Job history and local state live on the host you run—not in a shared multi-tenant
            datastore the vendor operates for you.
          </p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust#execution-boundary">
          <p class="card-label">Execution</p>
          <h3 class="h5 mt-2 mb-1">What runs on your metal</h3>
          <p class="forge-support mb-0">
            Container argv jobs start only when your operator calls the API; the plane does not silently
            run background agents against your repos.
          </p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust#human-control">
          <p class="card-label">Human control</p>
          <h3 class="h5 mt-2 mb-1">Who can stop work</h3>
          <p class="forge-support mb-0">
            Bearer tokens gate admin routes; you revoke access and cancel jobs—automation does not
            remove operator approval for new job types.
          </p>
        </a>
      </div>
    </div>
    <p class="forge-support mt-4 mb-0">
      Deeper mechanism (argv shape, catalogs) lives in maintainer docs—linked after these boundaries
      are clear.
    </p>
  </div>
</section>
```

## Evidence and remediation

**Capture:** screenshot of hero and trust band; copy inventory tagged **data / execution / human control**; list undefined terms (control plane, orchestrator, AI-powered); note contradictions with mechanism bands or linked docs; DOM path for `landing-hero-clarification` and `forge-card` trust tiles.

**Remediate (in order):**

1. **Split** any single trust paragraph into three claims—one sentence each for data, execution, and human control.
2. **Replace** hand-wavy AI magic with mechanism language (API-triggered jobs, local store, token gates).
3. **Define or remove** insider terms on first use; link jargon to `/trust` or `/docs` anchors.
4. **Align** hero, trust tiles, and “How it works” bands so boundary words match (`AI.NARRATIVE.COHERENCE`).
5. **Qualify** automation scope—what is delegated vs what requires operator action.
6. Re-run AI batch with `principleId: AI.TRUST.BOUNDARY_CLARITY`; set `deterministicCoverage` and propose a `DET.*` three-tile trust schema if the same conflation repeats.

## Related rules

- `AI.GOVERNANCE.CREDIBILITY` — trust, boundaries, and claims read bounded and operator-authentic.
- `AI.CREDIBILITY.NO_OVERCLAIM` — capabilities and proof are verifiable, not invented badges or metrics.
- `AI.NARRATIVE.COHERENCE` — trust copy does not contradict mechanism or hero claims mid-story.
- `AI.CONTEXT.COGNITIVE_CLARITY` — readers form a correct mental model before heavy jargon.
- `AI.PREMIUM.ENTERPRISE_FEEL` — calm trust presentation without hype stacking.
- `DET.PROSE.LENGTH` — readable block size (proxy for scannable trust copy).
- `DET.LANDMARKS.REQUIRED` — trust bands remain landmarked and navigable when split into tiles.
