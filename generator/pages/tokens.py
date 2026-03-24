"""Design Tokens page — color swatches, typography, CSS custom properties."""
from __future__ import annotations

PAGE = {
    "slug": "tokens",
    "title": "Design Tokens",
    "intro": "Colors, typography, spacing — the visual foundation.",
    "family": "Foundation",
    "layout": "showcase",
    "order": 1,
    "toc": [
        ("sec-colors", "Color palette"),
        ("sec-typography", "Typography"),
        ("sec-spacing", "Spacing & sizing"),
    ],
}


def render() -> str:
    return """\
<section id="sec-colors" class="ks-section">
  <h2 class="ks-section-title">Color Palette</h2>
  <p class="forge-support mb-3">Core tokens defined as CSS custom properties on <code>:root</code>.
  Use <code>var(--forge-*)</code> for all color references.</p>
  <div class="d-flex flex-wrap gap-3 mb-4">
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-bg)"></div><span class="ks-swatch-label">bg</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-surface)"></div><span class="ks-swatch-label">surface</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-surface-2)"></div><span class="ks-swatch-label">surface-2</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-amber)"></div><span class="ks-swatch-label">amber</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-cyan)"></div><span class="ks-swatch-label">cyan</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-orange)"></div><span class="ks-swatch-label">orange</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-emerald)"></div><span class="ks-swatch-label">emerald</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-text)"></div><span class="ks-swatch-label">text</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-text-2)"></div><span class="ks-swatch-label">text-2</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-text-3)"></div><span class="ks-swatch-label">text-3</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-text-4)"></div><span class="ks-swatch-label">text-4</span></div>
  </div>
  <div class="forge-callout forge-callout-cyan mb-3">
    <p class="callout-label text-cyan">Usage</p>
    <p class="mb-0">Always reference tokens via <code>var(--forge-amber)</code> rather than hard-coding hex values. This ensures theme-wide consistency.</p>
  </div>
</section>

<section id="sec-typography" class="ks-section">
  <h2 class="ks-section-title">Typography</h2>
  <h1 class="font-display">Display heading (Proxima Nova Black / 900)</h1>
  <h2>Heading 2</h2>
  <h3>Heading 3</h3>
  <p>Body text in Open Sans. Lorem ipsum dolor sit amet, <strong>bold text</strong>, <a href="#">cyan link</a>, and <code>inline code</code>.</p>
  <p class="forge-support">Support text — smaller, muted.</p>
  <p><span class="font-label">Label font</span> &nbsp; <span class="section-label">Section label</span></p>
  <p class="forge-gradient-text font-display" style="font-size:1.5rem">Gradient text (amber → cyan)</p>
  <p>
    <span class="text-amber">text-amber</span> &nbsp;
    <span class="text-cyan">text-cyan</span> &nbsp;
    <span class="text-dim">text-dim</span> &nbsp;
    <span class="text-dim-2">text-dim-2</span> &nbsp;
    <span class="text-muted-4">text-muted-4</span>
  </p>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Font stacks</p>
    <p class="mb-0"><code>--font-display</code> Proxima Nova Black 900 · body / <code>--font-label</code> Open Sans · <code>--font-mono</code> Courier New</p>
  </div>
</section>

<section id="sec-spacing" class="ks-section">
  <h2 class="ks-section-title">Spacing &amp; Sizing</h2>
  <p class="forge-support mb-3">The design system relies on Bootstrap 5's spacing utilities (<code>.p-*</code>, <code>.m-*</code>, <code>.gap-*</code>) combined with custom <code>max-width</code> constraints.</p>
  <div class="forge-table-wrap">
    <table class="table table-striped mb-0">
      <thead><tr><th>Token</th><th>Value</th><th>Usage</th></tr></thead>
      <tbody>
        <tr><td><code>max-width: 56rem</code></td><td>896px</td><td>Content column</td></tr>
        <tr><td><code>max-width: 64rem</code></td><td>1024px</td><td>Landing body</td></tr>
        <tr><td><code>gap: 3</code></td><td>1rem</td><td>Standard card gap</td></tr>
        <tr><td><code>gap: 4</code></td><td>1.5rem</td><td>Section gap</td></tr>
      </tbody>
    </table>
  </div>
</section>"""
