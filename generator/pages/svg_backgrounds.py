"""SVG ambient backgrounds gallery — slow looping patterns (asset preview)."""
from __future__ import annotations

import re
from datetime import datetime, timezone
from html import escape
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
_KS_SVG = _REPO_ROOT / "assets" / "svg"


def _read_svg(rel_path: str) -> str:
    p = _KS_SVG / rel_path
    return p.read_text(encoding="utf-8").strip()


def _uniquify_svg_ids(svg: str, suffix: str) -> str:
    """Avoid duplicate id / url(#id) when the same asset is inlined multiple times."""
    safe = re.sub(r"[^a-zA-Z0-9_-]", "_", suffix)

    def bump_id(m: re.Match[str]) -> str:
        return f'id="{m.group(1)}{safe}"'

    out = re.sub(r'\bid="([^"]+)"', bump_id, svg)

    def bump_url(m: re.Match[str]) -> str:
        return f"url(#{m.group(1)}{safe})"

    return re.sub(r"url\(#([^)]+)\)", bump_url, out)

PAGE = {
    "slug": "svg-backgrounds",
    "title": "SVG ambient backgrounds",
    "intro": "Slow SVG loops for section and card backdrops — includes Fourier FORGE spectral (masked lettering) under Sinusoids.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 7,
    "toc": [
        ("sec-overview", "Overview"),
        ("fam-dots", "Dots"),
        ("fam-field-mesh", "Field & mesh"),
        ("fam-sinusoids", "Sinusoids & signals"),
        ("asset-fourier-forge-spectral-01", "Fourier FORGE spectral"),
        ("asset-fourier-forge-spectral-animated-01", "Fourier FORGE animated"),
        ("fam-stars", "Stars"),
        ("fam-grids", "Grids & lattice"),
        ("fam-contours", "Contours"),
        ("fam-accents", "Orbits & accents"),
    ],
}

_CONTEXTS = (
    ("hero", "Hero crop", "<strong>Ambient hero</strong><br><span class='text-dim'>Secondary line under heading.</span>"),
    ("section", "Section", "Body copy band — readable with overlay tuning."),
    ("card", "Glass card", "<div class='glass'><span class='section-label'>Panel</span><br><span class='forge-support'>Glass over motion.</span></div>"),
    ("compact", "Compact", "<span class='section-label'>OK</span>"),
)


def extra_css() -> str:
    return """\
  <link rel="stylesheet" href="assets/ks-animated-backgrounds.css" />
  <link rel="stylesheet" href="assets/svg-background-gallery.css" />
"""


def extra_js_paths() -> list[str]:
    return ["assets/ks-animated-backgrounds.js", "assets/svg-background-gallery.js"]


