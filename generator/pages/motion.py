"""Motion page — pulse, breathe, and hover animations."""
from __future__ import annotations

PAGE = {
    "slug": "motion",
    "title": "Motion & Animation",
    "intro": "Pulse, breathe, and hover effects.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 6,
    "toc": [
        ("sec-pulse", "Pulse"),
        ("sec-breathe", "Breathe"),
        ("sec-stats", "Stat counters"),
    ],
}


def render() -> str:
    return """\
<section id="sec-pulse" class="ks-section">
  <h2 class="ks-section-title">Pulse Animation</h2>
  <p class="forge-support mb-3">Continuous subtle border glow that draws attention.</p>
  <div class="row g-3">
    <div class="col-md-4"><div class="glass p-3 pulse text-center"><span class="section-label">Pulse cyan</span></div></div>
    <div class="col-md-4"><div class="glass-amber p-3 pulse-amber text-center"><span class="section-label">Pulse amber</span></div></div>
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.pulse</code> · <code>.pulse-amber</code></p>
  </div>
</section>

<section id="sec-breathe" class="ks-section">
  <h2 class="ks-section-title">Breathe Animation</h2>
  <p class="forge-support mb-3">Hover-activated border and shadow oscillation. Two variants: link (clickable) and static (decorative).</p>
  <div class="row g-3">
    <div class="col-md-4"><a class="forge-card breathe-link d-block text-center" href="#"><span class="section-label">Breathe link</span><br><span class="forge-support">Hover me</span></a></div>
    <div class="col-md-4"><div class="forge-card breathe-static text-center"><span class="section-label">Breathe static</span><br><span class="forge-support">Hover me</span></div></div>
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.breathe-link</code> · <code>.breathe-static</code></p>
  </div>
</section>

<section id="sec-stats" class="ks-section">
  <h2 class="ks-section-title">Stat Counters</h2>
  <p class="forge-support mb-3">Big-number tiles for dashboards using <code>.forge-stat</code>.</p>
  <div class="bento-grid bento-3">
    <div class="glass p-4 forge-stat">
      <div class="stat-value text-amber">12</div>
      <div class="stat-label">Methodologies</div>
    </div>
    <div class="glass p-4 forge-stat">
      <div class="stat-value text-cyan">42</div>
      <div class="stat-label">Handbook pages</div>
    </div>
    <div class="glass p-4 forge-stat">
      <div class="stat-value" style="color:var(--forge-emerald)">99%</div>
      <div class="stat-label">Coverage</div>
    </div>
  </div>
</section>"""
