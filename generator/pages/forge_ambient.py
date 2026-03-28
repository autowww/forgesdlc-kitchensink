"""Forge ambient — narrative SVG section backgrounds (forge-ambient-* API)."""
from __future__ import annotations

from html import escape

PAGE = {
    "slug": "forge-ambient",
    "title": "Forge ambient backgrounds",
    "intro": "Token-driven SVG atmosphere for sections — separate from component motion and the living-background system.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 7.25,
    "toc": [
        ("sec-overview", "Overview"),
        ("sec-aurora-flow", "Aurora flow"),
        ("sec-signal-river", "Signal river"),
        ("sec-mesh-bloom", "Mesh bloom"),
        ("sec-orbit-field", "Orbit field"),
        ("sec-contour-drift", "Contour drift"),
        ("sec-constellation-sweep", "Constellation sweep"),
        ("sec-modifiers", "Modifiers"),
        ("sec-reduced-motion", "Reduced motion"),
    ],
}

_STYLES = (
    (
        "aurora-flow",
        "Aurora flow",
        "Curved layered paths, dash drift, rare spark — ambiguity to direction.",
        "Hero · Orchestration",
        "forge-ambient--aurora-flow",
        "assets/svg/ambient/aurora-flow.svg",
    ),
    (
        "signal-river",
        "Signal river",
        "Horizontal wave bands — calm flow of information or process.",
        "Section · Product · Features",
        "forge-ambient--signal-river",
        "assets/svg/ambient/signal-river.svg",
    ),
    (
        "mesh-bloom",
        "Mesh bloom",
        "Nodes and soft links — coordination and connected systems.",
        "Methodology · System maps",
        "forge-ambient--mesh-bloom",
        "assets/svg/ambient/mesh-bloom.svg",
    ),
    (
        "orbit-field",
        "Orbit field",
        "Arcs and hub — governance, platforms, operating model.",
        "Platform · Governance",
        "forge-ambient--orbit-field",
        "assets/svg/ambient/orbit-field.svg",
    ),
    (
        "contour-drift",
        "Contour drift",
        "Topographic contours — structure emerging; light-theme friendly.",
        "Explanatory · Light sections",
        "forge-ambient--contour-drift",
        "assets/svg/ambient/contour-drift.svg",
    ),
    (
        "constellation-sweep",
        "Constellation sweep",
        "Sparse network with gentle shimmer — proofs, pathways, cases.",
        "Proof · Case study · Process walkthrough",
        "forge-ambient--constellation-sweep",
        "assets/svg/ambient/constellation-sweep.svg",
    ),
)


def extra_css() -> str:
    return """\
  <link rel="stylesheet" href="assets/forge-ambient-themes.css" />
  <link rel="stylesheet" href="assets/forge-ambient.css" />
  <link rel="stylesheet" href="assets/ks-animated-backgrounds.css" />
"""


def extra_js_paths() -> list[str]:
    return ["assets/ks-animated-backgrounds.js", "assets/forge-ambient.js"]


def _snippet(mod_class: str, src: str) -> str:
    lines = [
        f'<section class="forge-section forge-ambient {mod_class} forge-ambient--subtle forge-ambient--on-dark">',
        f'  <div class="forge-ambient-bg" data-ks-bg-src="{escape(src, quote=True)}" aria-hidden="true"></div>',
        '  <div class="forge-ambient-scrim" aria-hidden="true"></div>',
        '  <div class="forge-ambient-content">',
        "    <!-- foreground -->",
        "  </div>",
        "</section>",
    ]
    return escape("\n".join(lines))


def _demo_block(slug: str, src: str, *, light: bool = False) -> str:
    theme = " forge-ambient--on-light" if light else " forge-ambient--on-dark"
    bg = (
        "border border-secondary-subtle"
        if light
        else ""
    )
    style = ' style="min-height:11rem;background:#f4f7fb;color:#0f172a"' if light else ' style="min-height:11rem"'
    return f"""\
<div class="forge-ambient forge-ambient--{slug} forge-ambient--medium{theme} rounded overflow-hidden mb-2{bg}"{style}>
  <div class="forge-ambient-bg" data-ks-bg-src="{escape(src, quote=True)}" aria-hidden="true"></div>
  <div class="forge-ambient-scrim" aria-hidden="true"></div>
  <div class="forge-ambient-content p-4">
    <h3 class="h5 mb-1">{"Light surface" if light else "Dark surface"}</h3>
    <p class="mb-0 small opacity-75">Sample copy band — ambient stays behind scrim and content.</p>
  </div>
</div>"""


def _style_section(
    slug: str,
    title: str,
    desc: str,
    tags: str,
    mod_class: str,
    src: str,
) -> str:
    sid = f"sec-{slug}"
    return f"""\
<section id="{sid}" class="ks-section">
  <h2 class="ks-section-title">{escape(title)}</h2>
  <p class="forge-support mb-2">{escape(desc)}</p>
  <p class="small text-dim mb-3"><strong>Best for:</strong> {escape(tags)}</p>
  <div class="row g-3 mb-3">
    <div class="col-lg-6">
      <p class="section-label small mb-1">Dark</p>
      {_demo_block(slug, src, light=False)}
    </div>
    <div class="col-lg-6">
      <p class="section-label small mb-1">Light</p>
      {_demo_block(slug, src, light=True)}
    </div>
  </div>
  <div class="forge-callout forge-callout-surface">
    <p class="callout-label mb-1">Markup</p>
    <p class="small forge-support mb-2">Load <code>forge-ambient-themes.css</code>, <code>forge-ambient.css</code>, <code>ks-animated-backgrounds.css</code>, then <code>ks-animated-backgrounds.js</code> and <code>forge-ambient.js</code>. The background layer can use <code>.forge-ambient-bg</code> alone — fetch runs on <code>[data-ks-bg-src]</code>.</p>
    <pre class="mb-0" style="font-size:0.75rem;white-space:pre-wrap;word-break:break-word"><code>{_snippet(mod_class, src)}</code></pre>
  </div>
</section>"""