# fmt: off
_ASSETS: list[dict] = [
    # Dots
    {"id": "dots-drift-01", "file": "backgrounds/dots/bg-dots-drift-01.svg", "title": "Dots drift", "fam": "Dots", "best": "Wide · Card · Compact", "note": "Sparse drift; buttons and callouts."},
    {"id": "dots-cluster-01", "file": "backgrounds/dots/bg-dots-cluster-01.svg", "title": "Dots cluster", "fam": "Dots", "best": "Card · Glass", "note": "Soft clusters; glass panels."},
    {"id": "dots-field-01", "file": "backgrounds/dots/bg-dots-field-01.svg", "title": "Dots field", "fam": "Dots", "best": "Section · Wide", "note": "Irregular sparse field."},
    {"id": "dots-pulse-01", "file": "backgrounds/dots/bg-dots-pulse-01.svg", "title": "Dots pulse", "fam": "Dots", "best": "Card · Compact", "note": "Gentle opacity breathing."},
    # Field & mesh (abstract networks — on-disk path still backgrounds/neurons/)
    {"id": "neurons-softmesh-01", "file": "backgrounds/neurons/bg-neurons-softmesh-01.svg", "title": "Soft mesh field", "fam": "Field & mesh", "best": "Hero · Wide", "note": "Delicate mesh; hero and headers."},
    {"id": "neurons-pulsegraph-01", "file": "backgrounds/neurons/bg-neurons-pulsegraph-01.svg", "title": "Linked pulse field", "fam": "Field & mesh", "best": "Section · Flow", "note": "Slow edge pulse along links."},
    {"id": "neurons-synapse-01", "file": "backgrounds/neurons/bg-neurons-synapse-01.svg", "title": "Sparse link graph", "fam": "Field & mesh", "best": "Glass · Card", "note": "Sparse asymmetric graph."},
    {"id": "neurons-cluster-01", "file": "backgrounds/neurons/bg-neurons-cluster-01.svg", "title": "Node cluster field", "fam": "Field & mesh", "best": "Card", "note": "Tight node group; small crops."},
    # Sinusoids & signal
    {"id": "sine-layered-01", "file": "backgrounds/sinusoids/bg-sine-layered-01.svg", "title": "Sine layered", "fam": "Sinusoids", "best": "Section · Typography", "note": "Layered waves; headings."},
    {"id": "sine-ribbon-01", "file": "backgrounds/sinusoids/bg-sine-ribbon-01.svg", "title": "Sine ribbon", "fam": "Sinusoids", "best": "Wide · Section", "note": "Single soft ribbon drift."},
    {"id": "sine-interference-01", "file": "backgrounds/sinusoids/bg-sine-interference-01.svg", "title": "Sine interference", "fam": "Sinusoids", "best": "Code · Diagram", "note": "Two-phase interference; calm."},
    {"id": "fourier-forge-spectral-01", "file": "backgrounds/sinusoids/bg-fourier-forge-spectral-01.svg", "title": "Fourier FORGE spectral", "fam": "Sinusoids", "best": "Hero · Brand", "note": "Harmonic sums (Fourier) masked into FORGE; detuned backdrop."},
    {"id": "fourier-forge-spectral-animated-01", "file": "backgrounds/sinusoids/bg-fourier-forge-spectral-animated-01.svg", "title": "Fourier FORGE spectral (animated)", "fam": "Sinusoids", "best": "Hero · Brand", "note": "Same motif; staggered SMIL drift + slow vertical breathe."},
    {"id": "signal-trace-01", "file": "backgrounds/signals/bg-signal-trace-01.svg", "title": "Signal trace", "fam": "Sinusoids", "best": "Table · Code", "note": "Trace line with slow sweep."},
    # Stars
    {"id": "stars-parallax-01", "file": "backgrounds/stars/bg-stars-parallax-01.svg", "title": "Stars parallax", "fam": "Stars", "best": "Hero · Footer", "note": "Layered depth drift."},
    {"id": "stars-drift-01", "file": "backgrounds/stars/bg-stars-drift-01.svg", "title": "Stars drift", "fam": "Stars", "best": "Section", "note": "Field drift; transition bands."},
    {"id": "stars-sparse-01", "file": "backgrounds/stars/bg-stars-sparse-01.svg", "title": "Stars sparse", "fam": "Stars", "best": "Modal · Card", "note": "Very sparse; previews."},
    # Grids
    {"id": "grid-pulse-01", "file": "backgrounds/grids/bg-grid-pulse-01.svg", "title": "Grid pulse", "fam": "Grids", "best": "Table · Data", "note": "Soft grid activation pulse."},
    {"id": "grid-shift-01", "file": "backgrounds/grids/bg-grid-shift-01.svg", "title": "Grid shift", "fam": "Grids", "best": "Code · Table", "note": "Slow phase shift grid."},
    {"id": "lattice-flow-01", "file": "backgrounds/grids/bg-lattice-flow-01.svg", "title": "Lattice flow", "fam": "Grids", "best": "Navigation · Cards", "note": "Diagonal lattice signal."},
    {"id": "hex-drift-01", "file": "backgrounds/grids/bg-hex-drift-01.svg", "title": "Hex drift", "fam": "Grids", "best": "Section", "note": "Sparse hex mesh drift."},
    # Contours
    {"id": "contour-flow-01", "file": "backgrounds/contours/bg-contour-flow-01.svg", "title": "Contour flow", "fam": "Contours", "best": "Hero · Narrative", "note": "Contour lines; editorial tech."},
    {"id": "contour-depth-01", "file": "backgrounds/contours/bg-contour-depth-01.svg", "title": "Contour depth", "fam": "Contours", "best": "Gallery · Wide", "note": "Layered contour depth."},
    {"id": "topology-soft-01", "file": "backgrounds/contours/bg-topology-soft-01.svg", "title": "Topology soft", "fam": "Contours", "best": "Hero · Section", "note": "Soft abstract terrain."},
    # Accents
    {"id": "orbit-minimal-01", "file": "backgrounds/orbits/bg-orbit-minimal-01.svg", "title": "Orbit minimal", "fam": "Accents", "best": "Compact · Badge", "note": "Minimal ring; small UI."},
    {"id": "orbit-node-01", "file": "backgrounds/orbits/bg-orbit-node-01.svg", "title": "Orbit node", "fam": "Accents", "best": "Card · Stat", "note": "Node + arc; tiles."},
    {"id": "signal-beacon-01", "file": "backgrounds/orbits/bg-signal-beacon-01.svg", "title": "Signal beacon", "fam": "Accents", "best": "Compact · Callout", "note": "Soft radial beacon pulse."},
    {"id": "pulse-ring-01", "file": "backgrounds/orbits/bg-pulse-ring-01.svg", "title": "Pulse ring", "fam": "Accents", "best": "Button · Badge", "note": "Expanding ring; not a spinner."},
]
# fmt: on


