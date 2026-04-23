"""Forge React primitives — static HTML examples for CSS shipped with optional KS React components."""
from __future__ import annotations

PAGE = {
    "slug": "forge-react-primitives",
    "title": "Forge React primitives",
    "intro": (
        "CSS and static markup aligned with <code>react/*.tsx</code> (Forge run surfaces). "
        "Lenses Studio loads <code>/__ks/css/forge-react-primitives.css</code> and syncs TSX via "
        "<code>npm run sync-kitchensink-react</code>. This page is a non-React grammar reference."
    ),
    "family": "Components",
    "layout": "showcase",
    "order": 3.4,
    "toc": [
        ("sec-run-header", "Run header & badges"),
        ("sec-kv", "Key / value grid"),
        ("sec-banner", "Status banner"),
        ("sec-stage", "Workflow stage bar"),
        ("sec-action", "Decision action bar"),
        ("sec-timeline", "Event timeline"),
        ("sec-diag", "Diagnostic panel"),
        ("sec-review", "Review panel"),
    ],
}


def extra_css() -> str:
    return '<link rel="stylesheet" href="assets/forge-react-primitives.css" />'


def render() -> str:
    # Dark shell tokens match Lenses enterprise-shell / Studio main column.
    shell = (
        'style="--le-bg:#0a0e17;--le-border:rgba(148,163,184,0.28);--le-muted:#94a3b8;--le-text:#e2e8f0;'
        "--le-bg-elevated:rgba(17,24,39,0.85);background:var(--le-bg);color:var(--le-text);"
        'padding:1rem 1.25rem;border-radius:0.5rem;border:1px solid var(--le-border)"'
    )
    return f"""\
<p class="forge-support mb-4">
  Canonical TSX: <code>forgesdlc-kitchensink/react/</code> —
  <code>ForgeRunHeader</code>, <code>ForgeKeyValueGrid</code>, <code>ForgeStatusBanner</code>,
  <code>ForgeWorkflowStageBar</code>, <code>ForgeDecisionActionBar</code>, <code>ForgeEventTimeline</code>,
  <code>ForgeDiagnosticPanel</code>, <code>ForgeReviewPanel</code>.
  Stylesheet: <code>css/forge-react-primitives.css</code> (copied to showcase <code>assets/</code>).
</p>

<section id="sec-run-header" class="ks-section">
  <h2 class="ks-section-title">Run header & badges</h2>
  <p class="forge-support mb-3">Enterprise header row: title, subtitle, badges, metadata slot, actions.</p>
  <div class="forge-callout forge-callout-surface mb-3">
    <p class="callout-label mb-1">React</p>
    <p class="mb-0"><code>ForgeRunHeader</code></p>
  </div>
  <div {shell}>
    <header class="ks-fe-run-header">
      <div class="ks-fe-run-header__top">
        <div class="ks-fe-run-header__titles">
          <h2 class="ks-fe-run-header__title">Remediation session</h2>
          <p class="ks-fe-run-header__subtitle">Project <strong>acme</strong> · cluster docs-debt</p>
        </div>
        <div class="ks-fe-run-header__actions"><span class="le-btn le-btn--small le-btn--ghost">Stop</span></div>
      </div>
      <ul class="ks-fe-run-header__badges" aria-label="Run badges">
        <li><span class="ks-fe-badge ks-fe-badge--info">SSE</span></li>
        <li><span class="ks-fe-badge ks-fe-badge--warning">Awaiting input</span></li>
      </ul>
    </header>
  </div>
</section>

<section id="sec-kv" class="ks-section">
  <h2 class="ks-section-title">Key / value grid</h2>
  <p class="forge-support mb-3">Dense metadata (<code>dl</code> grid).</p>
  <div class="forge-callout forge-callout-surface mb-3">
    <p class="callout-label mb-1">React</p>
    <p class="mb-0"><code>ForgeKeyValueGrid</code></p>
  </div>
  <div {shell}>
    <dl class="ks-fe-kvgrid ks-fe-kvgrid--dense" aria-label="Example metadata">
      <div class="ks-fe-kvgrid__row"><dt class="ks-fe-kvgrid__label">Session id</dt><dd class="ks-fe-kvgrid__value"><code>a1b2…</code></dd></div>
      <div class="ks-fe-kvgrid__row"><dt class="ks-fe-kvgrid__label">Tokens</dt><dd class="ks-fe-kvgrid__value">12,400</dd></div>
    </dl>
  </div>
</section>

<section id="sec-banner" class="ks-section">
  <h2 class="ks-section-title">Status banner</h2>
  <p class="forge-support mb-3">Prominent run state: cancelled, failed, awaiting, verified, etc.</p>
  <div class="forge-callout forge-callout-surface mb-3">
    <p class="callout-label mb-1">React</p>
    <p class="mb-0"><code>ForgeStatusBanner</code></p>
  </div>
  <div {shell}>
    <div class="ks-fe-banner ks-fe-banner--await" role="status">
      <div class="ks-fe-banner__body">
        <strong class="ks-fe-banner__title">Awaiting approval</strong>
        <div class="ks-fe-banner__desc">Review the proposed patch before apply.</div>
      </div>
    </div>
  </div>
</section>

<section id="sec-stage" class="ks-section">
  <h2 class="ks-section-title">Workflow stage bar</h2>
  <p class="forge-support mb-3">Horizontal pipeline with semantic per-node status.</p>
  <div class="forge-callout forge-callout-surface mb-3">
    <p class="callout-label mb-1">React</p>
    <p class="mb-0"><code>ForgeWorkflowStageBar</code></p>
  </div>
  <div {shell}>
    <ol class="ks-fe-stagebar" aria-label="Example stages">
      <li class="ks-fe-stagebar__step ks-fe-stagebar__node--completed"><span class="ks-fe-stagebar__connector" aria-hidden="true"></span><span class="ks-fe-stagebar__node"><span class="ks-fe-stagebar__label">Enrich</span></span></li>
      <li class="ks-fe-stagebar__step ks-fe-stagebar__node--active"><span class="ks-fe-stagebar__connector" aria-hidden="true"></span><span class="ks-fe-stagebar__node"><span class="ks-fe-stagebar__label">Draft</span></span></li>
      <li class="ks-fe-stagebar__step ks-fe-stagebar__node--pending"><span class="ks-fe-stagebar__connector" aria-hidden="true"></span><span class="ks-fe-stagebar__node"><span class="ks-fe-stagebar__label">Verify</span></span></li>
    </ol>
  </div>
</section>

<section id="sec-action" class="ks-section">
  <h2 class="ks-section-title">Decision action bar</h2>
  <p class="forge-support mb-3">Sticky toolbar for approve / reject / re-run / verify (host supplies buttons).</p>
  <div class="forge-callout forge-callout-surface mb-3">
    <p class="callout-label mb-1">React</p>
    <p class="mb-0"><code>ForgeDecisionActionBar</code></p>
  </div>
  <div {shell}>
    <div class="ks-fe-actionbar ks-fe-actionbar--sticky" role="toolbar" aria-label="Actions" style="position:relative">
      <div class="ks-fe-actionbar__inner">
        <span class="btn btn-sm btn-outline-secondary" style="pointer-events:none">Approve</span>
        <span class="btn btn-sm btn-outline-secondary" style="pointer-events:none">Reject</span>
      </div>
    </div>
  </div>
</section>

<section id="sec-timeline" class="ks-section">
  <h2 class="ks-section-title">Event timeline</h2>
  <p class="forge-support mb-3">Chronological cards with optional details toggle (interactive behavior in React).</p>
  <div class="forge-callout forge-callout-surface mb-3">
    <p class="callout-label mb-1">React</p>
    <p class="mb-0"><code>ForgeEventTimeline</code></p>
  </div>
  <div {shell}>
    <ol class="ks-fe-timeline" aria-label="Example timeline">
      <li class="ks-fe-timeline__item">
        <div class="ks-fe-timeline__rail" aria-hidden="true"></div>
        <div class="ks-fe-timeline__card">
          <div class="ks-fe-timeline__meta">
            <time class="ks-fe-timeline__ts" dateTime="2026-04-15T12:00:00Z">2026-04-15 12:00</time>
            <span class="ks-fe-timeline__state">completed</span>
          </div>
          <div class="ks-fe-timeline__summary">Token stats updated</div>
        </div>
      </li>
    </ol>
  </div>
</section>

<section id="sec-diag" class="ks-section">
  <h2 class="ks-section-title">Diagnostic panel</h2>
  <p class="forge-support mb-3">Summary first; raw JSON behind disclosure.</p>
  <div class="forge-callout forge-callout-surface mb-3">
    <p class="callout-label mb-1">React</p>
    <p class="mb-0"><code>ForgeDiagnosticPanel</code></p>
  </div>
  <div {shell}>
    <section class="ks-fe-diag" aria-labelledby="fe-diag-h">
      <h3 id="fe-diag-h" class="ks-fe-diag__title">Diagnostics</h3>
      <div class="ks-fe-diag__summary">Tasklet state: <strong>running</strong></div>
      <div class="ks-fe-diag__raw">
        <button type="button" class="ks-fe-diag__raw-toggle le-btn le-btn--small le-btn--ghost" disabled>Show raw JSON</button>
      </div>
    </section>
  </div>
</section>

<section id="sec-review" class="ks-section">
  <h2 class="ks-section-title">Review panel</h2>
  <p class="forge-support mb-3">Optional shell for diffs and approval layouts.</p>
  <div class="forge-callout forge-callout-surface mb-3">
    <p class="callout-label mb-1">React</p>
    <p class="mb-0"><code>ForgeReviewPanel</code></p>
  </div>
  <div {shell}>
    <section class="ks-fe-review" aria-label="Review">
      <div class="ks-fe-review__kicker">Patch</div>
      <h3 class="ks-fe-review__title">Proposed markdown</h3>
      <div class="ks-fe-review__body"><code>docs/README.md</code> — unified diff appears in Studio.</div>
    </section>
  </div>
</section>
"""