def render() -> str:
    sections = [
        """\
<section id="sec-overview" class="ks-section">
  <h2 class="ks-section-title">Overview</h2>
  <p class="forge-support mb-3">
    <strong>Forge ambient</strong> is a small narrative library for <em>section backgrounds</em> — parallel to
    <a href="motion.html">component motion</a> (pulse, breathe) and
    <a href="living-background.html">living background</a> (global scene + archetypes).
    For a broad SVG asset gallery see <a href="svg-backgrounds.html">SVG ambient backgrounds</a>.
  </p>
  <ul class="forge-support">
    <li><code>.forge-ambient</code> — positioning, overflow, token scope</li>
    <li><code>.forge-ambient-bg</code> — full-bleed SVG host (fetched via <code>data-ks-bg-src</code>)</li>
    <li><code>.forge-ambient-scrim</code> — optional readability tint (<code>--forge-ambient-scrim</code>)</li>
    <li><code>.forge-ambient-content</code> — foreground above the stack</li>
  </ul>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Intensity samples</p>
    <p class="small mb-2">Same style, three opacities:</p>
    <div class="forge-ambient forge-ambient--signal-river forge-ambient--subtle forge-ambient--on-dark rounded overflow-hidden mb-2" style="min-height:6rem">
      <div class="forge-ambient-bg" data-ks-bg-src="assets/svg/ambient/signal-river.svg" aria-hidden="true"></div>
      <div class="forge-ambient-scrim" aria-hidden="true"></div>
      <div class="forge-ambient-content p-2"><span class="small">Subtle</span></div>
    </div>
    <div class="forge-ambient forge-ambient--signal-river forge-ambient--medium forge-ambient--on-dark rounded overflow-hidden mb-2" style="min-height:6rem">
      <div class="forge-ambient-bg" data-ks-bg-src="assets/svg/ambient/signal-river.svg" aria-hidden="true"></div>
      <div class="forge-ambient-scrim" aria-hidden="true"></div>
      <div class="forge-ambient-content p-2"><span class="small">Medium</span></div>
    </div>
    <div class="forge-ambient forge-ambient--signal-river forge-ambient--hero forge-ambient--on-dark rounded overflow-hidden" style="min-height:6rem">
      <div class="forge-ambient-bg" data-ks-bg-src="assets/svg/ambient/signal-river.svg" aria-hidden="true"></div>
      <div class="forge-ambient-scrim" aria-hidden="true"></div>
      <div class="forge-ambient-content p-2"><span class="small">Hero</span></div>
    </div>
  </div>
</section>"""
    ]
    for slug, title, desc, tags, mod, src in _STYLES:
        sections.append(_style_section(slug, title, desc, tags, mod, src))
    sections.append(
        """\
<section id="sec-modifiers" class="ks-section">
  <h2 class="ks-section-title">Modifiers</h2>
  <p class="forge-support mb-3">Compose classes on the same element as <code>.forge-ambient</code>:</p>
  <table class="table table-sm table-dark forge-support" style="font-size:0.88rem">
    <thead><tr><th>Class</th><th>Role</th></tr></thead>
    <tbody>
      <tr><td><code>forge-ambient--subtle</code> · <code>--medium</code> · <code>--hero</code></td><td>Opacity, spark strength, scrim</td></tr>
      <tr><td><code>forge-ambient--cool</code> · <code>--warm</code> · <code>--neutral</code></td><td>Accent mix (cyan / amber / muted)</td></tr>
      <tr><td><code>forge-ambient--on-dark</code> · <code>--on-light</code></td><td>Line contrast for surface type</td></tr>
      <tr><td><code>forge-ambient--slow</code> · <code>--expressive</code> · <code>--still</code></td><td>CSS shimmer timing; <code>--still</code> pauses SMIL after load</td></tr>
    </tbody>
  </table>
</section>"""
    )
    sections.append(
        """\
<section id="sec-reduced-motion" class="ks-section">
  <h2 class="ks-section-title">Reduced motion &amp; performance</h2>
  <p class="forge-support mb-2">
    When the user enables <strong>prefers-reduced-motion: reduce</strong>, <code>ks-animated-backgrounds.js</code> pauses SMIL after inline injection.
    CSS shimmer helpers (<code>.fa-css-shimmer</code>) are disabled in <code>forge-ambient.css</code> under the same media query.
  </p>
  <p class="forge-support mb-0">
    Assets keep node counts low, avoid stacked blurs, and use long loop periods. Section <strong>height</strong> comes from layout — SVGs use <code>preserveAspectRatio=&quot;xMidYMid slice&quot;</code> to fill wide or tall areas.
  </p>
</section>"""
    )
    return "\n".join(sections)