def _preview_cell(svg_body: str, hook: str, ctx: str, ctx_label: str, inner: str) -> str:
    return f"""    <div class="ks-bg-preview ks-bg-preview--{ctx}">
      <p class="ks-bg-preview-label">{escape(ctx_label)}</p>
      <div class="ks-bg-preview-frame">
        <div class="ks-has-ambient-bg">
          <div class="ks-ambient-bg ks-bg--{escape(hook)}" aria-hidden="true">{svg_body}</div>
          <div class="ks-ambient-bg-overlay" aria-hidden="true"></div>
          <div class="ks-content">{inner}</div>
        </div>
      </div>
    </div>"""


def _asset_card(a: dict) -> str:
    hook = a["id"]
    raw = _read_svg(a["file"])
    cells = []
    for i, (c, lab, inner) in enumerate(_CONTEXTS):
        svg_one = _uniquify_svg_ids(raw, f"-{hook}-c{i}")
        cells.append(_preview_cell(svg_one, hook, c, lab, inner))
    cells_joined = "\n".join(cells)
    return f"""<article class="ks-bg-gallery-card" id="asset-{escape(hook)}">
  <div class="ks-bg-gallery-card__head">
    <p class="ks-bg-gallery-card__title">{escape(a['fam'])}</p>
    <h3 class="ks-bg-gallery-card__name">{escape(a['title'])}</h3>
    <p class="ks-bg-gallery-card__meta">Best for: {escape(a['best'])} — {escape(a['note'])}</p>
    <p class="ks-bg-gallery-card__meta mb-0"><code>.ks-bg--{escape(hook)}</code> · <code>{escape(a['file'])}</code></p>
  </div>
  <div class="ks-bg-gallery-contexts">
{cells_joined}
  </div>
</article>"""


