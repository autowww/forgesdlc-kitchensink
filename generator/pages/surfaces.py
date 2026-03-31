"""Surfaces & Layout page — glass panels, cards, bento grid, tables, dividers."""
from __future__ import annotations

PAGE = {
    "slug": "surfaces",
    "title": "Surfaces & Layout",
    "intro": "Glass panels, cards, cursor tilt tiles, bento grid, tables, dividers.",
    "family": "Foundation",
    "layout": "showcase",
    "order": 2,
    "toc": [
        ("sec-glass", "Glass panels"),
        ("sec-cards", "Cards"),
        ("sec-tilt-tiles", "Tilt tiles"),
        ("sec-bento", "Bento grid"),
        ("sec-tables", "Tables"),
        ("sec-dividers", "Dividers"),
    ],
}


def extra_js_paths() -> list[str]:
    return ["assets/ks-tilt-tiles.js"]


def render() -> str:
    return """\
<section id="sec-glass" class="ks-section">
  <h2 class="ks-section-title">Glassmorphic Panels</h2>
  <p class="forge-support mb-3">Three surface variants with backdrop blur and subtle border glow on hover.</p>
  <div class="row g-3">
    <div class="col-md-4"><div class="glass p-3"><p class="section-label text-cyan mb-1">Glass</p><p class="mb-0 forge-support">Cyan border on hover with glow.</p></div></div>
    <div class="col-md-4"><div class="glass-amber p-3"><p class="section-label text-amber mb-1">Glass Amber</p><p class="mb-0 forge-support">Amber border on hover with glow.</p></div></div>
    <div class="col-md-4"><div class="glass-solid p-3"><p class="section-label mb-1">Glass Solid</p><p class="mb-0 forge-support">Solid surface background.</p></div></div>
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.glass</code> · <code>.glass-amber</code> · <code>.glass-solid</code></p>
  </div>
</section>

<section id="sec-cards" class="ks-section">
  <h2 class="ks-section-title">Cards</h2>
  <p class="forge-support mb-3">Clickable cards with breathing border animation. Link and static variants.</p>
  <div class="row g-3">
    <div class="col-md-4">
      <a class="forge-card breathe-link" href="#">
        <p class="card-label">Cyan card</p>
        <h5 class="mt-2 mb-1">SDLC Handbook</h5>
        <p class="forge-support mb-0">Phases, ceremonies, and governance.</p>
      </a>
    </div>
    <div class="col-md-4">
      <a class="forge-card card-amber breathe-link" href="#">
        <p class="card-label">Amber card</p>
        <h5 class="mt-2 mb-1">Forge Methodology</h5>
        <p class="forge-support mb-0">AI-native delivery methodology.</p>
      </a>
    </div>
    <div class="col-md-4">
      <div class="forge-card breathe-static">
        <p class="card-label">Static card</p>
        <h5 class="mt-2 mb-1">Non-link card</h5>
        <p class="forge-support mb-0">Breathe-static effect on hover.</p>
      </div>
    </div>
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.forge-card</code> · <code>.card-amber</code> · <code>.breathe-link</code> · <code>.breathe-static</code></p>
  </div>
</section>

<section id="sec-tilt-tiles" class="ks-section">
  <h2 class="ks-section-title">Tilt tiles</h2>
  <p class="forge-support mb-3">Perspective tilt follows the pointer over each tile. Load <code>ks-tilt-tiles.js</code> and wrap a card in <code>.ks-tilt-wrap[data-ks-tilt]</code> with a single <code>.ks-tilt-inner</code> child. Optional <code>data-ks-tilt-max="12"</code> sets max tilt in degrees (default 10). Disabled when <code>prefers-reduced-motion</code> is set or the primary pointer is coarse.</p>
  <div class="row g-3">
    <div class="col-md-4">
      <div class="ks-tilt-wrap" data-ks-tilt data-ks-tilt-max="11">
        <a class="ks-tilt-inner forge-card breathe-link" href="#sec-tilt-tiles">
          <p class="card-label">Tilt link</p>
          <h5 class="mt-2 mb-1">Pointer parallax</h5>
          <p class="forge-support mb-0">Move the cursor across this card.</p>
        </a>
      </div>
    </div>
    <div class="col-md-4">
      <div class="ks-tilt-wrap" data-ks-tilt>
        <a class="ks-tilt-inner forge-card card-amber breathe-link" href="#sec-tilt-tiles">
          <p class="card-label">Amber tilt</p>
          <h5 class="mt-2 mb-1">Same behavior</h5>
          <p class="forge-support mb-0">Uses default max degrees.</p>
        </a>
      </div>
    </div>
    <div class="col-md-4">
      <div class="ks-tilt-wrap" data-ks-tilt data-ks-tilt-max="8">
        <div class="ks-tilt-inner forge-card breathe-static">
          <p class="card-label">Static tilt</p>
          <h5 class="mt-2 mb-1">Non-link tile</h5>
          <p class="forge-support mb-0">Inner can be a div, not only anchors.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Markup</p>
    <p class="mb-0"><code>.ks-tilt-wrap[data-ks-tilt]</code> · <code>.ks-tilt-inner</code> · script <code>ks-tilt-tiles.js</code></p>
  </div>
</section>

<section id="sec-bento" class="ks-section">
  <h2 class="ks-section-title">Bento Grid</h2>
  <p class="forge-support mb-3">CSS grid with <code>.bento-3</code> for three equal columns, responsive to single column on mobile.</p>
  <div class="bento-grid bento-3">
    <div class="glass p-3"><p class="section-label text-cyan mb-1">Cell 1</p><p class="forge-support mb-0">Three-column bento.</p></div>
    <div class="glass p-3"><p class="section-label text-amber mb-1">Cell 2</p><p class="forge-support mb-0">Responsive — stacks on mobile.</p></div>
    <div class="glass p-3"><p class="section-label mb-1">Cell 3</p><p class="forge-support mb-0">Glass panels inside bento.</p></div>
  </div>
</section>

<section id="sec-tables" class="ks-section">
  <h2 class="ks-section-title">Tables</h2>
  <p class="forge-support mb-3">Wrap standard Bootstrap tables in <code>.forge-table-wrap</code> for themed styling.</p>
  <div class="forge-table-wrap">
    <table class="table table-striped mb-0">
      <thead><tr><th>Methodology</th><th>Type</th><th>Team size</th><th>Iteration</th></tr></thead>
      <tbody>
        <tr><td>Scrum</td><td>Agile</td><td>5–9</td><td>2-week sprint</td></tr>
        <tr><td>Kanban</td><td>Lean</td><td>Any</td><td>Continuous</td></tr>
        <tr><td>Forge</td><td>AI-native</td><td>1–3</td><td>Spark-driven</td></tr>
      </tbody>
    </table>
  </div>
</section>

<section id="sec-dividers" class="ks-section">
  <h2 class="ks-section-title">Dividers</h2>
  <p class="forge-support">Gradient divider using <code>.forge-divider</code>:</p>
  <hr class="forge-divider">
  <p class="forge-support">Content continues after divider.</p>
</section>"""
