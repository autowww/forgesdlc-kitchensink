"""Controls page — buttons, badges, callouts, code blocks."""
from __future__ import annotations

PAGE = {
    "slug": "controls",
    "title": "Controls",
    "intro": "Buttons, badges, callouts, code blocks.",
    "family": "Components",
    "layout": "showcase",
    "order": 3,
    "toc": [
        ("sec-buttons", "Buttons"),
        ("sec-badges", "Badges"),
        ("sec-callouts", "Callouts"),
        ("sec-code", "Code blocks"),
    ],
}


def render() -> str:
    return """\
<section id="sec-buttons" class="ks-section">
  <h2 class="ks-section-title">Buttons</h2>
  <p class="forge-support mb-3">Three button variants built on Bootstrap's <code>.btn</code> base.</p>
  <div class="d-flex flex-wrap gap-3 align-items-center mb-3">
    <button class="btn btn-forge">Primary (Forge)</button>
    <button class="btn btn-forge-outline">Outline amber</button>
    <button class="btn btn-cyan-outline">Outline cyan</button>
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.btn-forge</code> · <code>.btn-forge-outline</code> · <code>.btn-cyan-outline</code></p>
  </div>
</section>

<section id="sec-badges" class="ks-section">
  <h2 class="ks-section-title">Badges</h2>
  <p class="forge-support mb-3">Compact labels with color-coded backgrounds.</p>
  <div class="d-flex flex-wrap gap-2 mb-3">
    <span class="forge-badge badge-cyan">Cyan</span>
    <span class="forge-badge badge-amber">Amber</span>
    <span class="forge-badge badge-emerald">Emerald</span>
    <span class="forge-badge badge-red">Red</span>
    <span class="forge-badge badge-dim">Dim</span>
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.forge-badge</code> + <code>.badge-cyan</code> / <code>.badge-amber</code> / <code>.badge-emerald</code> / <code>.badge-red</code> / <code>.badge-dim</code></p>
  </div>
</section>

<section id="sec-callouts" class="ks-section">
  <h2 class="ks-section-title">Callouts / Alerts</h2>
  <p class="forge-support mb-3">Contextual callout boxes for tips, warnings, and status messages.</p>
  <div class="forge-callout forge-callout-cyan mb-3">
    <p class="callout-label text-cyan">Info</p>
    <p class="mb-0">Cyan callout — informational context or tips.</p>
  </div>
  <div class="forge-callout forge-callout-amber mb-3">
    <p class="callout-label text-amber">Warning</p>
    <p class="mb-0">Amber callout — caution or important notes.</p>
  </div>
  <div class="forge-callout forge-callout-emerald mb-3">
    <p class="callout-label" style="color:var(--forge-emerald)">Success</p>
    <p class="mb-0">Emerald callout — success or positive outcome.</p>
  </div>
  <div class="forge-callout forge-callout-red mb-3">
    <p class="callout-label" style="color:#EF4444">Error</p>
    <p class="mb-0">Red callout — errors or critical warnings.</p>
  </div>
  <div class="forge-callout forge-callout-surface">
    <p class="callout-label">Surface</p>
    <p class="mb-0">Surface callout — neutral container.</p>
  </div>
</section>

<section id="sec-code" class="ks-section">
  <h2 class="ks-section-title">Code Blocks &amp; Inline</h2>
  <p class="forge-support mb-3">Inline <code>code</code> and <kbd>Ctrl+K</kbd> keyboard shortcut styling.</p>
  <div class="forge-code">
<span class="keyword">def</span> forge_spark(backlog, agent):
    <span class="comment"># AI-native delivery loop</span>
    task = backlog.<span class="highlight">pop</span>()
    result = agent.execute(task)
    <span class="keyword">return</span> result
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.forge-code</code> · <code>.keyword</code> · <code>.highlight</code> · <code>.comment</code></p>
  </div>
</section>"""