def render() -> str:
    by_fam: dict[str, list[dict]] = {}
    for a in _ASSETS:
        by_fam.setdefault(a["fam"], []).append(a)

    sections: list[str] = []
    fam_slugs = {
        "Dots": "fam-dots",
        "Field & mesh": "fam-field-mesh",
        "Sinusoids": "fam-sinusoids",
        "Stars": "fam-stars",
        "Grids": "fam-grids",
        "Contours": "fam-contours",
        "Accents": "fam-accents",
    }
    for fam_name in ("Dots", "Field & mesh", "Sinusoids", "Stars", "Grids", "Contours", "Accents"):
        items = by_fam.get(fam_name, [])
        if not items:
            continue
        sid = fam_slugs[fam_name]
        cards = "\n".join(_asset_card(x) for x in items)
        sections.append(
            f'<section id="{sid}" class="ks-section">\n'
            f'  <h2 class="ks-section-title">{escape(fam_name)}</h2>\n'
            f"{cards}\n"
            f"</section>"
        )

    toolbar = """<div class="ks-bg-gallery-toolbar ks-sticky-panel" role="group" aria-label="Gallery display options">
  <p class="forge-support mb-2 w-100" style="font-size:0.78rem">Motion is intentionally slow (multi-second to minute-scale loops): look for gentle drift and soft opacity pulses, not fast spins. If nothing moves, check system “reduce motion” and use <strong>Play animations</strong> below.</p>
  <p class="forge-support mb-2 w-100" style="font-size:0.78rem">Local preview: run <code>python3 generator/build-showcase.py</code> then serve the <code>showcase/</code> folder as the site root (e.g. <code>cd showcase &amp;&amp; python3 -m http.server 8080</code>) so <code>svg-backgrounds.html</code> and <code>assets/</code> resolve. View source and search for <code>&lt;svg</code> inside <code>.ks-ambient-bg</code> to confirm this build inlined the patterns. DevTools: use <code>?ksDebugBg=1</code> <strong>before</strong> any <code>#</code> hash (e.g. <code>svg-backgrounds.html?ksDebugBg=1#asset-fourier-forge-spectral-animated-01</code>), not after the hash.</p>
  <label>Overlay <select id="ks-bg-gallery-overlay" aria-label="Overlay strength">
    <option value="none" selected>None</option>
    <option value="soft">Soft</option>
    <option value="medium">Medium</option>
    <option value="strong">Strong</option>
  </select></label>
  <label>Density <select id="ks-bg-gallery-density" aria-label="Pattern density">
    <option value="low">Low</option>
    <option value="medium" selected>Medium</option>
    <option value="high">High</option>
  </select></label>
  <button type="button" class="btn btn-sm btn-outline-secondary" id="ks-bg-gallery-toggle-bg">Hide backgrounds</button>
  <button type="button" class="btn btn-sm btn-outline-secondary" id="ks-bg-gallery-pause">Pause animations</button>
</div>"""

    overview = """<section id="sec-overview" class="ks-section">
  <h2 class="ks-section-title">Overview</h2>
  <div class="forge-callout forge-callout-cyan mb-3">
    <p class="callout-label text-cyan mb-1">Fourier FORGE backdrops</p>
    <p class="forge-support mb-0">Spectral harmonic stacks masked into the word <strong>FORGE</strong> live in <a href="#fam-sinusoids">Sinusoids</a> — <a href="#asset-fourier-forge-spectral-01">static</a> and <a href="#asset-fourier-forge-spectral-animated-01">animated (SMIL)</a>. In the showcase sidebar: <strong>Patterns</strong> → <em>SVG ambient backgrounds</em> (this page is <code>svg-backgrounds.html</code>).</p>
  </div>
  <p class="forge-support mb-2">Optional ambient layers for the Forge design system. Use the wrapper pattern:</p>
  <pre class="p-3 rounded mb-3" style="background:var(--forge-surface-2);border:1px solid var(--forge-border);font-size:0.75rem;overflow:auto"><code>&lt;section class="ks-has-ambient-bg ks-bg-overlay--soft"&gt;
  &lt;div class="ks-ambient-bg ks-bg--dots-drift-01" data-ks-bg-src="assets/svg/backgrounds/dots/bg-dots-drift-01.svg" aria-hidden="true"&gt;&lt;/div&gt;
  &lt;div class="ks-ambient-bg-overlay" aria-hidden="true"&gt;&lt;/div&gt;
  &lt;div class="ks-content"&gt;…&lt;/div&gt;
&lt;/section&gt;</code></pre>
  <p class="forge-support mb-2">For a small set of <strong>narrative</strong> section styles (aurora, signal river, mesh, etc.) with shared modifiers, see <a href="forge-ambient.html">Forge ambient backgrounds</a> — parallel to this asset gallery.</p>
  <p class="forge-support mb-0">This gallery <strong>inlines</strong> each SVG at build time so previews work on any static host. Elsewhere, use <code>data-ks-bg-src</code> with <code>KsAmbientBg.init()</code> as needed. Full catalog: <code>docs/svg-background-catalog.md</code>.</p>
</section>"""

    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    body = (
        f"<!-- kitchensink svg-backgrounds gallery build {stamp} -->\n"
        f'<div id="ks-bg-gallery-root" class="ks-bg-overlay--none ks-bg-density--medium">\n'
        f"{toolbar}\n"
        f"{overview}\n"
        + "\n".join(sections)
        + "\n</div>"
    )
    return body
